#!/bin/bash

export TESTARGS="-R -g -s desktop"

if [ "$RUN_SPECIFIED" == "true" ]; then
  TESTARGS=$RUN_ARGS
elif [ "$CIRCLE_BRANCH" == "master" ]; then
  TESTARGS="-R -p" # Parallel execution, implies -g -s mobile,desktop,tablet
  if [ "$RUN_VISDIFF" == "true" ] && [ "$DEPLOY_USER" != "" ]; then
    TESTARGS+=" -v critical"
  fi
fi

npm test
