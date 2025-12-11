#!/bin/bash
echo "Starting E-Qub prebuild tasks..."

# Validate tasks JSON
echo "Validating tasks.json..."
ajv validate -s ../schema/tasks.schema.json -d ../tasks.json

# Prepare environment variables
export NODE_ENV=production
export PLATFORM=mobile

echo "Environment ready."
