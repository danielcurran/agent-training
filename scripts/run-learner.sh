#!/bin/bash

# Quick-start script for running learner agent against Instruqt labs
# 
# Usage:
#   ./scripts/run-learner.sh <track-slug> <lab-name>
#   ./scripts/run-learner.sh iizqgagh2ab4 memory-for-ai
#
# Or with environment file:
#   source .env
#   ./scripts/run-learner.sh <track-slug> <lab-name>

set -e

if [ $# -lt 2 ]; then
  echo "Usage: $0 <track-slug> <lab-name>"
  echo ""
  echo "Example:"
  echo "  $0 iizqgagh2ab4 memory-for-ai"
  echo ""
  echo "Environment variables:"
  echo "  INSTRUQT_API_TOKEN - Your Instruqt API token (required)"
  echo ""
  echo "To load from .env file:"
  echo "  source .env"
  exit 1
fi

TRACK_SLUG=$1
LAB_NAME=$2

# Check for API token
if [ -z "$INSTRUQT_API_TOKEN" ]; then
  echo "Error: INSTRUQT_API_TOKEN not set"
  echo ""
  echo "Set it with:"
  echo "  export INSTRUQT_API_TOKEN=your_token"
  echo ""
  echo "Or load from .env:"
  echo "  source .env"
  exit 1
fi

# Run the learner agent
echo "Starting Learner Agent..."
echo "  Track: $TRACK_SLUG"
echo "  Lab: $LAB_NAME"
echo ""

INSTRUQT_API_TOKEN=$INSTRUQT_API_TOKEN node scripts/run-learner-instruqt.js "$TRACK_SLUG" "$LAB_NAME"

REPORT_PATH="labs/reports/$LAB_NAME/${LAB_NAME}-env-eval-v1.md"
if [ -f "$REPORT_PATH" ]; then
  echo ""
  echo "✓ Report generated successfully"
  echo "  Location: $REPORT_PATH"
else
  # Find the actual report (may be v2, v3, etc.)
  LATEST=$(ls -1 "labs/reports/$LAB_NAME/"*"-env-eval-v"*.md 2>/dev/null | sort -V | tail -1)
  if [ -n "$LATEST" ]; then
    echo ""
    echo "✓ Report generated successfully"
    echo "  Location: $LATEST"
  fi
fi
