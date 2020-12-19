#! /bin/bash
REPO_ROOT=$(git rev-parse --show-toplevel)

apidoc -i $REPO_ROOT -e node_modules/ -o .build/apidoc/