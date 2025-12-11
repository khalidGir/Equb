#!/bin/bash
echo "Syncing documentation..."

DOCS_SRC=../../docs/
DOCS_TARGET=../../../e-qub-docs-repo/

rsync -avh --delete $DOCS_SRC $DOCS_TARGET

echo "Documentation synchronized successfully."
