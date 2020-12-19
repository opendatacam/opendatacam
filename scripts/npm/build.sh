#! /bin/bash
REPO_ROOT=$(git rev-parse --show-toplevel)

$REPO_ROOT/scripts/npm/generateapidoc.sh
npx next build $REPO_ROOT