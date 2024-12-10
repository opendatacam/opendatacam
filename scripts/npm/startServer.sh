#! /bin/bash

# Try to find the repo-root through git.
# If there's no git repository, surpress git errors and use the current directory
REPO_ROOT=$( git rev-parse --show-toplevel 2> /dev/null || echo . )

NODE_VERSION=$( npx semver $( node --version ))
NEXT_VERSION=$( npx semver $( npx next --version ))
if [ $(npx semver $NODE_VERSION --range "> 14") ] && [ $(npx semver $NEXT_VERSION --range "< 11") ]; then
  echo "Warning!"
  echo "The combination of Node v$NODE_VERSION and Next.js v$NEXT_VERSION is not supported officially."
  echo "Setting NODE_OPTIONS=--openssl-legacy-provider as a work around"
  echo "See also https://github.com/opendatacam/opendatacam/issues/624"
  echo ""
  export NODE_OPTIONS=--openssl-legacy-provider
fi

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