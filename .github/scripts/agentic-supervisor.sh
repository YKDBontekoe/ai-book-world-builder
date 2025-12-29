#!/bin/bash
set -e

# ==============================================================================
# Agentic Supervisor Logic
# ==============================================================================

# ... (Logging and Helper functions remain the same) ...
log() {
  echo "[Supervisor] $1" >&2
}

set_output() {
  local key="$1"
  local val="$2"

  if [[ -n "$GITHUB_OUTPUT" ]]; then
    if [[ "$val" == *$'\n'* ]]; then
      local delimiter="EOF-$(date +%s)-$RANDOM"
      echo "$key<<$delimiter" >> "$GITHUB_OUTPUT"
      echo "$val" >> "$GITHUB_OUTPUT"
      echo "$delimiter" >> "$GITHUB_OUTPUT"
    else
      echo "$key=$val" >> "$GITHUB_OUTPUT"
    fi
  else
    echo "::set-output name=$key::$val"
  fi
}

get_json_val() {
  jq -r "$1 // empty" "$GITHUB_EVENT_PATH"
}

# 2. Extract Event Data
# ---------------------
if [[ ! -f "$GITHUB_EVENT_PATH" ]]; then
  log "Error: Event path not found at $GITHUB_EVENT_PATH"
  exit 1
fi

EVENT_NAME="${GITHUB_EVENT_NAME}"
EVENT_ACTION=$(get_json_val ".action")

log "Analyzing event: $EVENT_NAME ($EVENT_ACTION)"

# Initialize Variables
IS_PR="false"
NUMBER=""
BRANCH="main"
AUTHOR=""
LABELS=""

# Context: Pull Request
if [[ "$EVENT_NAME" == "pull_request" || "$EVENT_NAME" == "pull_request_review" ]]; then
  IS_PR="true"
  NUMBER=$(get_json_val ".pull_request.number")
  BRANCH=$(get_json_val ".pull_request.head.ref")
  AUTHOR=$(get_json_val ".pull_request.user.login")
  LABELS=$(get_json_val "[.pull_request.labels[].name] | join(\",\")")

# Context: Issue Comment
elif [[ "$EVENT_NAME" == "issue_comment" ]]; then
  NUMBER=$(get_json_val ".issue.number")
  AUTHOR=$(get_json_val ".issue.user.login")
  LABELS=$(get_json_val "[.issue.labels[].name] | join(\",\")")

  PR_URL=$(get_json_val ".issue.pull_request.url")

  if [[ -n "$PR_URL" ]]; then
    IS_PR="true"
    if [[ -n "$GH_TOKEN" ]]; then
      PR_DATA=$(gh pr view "$NUMBER" --json headRefName,author --repo "${GITHUB_REPOSITORY}" 2>/dev/null || echo "")
      if [[ -n "$PR_DATA" ]]; then
        BRANCH=$(echo "$PR_DATA" | jq -r ".headRefName")
        AUTHOR=$(echo "$PR_DATA" | jq -r ".author.login")
      fi
    elif [[ -n "$MOCK_GH_CLI" ]]; then
      BRANCH="mock-branch"
      AUTHOR="mock-pr-author"
    fi
  else
    IS_PR="false"
    BRANCH="main"
  fi

# Context: Issues
elif [[ "$EVENT_NAME" == "issues" ]]; then
  IS_PR="false"
  NUMBER=$(get_json_val ".issue.number")
  AUTHOR=$(get_json_val ".issue.user.login")
  LABELS=$(get_json_val "[.issue.labels[].name] | join(\",\")")
  BRANCH="main"

# Context: Workflow Run (from CI)
elif [[ "$EVENT_NAME" == "workflow_run" ]]; then
  SHA=$(get_json_val ".workflow_run.head_sha")
  if [[ -n "$GH_TOKEN" && -n "$SHA" ]]; then
    # Find PR associated with this commit
    PR_DATA=$(gh api "/repos/${GITHUB_REPOSITORY}/pulls" \
      --jq ".[] | select(.head.sha == \"$SHA\") | {number, headRefName, user: .user.login}" 2>/dev/null | head -1)

    if [[ -n "$PR_DATA" ]]; then
      IS_PR="true"
      NUMBER=$(echo "$PR_DATA" | jq -r ".number")
      BRANCH=$(echo "$PR_DATA" | jq -r ".headRefName")
      AUTHOR=$(echo "$PR_DATA" | jq -r ".user")
      log "Identified PR #$NUMBER from workflow_run SHA $SHA"
    else
      log "No PR found for workflow_run SHA $SHA"
      IS_PR="false"
    fi
  else
    log "Cannot process workflow_run without GH_TOKEN"
    IS_PR="false"
  fi
fi

log "Context Resolved: PR=$IS_PR, #$NUMBER, Branch=$BRANCH, Author=$AUTHOR"

# CRITICAL: Skip ALL Jules API invocations for PRs created by Jules itself
# Jules PRs should only use the CUSTOM_PAT token for actions, never spawn new Jules sessions
SKIP_JULES_INVOCATION="false"
if [[ "$IS_PR" == "true" && "$AUTHOR" == "google-labs-jules" ]]; then
  SKIP_JULES_INVOCATION="true"
  log "⚠️ Skipping Jules API invocation - PR was created by Jules. Use CUSTOM_PAT for any actions."
fi

# 3. Determine Intent
# -------------------
SHOULD_INVOKE_JULES="false"
SHOULD_TRIGGER_CODERABBIT="false"
JULES_PROMPT=""

COMMENT_BODY=""
COMMENT_AUTHOR=""
ISSUE_BODY=""
ISSUE_TITLE=""
REVIEW_BODY=""
REVIEW_AUTHOR=""
REVIEW_STATE=""
REVIEW_ID=""
LABEL_NAME=""

if [[ "$EVENT_NAME" == "issue_comment" ]]; then
  COMMENT_BODY=$(get_json_val ".comment.body")
  COMMENT_AUTHOR=$(get_json_val ".comment.user.login")
elif [[ "$EVENT_NAME" == "issues" ]]; then
  ISSUE_BODY=$(get_json_val ".issue.body")
  ISSUE_TITLE=$(get_json_val ".issue.title")
  LABEL_NAME=$(get_json_val ".label.name")
elif [[ "$EVENT_NAME" == "pull_request_review" ]]; then
  REVIEW_BODY=$(get_json_val ".review.body")
  REVIEW_AUTHOR=$(get_json_val ".review.user.login")
  REVIEW_STATE=$(get_json_val ".review.state")
  REVIEW_ID=$(get_json_val ".review.id")
fi

# Logic A: @Jules Mention
if [[ "$EVENT_NAME" == "issue_comment" && "$SKIP_JULES_INVOCATION" != "true" ]]; then
  # Skip if comment is from automated bots (prevents double invocation from CI auto-fix notifications)
  if [[ "$COMMENT_AUTHOR" == "github-actions[bot]" || "$COMMENT_AUTHOR" == "google-labs-jules" ]]; then
    log "Skipping @Jules detection for automated bot comment from $COMMENT_AUTHOR"
  elif echo "$COMMENT_BODY" | grep -qi "@jules"; then
    SHOULD_INVOKE_JULES="true"
    if [[ "$IS_PR" == "true" ]]; then
      JULES_PROMPT="User @$COMMENT_AUTHOR commented on PR #$NUMBER (Branch: $BRANCH): '$COMMENT_BODY'. Please address their request. Commit changes directly to the '$BRANCH' branch."
    else
      JULES_PROMPT="User @$COMMENT_AUTHOR commented on Issue #$NUMBER: '$COMMENT_BODY'. Please address their request. If code changes are needed, create a new branch."
    fi
  fi

  if [[ "$COMMENT_AUTHOR" == "coderabbitai[bot]" ]]; then
    if echo "$COMMENT_BODY" | grep -q "Prompt for AI Agents"; then
      SHOULD_INVOKE_JULES="true"
      JULES_PROMPT="CodeRabbit Review on PR #$NUMBER. Instructions: $COMMENT_BODY. Please implement these changes directly on branch '$BRANCH'."
    fi
  fi
fi

# Logic B: New Issue Labeled 'jules' (Issues are never from Jules, but keep consistent)
if [[ "$EVENT_NAME" == "issues" && "$EVENT_ACTION" == "labeled" && "$LABEL_NAME" == "jules" && "$SKIP_JULES_INVOCATION" != "true" ]]; then
  SHOULD_INVOKE_JULES="true"
  JULES_PROMPT="Assigned Issue #$NUMBER: '$ISSUE_TITLE'. Description: $ISSUE_BODY. Please implement a solution on a new branch."
fi

# Logic C: CodeRabbit Trigger (Bot PRs Only)
# Explicitly trigger CodeRabbit for bots because the native GitHub App often ignores them.
# We DO NOT trigger for humans here to avoid duplicate reviews (native app handles humans).
SHOULD_TRIGGER_CODERABBIT="false"

if [[ "$IS_PR" == "true" ]]; then
  # Only trigger if author is a known bot
  if [[ "$AUTHOR" == *"bot"* || "$AUTHOR" == "google-labs-jules" || "$AUTHOR" == "renovate[bot]" ]]; then

    # Trigger on:
    # 1. CI Completed (workflow_run) ONLY
    # We avoid triggering on 'pull_request' to prevent double-execution if CI is running,
    # and to ensure we only review code that passes tests (saving tokens).
    if [[ "$EVENT_NAME" == "workflow_run" ]]; then

      RECENT_CR="0"
      if [[ -n "$GH_TOKEN" ]]; then
        # Count CR comments in last 15 min (rate limit: 5 per 15min)
        RECENT_CR=$(gh api "/repos/${GITHUB_REPOSITORY}/issues/comments" \
          --jq '[.[] | select(.user.login == "coderabbitai[bot]" and
            ((.created_at | fromdateiso8601) > (now - 900)))] | length' 2>/dev/null || echo "0")
      fi

      if [[ "$RECENT_CR" -lt 5 ]]; then
        SHOULD_TRIGGER_CODERABBIT="true"
        log "Triggering CodeRabbit review for BOT user $AUTHOR"
      else
        log "Skipping CodeRabbit - rate limit reached"
      fi
    fi
  fi
fi

# Logic D: Review Changes (Human or CodeRabbit)
if [[ "$EVENT_NAME" == "pull_request_review" && "$EVENT_ACTION" == "submitted" && "$SKIP_JULES_INVOCATION" != "true" ]]; then

  # D.1 Human Review
  if [[ "$REVIEW_STATE" == "changes_requested" && "$REVIEW_AUTHOR" != "coderabbitai[bot]" ]]; then
    SHOULD_INVOKE_JULES="true"
    JULES_PROMPT="Reviewer @$REVIEW_AUTHOR requested changes on PR #$NUMBER: '$REVIEW_BODY'. Please address feedback. Commit changes directly to the '$BRANCH' branch."
  fi

  # D.2 CodeRabbit Batch Review - Collect ALL inline comments
  if [[ "$REVIEW_AUTHOR" == "coderabbitai[bot]" ]]; then
    log "CodeRabbit review submitted - collecting ALL inline comments..."

    COMMENTS_DATA=""
    if [[ -n "$GH_TOKEN" ]]; then
      # Fetch ALL CodeRabbit inline comments on this PR (not just this review)
      # This ensures we get all actionable feedback
      COMMENTS_DATA=$(gh api "/repos/${GITHUB_REPOSITORY}/pulls/${NUMBER}/comments" \
        --jq '[.[] | select(.user.login == "coderabbitai[bot]")] | 
          map("### \(.path):\(.line // .original_line)\n\(.body)") | join("\n\n---\n\n")' 2>/dev/null || echo "")
      
      COMMENT_COUNT=$(gh api "/repos/${GITHUB_REPOSITORY}/pulls/${NUMBER}/comments" \
        --jq '[.[] | select(.user.login == "coderabbitai[bot]")] | length' 2>/dev/null || echo "0")
      log "Found $COMMENT_COUNT CodeRabbit inline comments"
    elif [[ -n "$MOCK_GH_CLI" ]]; then
      COMMENTS_DATA="### src/main.ts:10\nFix typo\n\n---\n\n### src/utils.ts:5\nOptimize loop"
    fi

    if [[ -n "$COMMENTS_DATA" && "$COMMENTS_DATA" != "" ]]; then
      # Post comments as a new PR comment to trigger Jules via standard @Jules mechanism
      # This ensures Jules operates on the existing PR context instead of creating a new one
      log "Posting aggregated CodeRabbit comments to PR #$NUMBER to trigger Jules..."

      MESSAGE="@Jules Please address the following CodeRabbit review feedback:

$COMMENTS_DATA"

      # GitHub API has a ~65K byte limit for comment bodies. Check byte size.
      MESSAGE_BYTES=$(echo -n "$MESSAGE" | wc -c)
      if [[ $MESSAGE_BYTES -gt 65000 ]]; then
        log "WARNING: Aggregated comments exceed GitHub API limit ($MESSAGE_BYTES bytes). Truncating..."
        # Truncate conservatively to account for header and notice. Using head -c for byte safety.
        TRUNCATED_DATA=$(echo -n "$COMMENTS_DATA" | head -c 64000)
        MESSAGE="@Jules Please address the following CodeRabbit review feedback:

$TRUNCATED_DATA

... (truncated due to size - see CodeRabbit review for complete feedback)"
      fi

      GH_OUTPUT=$(gh pr comment "$NUMBER" --body "$MESSAGE" --repo "${GITHUB_REPOSITORY}" 2>&1)
      GH_EXIT_CODE=$?
      if [[ $GH_EXIT_CODE -eq 0 ]]; then
        # Do NOT invoke Jules directly in this pass - wait for the issue_comment event trigger
        SHOULD_INVOKE_JULES="false"
        log "Comment posted. Jules will be triggered by the resulting issue_comment event."
      else
        log "ERROR: Failed to post comment to PR (exit code $GH_EXIT_CODE): $GH_OUTPUT"
        log "Falling back to direct Jules invocation."
        SHOULD_INVOKE_JULES="true"

        # Truncate for fallback prompt if needed
        FALLBACK_DATA="$COMMENTS_DATA"
        if [[ $(echo -n "$FALLBACK_DATA" | wc -c) -gt 50000 ]]; then
            log "Truncating fallback prompt data..."
            FALLBACK_DATA="$(echo -n "$COMMENTS_DATA" | head -c 50000)

... (truncated - see CodeRabbit review for complete feedback)"
        fi
        JULES_PROMPT="CodeRabbit Review on PR #$NUMBER. Please address the following feedback:

$FALLBACK_DATA

Please commit changes directly to the '$BRANCH' branch."
      fi
    else
      log "No CodeRabbit inline comments found for this PR"
    fi
  fi
fi

# 4. Output Results
# -----------------
set_output "is_pr" "$IS_PR"
set_output "number" "$NUMBER"
set_output "branch" "$BRANCH"
set_output "author" "$AUTHOR"
set_output "labels" "$LABELS"
set_output "should_invoke_jules" "$SHOULD_INVOKE_JULES"
set_output "jules_prompt" "$JULES_PROMPT"
set_output "should_trigger_coderabbit" "$SHOULD_TRIGGER_CODERABBIT"

log "Done."
