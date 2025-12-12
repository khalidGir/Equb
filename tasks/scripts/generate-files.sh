#!/bin/bash
echo "Generating files for E-Qub project..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
echo "Project root: $PROJECT_ROOT"

# Create necessary directories if they don't exist
echo "Ensuring directory structure..."
mkdir -p "$PROJECT_ROOT/docs/generated"
mkdir -p "$PROJECT_ROOT/frontend/src/components"
mkdir -p "$PROJECT_ROOT/backend/src/routes"

# Generate README.md if it doesn't exist
if [ ! -f "$PROJECT_ROOT/README.md" ]; then
    echo "Generating README.md..."
    cat > "$PROJECT_ROOT/README.md" << EOF
# E-Qub Application

Digital ledger and communication tool for eQub groups in urban Ethiopia.

## Project Structure

- [/agents](file:///c:/Users/hp/ALL%20PROJECTS/Mobile%20Apps/Equb/project-root/agents/) - AI agent configurations
- [/docs](file:///c:/Users/hp/ALL%20PROJECTS/Mobile%20Apps/Equb/project-root/docs/) - Documentation
- [/frontend](file:///c:/Users/hp/ALL%20PROJECTS/Mobile%20Apps/Equb/project-root/frontend/) - React Native mobile application
- [/backend](file:///c:/Users/hp/ALL%20PROJECTS/Mobile%20Apps/Equb/project-root/backend/) - Firebase backend services
- [/tasks](file:///c:/Users/hp/ALL%20PROJECTS/Mobile%20Apps/Equb/project-root/tasks/) - Task orchestration
- [/workflows](file:///c:/Users/hp/ALL%20PROJECTS/Mobile%20Apps/Equb/project-root/workflows/) - CI/CD workflows

## Quick Start

1. Install dependencies:
   \`npm install\` in both frontend and backend directories

2. Run the application:
   \`npm start\` in frontend directory

3. Run backend services:
   \`npm start\` in backend directory

## Development Process

Tasks are orchestrated using our custom system. Run \`./tasks/scripts/orchestrate.sh\` to execute all tasks.
EOF
fi

# Generate a basic package.json for frontend if it doesn't exist
if [ ! -f "$PROJECT_ROOT/frontend/package.json" ]; then
    echo "Generating frontend package.json..."
    cat > "$PROJECT_ROOT/frontend/package.json" << EOF
{
  "name": "equb-frontend",
  "version": "1.0.0",
  "description": "E-Qub Mobile Application",
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "eject": "expo eject"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.0",
    "expo": "~49.0.15"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  },
  "private": true
}
EOF
fi

# Generate a basic package.json for backend if it doesn't exist
if [ ! -f "$PROJECT_ROOT/backend/package.json" ]; then
    echo "Generating backend package.json..."
    cat > "$PROJECT_ROOT/backend/package.json" << EOF
{
  "name": "equb-backend",
  "version": "1.0.0",
  "description": "E-Qub Backend Services",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "firebase-admin": "^11.0.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
EOF
fi

echo "File generation complete."