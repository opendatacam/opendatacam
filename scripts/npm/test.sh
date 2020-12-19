#! /bin/bash
REPO_ROOT=$(git rev-parse --show-toplevel)

node --unhandled-rejections=strict $REPO_ROOT/node_modules/jasmine/bin/jasmine.js