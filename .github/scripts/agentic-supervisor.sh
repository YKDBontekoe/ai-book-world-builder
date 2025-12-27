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
fi

log "Context Resolved: PR=$IS_PR, #$NUMBER, Branch=$BRANCH"

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
if [[ "$EVENT_NAME" == "issue_comment" ]]; then
  if echo "$COMMENT_BODY" | grep -q "@jules"; then
    SHOULD_INVOKE_JULES="true"
    if [[ "$IS_PR" == "true" ]]; then
      JULES_PROMPT="User @$COMMENT_AUTHOR commented on PR #$NUMBER (Branch: $BRANCH): '$COMMENT_BODY'. Please address their request."
    else
      JULES_PROMPT="User @$COMMENT_AUTHOR commented on Issue #$NUMBER: '$COMMENT_BODY'. Please address their request. If code changes are needed, create a new branch."
    fi
  fi

  if [[ "$COMMENT_AUTHOR" == "coderabbitai[bot]" ]]; then
    if echo "$COMMENT_BODY" | grep -q "Prompt for AI Agents"; then
      SHOULD_INVOKE_JULES="true"
      JULES_PROMPT="CodeRabbit Review on PR #$NUMBER. Instructions: $COMMENT_BODY. Please implement these changes on branch '$BRANCH'."
    fi
  fi
fi

# Logic B: New Issue Labeled 'jules'
if [[ "$EVENT_NAME" == "issues" && "$EVENT_ACTION" == "labeled" && "$LABEL_NAME" == "jules" ]]; then
  SHOULD_INVOKE_JULES="true"
  JULES_PROMPT="Assigned Issue #$NUMBER: '$ISSUE_TITLE'. Description: $ISSUE_BODY. Please implement a solution on a new branch."
fi

# Logic C: CodeRabbit Trigger (Bot PRs)
if [[ "$IS_PR" == "true" ]]; then
  if [[ "$AUTHOR" == *"bot"* || "$AUTHOR" == "google-labs-jules" ]]; then
    if [[ "$EVENT_NAME" == "pull_request" && ( "$EVENT_ACTION" == "opened" || "$EVENT_ACTION" == "synchronize" ) ]]; then
      SHOULD_TRIGGER_CODERABBIT="true"
    fi
  fi
fi

# Logic D: Review Changes (Human or CodeRabbit)
if [[ "$EVENT_NAME" == "pull_request_review" && "$EVENT_ACTION" == "submitted" ]]; then

  # D.1 Human Review
  if [[ "$REVIEW_STATE" == "changes_requested" && "$REVIEW_AUTHOR" != "coderabbitai[bot]" ]]; then
    SHOULD_INVOKE_JULES="true"
    JULES_PROMPT="Reviewer @$REVIEW_AUTHOR requested changes on PR #$NUMBER: '$REVIEW_BODY'. Please address feedback on branch '$BRANCH'."
  fi

  # D.2 CodeRabbit Batch Review
  if [[ "$REVIEW_AUTHOR" == "coderabbitai[bot]" ]]; then
    log "Processing CodeRabbit review submission..."

    COMMENTS_DATA=""
    if [[ -n "$GH_TOKEN" ]]; then
      # Fetch review comments using GH CLI
      # GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments
      COMMENTS_DATA=$(gh api "/repos/${GITHUB_REPOSITORY}/pulls/${NUMBER}/reviews/${REVIEW_ID}/comments" --jq '.[] | "- File: \(.path) (Line \(.line // .original_line)): \(.body)"' 2>/dev/null || echo "")
    elif [[ -n "$MOCK_GH_CLI" ]]; then
      COMMENTS_DATA="- File: src/main.ts (Line 10): Fix typo\n- File: src/utils.ts (Line 5): Optimize loop"
    fi

    if [[ -n "$COMMENTS_DATA" ]]; then
      SHOULD_INVOKE_JULES="true"
      JULES_PROMPT="CodeRabbit Automatic Review for PR #$NUMBER (Branch: $BRANCH).

Review Summary:
$REVIEW_BODY

Detailed Comments:
$COMMENTS_DATA

Please address these issues."
    else
      log "No detailed comments found for CodeRabbit review."
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
