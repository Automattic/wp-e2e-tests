#!/bin/bash

# Notify Slack if any tests are being skipped
if [ "$SKIP_TEST_REGEX" != "" ]; then
  babel-node --presets es2015 lib/slack-ping-cli.js "Attention! Tests are being skipped with pattern $SKIP_TEST_REGEX"
fi
if [ "$RUN_VISDIFF" != "true" ]; then
  babel-node --presets es2015 lib/slack-ping-cli.js "Attention! Visual Diff tests are currently disabled!"
fi

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
