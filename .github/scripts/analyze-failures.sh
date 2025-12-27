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

FAILED_JOBS=""
# Parse JSON keys using jq
JOB_KEYS=$(echo "$RESULTS_JSON" | jq -r 'keys[]')

for job in $JOB_KEYS; do
  result=$(echo "$RESULTS_JSON" | jq -r ".$job.result")
  if [[ "$result" == "failure" || "$result" == "cancelled" ]]; then
    FAILED_JOBS="${FAILED_JOBS}\n- 🛑 $job ($result)"
  fi
done

# Trim leading newline if present
FAILED_JOBS=$(echo -e "$FAILED_JOBS" | sed 's/^\\n//')

WORKFLOW_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"

set_output "failed_jobs" "$FAILED_JOBS"
set_output "workflow_url" "$WORKFLOW_URL"

echo "Analysis Complete. Found failures: $FAILED_JOBS" >&2
