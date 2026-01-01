#!/bin/bash
set -e

# ==============================================================================
# Determine Agent Action Logic
# ==============================================================================
#
# Inputs (Env Vars):
#   AUTHOR: The PR author
#   LABELS: The PR labels (comma-separated)
#
# Outputs (GITHUB_OUTPUT):
#   method: "api" | "mention" | "none"
#   reason: Description of the decision
#
# ==============================================================================

if [[ -z "$AUTHOR" ]]; then
  echo "Error: AUTHOR is required" >&2
  exit 1
fi

METHOD="none"
REASON=""

case "$AUTHOR" in
  "google-labs-jules")
    METHOD="mention"
    REASON="PR created by Jules"
    ;;
  "renovate[bot]")
    if [[ "$LABELS" == *"jules-invoked"* ]]; then
      METHOD="mention"
      REASON="Renovate PR with existing Jules session"
    else
      METHOD="api"
      REASON="First time on Renovate PR"
    fi
    ;;
  *)
    METHOD="api"
    REASON="Human-authored PR"
    ;;
esac

if [[ -n "$GITHUB_OUTPUT" ]]; then
  echo "method=$METHOD" >> "$GITHUB_OUTPUT"
  echo "reason=$REASON" >> "$GITHUB_OUTPUT"
fi

# Output for eval usage (Shell integration)
echo "METHOD=\"$METHOD\""
echo "REASON=\"$REASON\""

# Print to stderr for logging
echo "[Decision] Method: $METHOD, Reason: $REASON" >&2
