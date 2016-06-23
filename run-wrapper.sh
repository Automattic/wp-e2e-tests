#!/bin/bash

if [ "$NODE_ENV_OVERRIDE" != "" ]; then
  NODE_ENV=$NODE_ENV_OVERRIDE
fi

export TESTARGS="-R -p"

if [ "$RUN_SPECIFIED" == "true" ]; then
  TESTARGS=$RUN_ARGS
elif [ "$CIRCLE_BRANCH" == "master" ]; then
  TESTARGS="-R -p" # Parallel execution, implies -g -s mobile,desktop,tablet
  if [ "$RUN_VISDIFF" == "true" ] && [ "$DEPLOY_USER" != "" ]; then
    TESTARGS+=" -v critical"
  fi
fi

if [ "$liveBranches" == "true" ]; then
  TESTARGS+=" -b $branchName"
fi

npm test
