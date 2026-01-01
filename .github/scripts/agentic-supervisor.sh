#!/bin/bash
set -e

# ==============================================================================
# Agentic Supervisor Logic (v2.0)
# ==============================================================================
# Author-based invocation strategy:
# - Jules PRs: @jules mention only (free via GitHub integration)
# - Renovate PRs: API once (first failure), then @jules mentions
# - Human PRs: API invoke (need full context)
# ==============================================================================

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

# ==============================================================================
# 1. Extract Event Data
# ==============================================================================
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
      PR_DATA=$(gh pr view "$NUMBER" --json headRefName,author,labels --repo "${GITHUB_REPOSITORY}" 2>/dev/null || echo "")
      if [[ -n "$PR_DATA" ]]; then
        BRANCH=$(echo "$PR_DATA" | jq -r ".headRefName")
        AUTHOR=$(echo "$PR_DATA" | jq -r ".author.login")
        LABELS=$(echo "$PR_DATA" | jq -r '[.labels[].name] | join(",")')
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
    PR_DATA=$(gh api "/repos/${GITHUB_REPOSITORY}/pulls" \
      --jq ".[] | select(.head.sha == \"$SHA\") | {number, headRefName, user: .user.login, labels: [.labels[].name]}" 2>/dev/null | head -1)

    if [[ -n "$PR_DATA" ]]; then
      IS_PR="true"
      NUMBER=$(echo "$PR_DATA" | jq -r ".number")
      BRANCH=$(echo "$PR_DATA" | jq -r ".headRefName")
      AUTHOR=$(echo "$PR_DATA" | jq -r ".user")
      LABELS=$(echo "$PR_DATA" | jq -r '.labels | join(",")')
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

log "Context: PR=$IS_PR, #$NUMBER, Branch=$BRANCH, Author=$AUTHOR, Labels=$LABELS"

# ==============================================================================
# 2. AUTHOR-BASED INVOCATION STRATEGY
# ==============================================================================

INVOCATION_METHOD="none"  # "api" | "mention" | "none"
JULES_PROMPT=""
BATCHED_COMMENTS=""
SHOULD_TRIGGER_CODERABBIT="false"

# Helper: Read and interpolate prompt file
get_prompt() {
  local file=$1
  local prompt=$(cat ".github/prompts/$file" 2>/dev/null || echo "Error: Prompt file .github/prompts/$file not found")
  
  # Interpolate variables
  prompt="${prompt//\$NUMBER/$NUMBER}"
  prompt="${prompt//\$BRANCH/$BRANCH}"
  prompt="${prompt//\$AUTHOR/$AUTHOR}"
  prompt="${prompt//\$COMMENT_AUTHOR/$COMMENT_AUTHOR}"
  prompt="${prompt//\$COMMENT_BODY/$COMMENT_BODY}"
  prompt="${prompt//\$ISSUE_TITLE/$ISSUE_TITLE}"
  prompt="${prompt//\$ISSUE_BODY/$ISSUE_BODY}"
  prompt="${prompt//\$REVIEW_AUTHOR/$REVIEW_AUTHOR}"
  prompt="${prompt//\$REVIEW_BODY/$REVIEW_BODY}"
  prompt="${prompt//\$BATCHED_COMMENTS/$BATCHED_COMMENTS}"
  
  echo "$prompt"
}

# Helper: Check if jules-invoked label exists
has_jules_invoked_label() {
  [[ "$LABELS" == *"jules-invoked"* ]]
}

# Helper: Collect all CodeRabbit inline comments on this PR
collect_coderabbit_comments() {
  if [[ -n "$GH_TOKEN" && -n "$NUMBER" ]]; then
    gh api "/repos/${GITHUB_REPOSITORY}/pulls/${NUMBER}/comments" \
      --jq '[.[] | select(.user.login == "coderabbitai[bot]")] | 
        map("### \(.path):\(.line // .original_line)\n\(.body)") | join("\n\n---\n\n")' 2>/dev/null || echo ""
  else
    echo ""
  fi
}

# Extract comment/review data
COMMENT_BODY=""
COMMENT_AUTHOR=""
ISSUE_BODY=""
ISSUE_TITLE=""
REVIEW_BODY=""
REVIEW_AUTHOR=""
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
fi

# Helper: Determine standard invocation method using shared script
determine_standard_method() {
  # Run the shared script and capture variables (AUTHOR and LABELS must be exported or passed)
  eval $(export AUTHOR="$AUTHOR" LABELS="$LABELS"; .github/scripts/determine-agent-action.sh | grep "=")
  # Returns METHOD and REASON
}

# ==============================================================================
# LOGIC A: Manual @Jules Mention
# ==============================================================================
if [[ "$EVENT_NAME" == "issue_comment" ]]; then
  # Skip bot comments to prevent loops
  if [[ "$COMMENT_AUTHOR" == "github-actions[bot]" || "$COMMENT_AUTHOR" == "google-labs-jules" ]]; then
    log "Skipping - comment from bot: $COMMENT_AUTHOR"
  elif echo "$COMMENT_BODY" | grep -qi "@jules"; then
    log "Manual @jules mention from $COMMENT_AUTHOR"
    
    if [[ "$IS_PR" == "true" ]]; then
      determine_standard_method
      INVOCATION_METHOD="$METHOD"
      
      # Special handling for Manual Mentions:
      # If the standard way is "mention", and the user JUST mentioned, we don't need to do anything
      # (The native GitHub App will see the user's mention).
      if [[ "$INVOCATION_METHOD" == "mention" ]]; then
        log "Standard method is 'mention', but trigger was manual mention - letting GitHub App handle it."
        INVOCATION_METHOD="none"
      else
        # If standard is 'api', we need to invoke it manually
        JULES_PROMPT=$(get_prompt "manual-pr.md")
      fi


    else
      # Issues are always API for now
      INVOCATION_METHOD="api"
      JULES_PROMPT=$(get_prompt "manual-issue.md")
    fi
  fi
fi

# ==============================================================================
# LOGIC B: Issue Labeled 'jules'
# ==============================================================================
if [[ "$EVENT_NAME" == "issues" && "$EVENT_ACTION" == "labeled" && "$LABEL_NAME" == "jules" ]]; then
  INVOCATION_METHOD="api"
  JULES_PROMPT=$(get_prompt "manual-issue.md")
  log "Issue labeled 'jules' - will invoke API"
fi

# ==============================================================================
# LOGIC C: CodeRabbit Review Completed
# ==============================================================================
if [[ "$EVENT_NAME" == "pull_request_review" && "$REVIEW_AUTHOR" == "coderabbitai[bot]" ]]; then
  if echo "$REVIEW_BODY" | grep -qi "walkthrough"; then
    log "CodeRabbit review complete - batching comments..."
    
    BATCHED_COMMENTS=$(collect_coderabbit_comments)
    COMMENT_COUNT=$(echo "$BATCHED_COMMENTS" | grep -c "^###" || echo "0")
    log "Found $COMMENT_COUNT CodeRabbit inline comments"
    
    if [[ -n "$BATCHED_COMMENTS" && "$BATCHED_COMMENTS" != "" ]]; then
      
      determine_standard_method
      INVOCATION_METHOD="$METHOD"
      log "Determined method: $INVOCATION_METHOD ($REASON)"

      if [[ "$INVOCATION_METHOD" == "api" ]]; then
         # Select prompt based on author?
         # If Renovate (API) -> renovate-review.md
         # If Human (API) -> code-rabbit-review.md
         if [[ "$AUTHOR" == "renovate[bot]" ]]; then
            JULES_PROMPT=$(get_prompt "renovate-review.md")
         else
            JULES_PROMPT=$(get_prompt "code-rabbit-review.md")
         fi
      fi
      # If mention, we just leave it as "mention", and the workflow step 'jules-mention' handles it.
      
    else
      log "No CodeRabbit inline comments - skipping"
    fi
  fi
fi

# ==============================================================================
# LOGIC D: Human Review (Changes Requested)
# ==============================================================================
if [[ "$EVENT_NAME" == "pull_request_review" && "$REVIEW_AUTHOR" != "coderabbitai[bot]" ]]; then
  REVIEW_STATE=$(get_json_val ".review.state")
  
  if [[ "$REVIEW_STATE" == "changes_requested" ]]; then
    INVOCATION_METHOD="api"
    JULES_PROMPT=$(get_prompt "human-review.md")
    log "Human requested changes - will invoke API"
  fi
fi

# ==============================================================================
# LOGIC E: CodeRabbit Trigger (Bot PRs Only)
# ==============================================================================
if [[ "$IS_PR" == "true" && "$EVENT_NAME" == "workflow_run" ]]; then
  if [[ "$AUTHOR" == *"bot"* || "$AUTHOR" == "google-labs-jules" || "$AUTHOR" == "renovate[bot]" ]]; then
    RECENT_CR="0"
    if [[ -n "$GH_TOKEN" ]]; then
      RECENT_CR=$(gh api "/repos/${GITHUB_REPOSITORY}/issues/comments" \
        --jq '[.[] | select(.user.login == "coderabbitai[bot]" and
          ((.created_at | fromdateiso8601) > (now - 900)))] | length' 2>/dev/null || echo "0")
    fi

    if [[ "$RECENT_CR" -lt 5 ]]; then
      SHOULD_TRIGGER_CODERABBIT="true"
      log "Will trigger CodeRabbit for bot PR (Author: $AUTHOR)"
    else
      log "Skipping CodeRabbit - rate limit ($RECENT_CR in 15min)"
    fi
  fi
fi

# ==============================================================================
# 3. Output Results & Summary
# ==============================================================================

# Write GitHub Job Summary
if [[ -n "$GITHUB_STEP_SUMMARY" ]]; then
  {
    echo "### 🤖 Jules Supervisor Report"
    echo ""
    echo "| Metric | Value |"
    echo "| :--- | :--- |"
    echo "| **Context** | $EVENT_NAME |"
    # Only show PR/Issue if defined
    if [[ -n "$NUMBER" ]]; then
      echo "| **PR/Issue** | #$NUMBER |"
    fi
    echo "| **Author** | $AUTHOR |"
    echo "| **Invocation** | \`$INVOCATION_METHOD\` |"
    if [[ -n "$COMMENT_COUNT" && "$COMMENT_COUNT" != "0" ]]; then
      echo "| **Batched Comments** | $COMMENT_COUNT |"
    fi
  } >> "$GITHUB_STEP_SUMMARY"
  
  if [[ "$INVOCATION_METHOD" == "api" ]]; then
    echo "> **API Triggered**" >> "$GITHUB_STEP_SUMMARY"
  elif [[ "$INVOCATION_METHOD" == "mention" ]]; then
     echo "> **Mention Triggered**" >> "$GITHUB_STEP_SUMMARY"
  else
     echo "> No Action Taken" >> "$GITHUB_STEP_SUMMARY"
  fi
fi

set_output "is_pr" "$IS_PR"
set_output "number" "$NUMBER"
set_output "branch" "$BRANCH"
set_output "author" "$AUTHOR"
set_output "labels" "$LABELS"
set_output "invocation_method" "$INVOCATION_METHOD"
set_output "jules_prompt" "$JULES_PROMPT"
set_output "batched_comments" "$BATCHED_COMMENTS"
set_output "should_trigger_coderabbit" "$SHOULD_TRIGGER_CODERABBIT"

log "Final Decision: Method=$INVOCATION_METHOD"
log "Done."
