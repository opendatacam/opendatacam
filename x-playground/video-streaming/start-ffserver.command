#!/bin/bash
BASEDIR="$( dirname "$0" )"
cd "$BASEDIR"

ffserver -d -f ffserver.conf
