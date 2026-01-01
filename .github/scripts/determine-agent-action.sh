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

# Check label FIRST (Fallback/Override for any author context)
if [[ "$LABELS" == *"jules-invoked"* ]]; then
  METHOD="mention"
  REASON="Existing Jules session detected (label)"
else
  # Check Author
  case "$(echo "$AUTHOR" | tr '[:upper:]' '[:lower:]')" in
    *"jules"*)
      METHOD="mention"
      REASON="PR created by Jules"
      ;;
    "renovate[bot]")
      # Renovate without label = API (First time)
      METHOD="api"
      REASON="First time on Renovate PR"
      ;;
    *)
      # Human/Other without label = API (First time)
      METHOD="api"
      REASON="Human-authored or new context"
      ;;
  esac
fi

if [[ -n "$GITHUB_OUTPUT" ]]; then
  echo "method=$METHOD" >> "$GITHUB_OUTPUT"
  echo "reason=$REASON" >> "$GITHUB_OUTPUT"
fi

# Output for eval usage (Shell integration)
echo "METHOD=\"$METHOD\""
echo "REASON=\"$REASON\""

# Print to stderr for logging
echo "[Decision] Method: $METHOD, Reason: $REASON" >&2
