#! /bin/bash

# Try to find the repo-root through git.
# If there's no git repository, surpress git errors and use the current directory
REPO_ROOT=$( git rev-parse --show-toplevel 2> /dev/null || echo . )

# Disable NextJS telemetry, see https://nextjs.org/telemetry
npx next telemetry disable

$REPO_ROOT/scripts/npm/generateapidoc.sh
npx next build $REPO_ROOT
