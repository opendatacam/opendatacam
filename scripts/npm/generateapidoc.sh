#! /bin/bash

# Try to find the repo-root through git.
# If there's no git repository, surpress git errors and use the current directory
REPO_ROOT=$( git rev-parse --show-toplevel 2> /dev/null || echo . )

npx apidoc -i $REPO_ROOT -e node_modules/ -e .build/apidoc/ -o .build/apidoc/
