#!/bin/bash
echo "Running post-build operations for E-Qub..."

# Minify images
echo "Optimizing assets..."
npx imagemin ../src/frontend/assets/* --out-dir=../src/frontend/assets/

# Bundle documentation
echo "Bundling documentation..."
tar -czf ../../docs/docs-package.tar.gz ../../docs/

echo "Post-build complete."
