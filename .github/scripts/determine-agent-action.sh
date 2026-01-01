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

# FORCE MENTION-ONLY STRATEGY
# To prevent duplicate sessions, we ALWAYS use @jules mentions.
# The GitHub App will listen to these mentions.
METHOD="mention"
REASON="Enforced mention-only strategy (Jules App)"

if [[ -n "$GITHUB_OUTPUT" ]]; then
  echo "method=$METHOD" >> "$GITHUB_OUTPUT"
  echo "reason=$REASON" >> "$GITHUB_OUTPUT"
fi

# Output for eval usage (Shell integration)
echo "METHOD=\"$METHOD\""
echo "REASON=\"$REASON\""

# Print to stderr for logging
echo "[Decision] Method: $METHOD, Reason: $REASON" >&2
