#!/bin/bash
set -e

# ==============================================================================
# Analyze Failures Logic
# ==============================================================================
#
# Inputs (Env Vars):
#   RESULTS_JSON: The JSON string of the 'needs' context
#   GITHUB_SERVER_URL: e.g. https://github.com
#   GITHUB_REPOSITORY: owner/repo
#   GITHUB_RUN_ID: 12345
#
# Outputs (GITHUB_OUTPUT):
#   failed_jobs: Multiline string of failed jobs
#   workflow_url: The URL to the workflow run
#
# ==============================================================================

if [[ -z "$RESULTS_JSON" ]]; then
  echo "Error: RESULTS_JSON is empty" >&2
  exit 1
fi

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

if [[ -n "$RESULTS_JSON" ]]; then
  # Parse JSON for failed jobs and steps from 'needs' context
  JOB_KEYS=$(echo "$RESULTS_JSON" | jq -r 'keys[]')
  for job in $JOB_KEYS; do
    result=$(echo "$RESULTS_JSON" | jq -r --arg k "$job" '.[$k].result')
    if [[ "$result" == "failure" || "$result" == "cancelled" ]]; then
      FAILED_JOBS="${FAILED_JOBS}\n- **$job**: $result"
    fi
  done
elif [[ -n "$GITHUB_RUN_ID" && -n "$GH_TOKEN" ]]; then
  # Fetch from API if RESULTS_JSON is missing (e.g. workflow_run event)
  # We target the specific run ID
  echo "Fetching failures from API for Run ID: $GITHUB_RUN_ID" >&2
  
  API_FAILURES=$(gh api "/repos/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}/jobs" --paginate \
    --jq '.jobs[] | select(.conclusion == "failure") | "- **\(.name)**: \(.steps[] | select(.conclusion == "failure") | .name // "unknown step")"' 2>/dev/null || echo "")
    
  if [[ -n "$API_FAILURES" ]]; then
    FAILED_JOBS="$API_FAILURES"
  fi
else
  echo "Error: Either RESULTS_JSON or (GITHUB_RUN_ID + GH_TOKEN) is required." >&2
  exit 1
fi

# Trim leading newline
FAILED_JOBS=$(echo -e "$FAILED_JOBS" | sed 's/^\\n//')

if [[ -z "$FAILED_JOBS" ]]; then
  FAILED_JOBS="No ignored failures found in needs context."
fi

WORKFLOW_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"

set_output "failed_jobs" "$FAILED_JOBS"
set_output "workflow_url" "$WORKFLOW_URL"

echo "Analysis Complete." >&2
echo "Failures found:" >&2
echo -e "$FAILED_JOBS" >&2
