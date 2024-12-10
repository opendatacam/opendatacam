#! /bin/bash

# Try to find the repo-root through git.
# If there's no git repository, surpress git errors and use the current directory
REPO_ROOT=$( git rev-parse --show-toplevel 2> /dev/null || echo . )

node --unhandled-rejections=strict $REPO_ROOT/node_modules/jasmine/bin/jasmine.js