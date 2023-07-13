#! /bin/bash

# Try to find the repo-root through git.
# If there's no git repository, surpress git errors and use the current directory
REPO_ROOT=$( git rev-parse --show-toplevel 2> /dev/null || echo . )

if [ -z $PORT ]; then
  PORT=8080
fi
if [ -z $NODE_ENV ]; then
  NODE_ENV=development
fi

echo "PORT=$PORT"
echo "NODE_ENV=$NODE_ENV"

if [ "$NODE_ENV" == "production" ]; then
  # Build automatically generates API docs
  $REPO_ROOT/scripts/npm/build.sh
else
  # Explicitly generate API docs during development
  $REPO_ROOT/scripts/npm/generateapidoc.sh
fi
node $REPO_ROOT/server.js