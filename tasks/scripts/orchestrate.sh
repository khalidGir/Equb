#!/bin/bash
set -e
echo "Starting E-Qub App Orchestration..."

# Get the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
echo "Project root: $PROJECT_ROOT"

# Run prebuild
echo "Running prebuild steps..."
"$SCRIPT_DIR/prebuild.sh"

# Run the orchestrator
echo "Executing tasks with Node.js orchestrator..."
node "$PROJECT_ROOT/orchestration/orchestrator.js"

if [ $? -ne 0 ]; then
    echo "✗ Orchestration failed!"
    exit 1
fi

# Run postbuild
echo "Running postbuild steps..."
"$SCRIPT_DIR/postbuild.sh"

# Sync docs after orchestration
echo "Syncing documentation..."
"$SCRIPT_DIR/sync-docs.sh"

echo "Orchestration process completed."