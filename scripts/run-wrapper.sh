#!/bin/bash

# Notify Slack if any tests are being skipped -- Only runs on Node 0 so you just get one ping
# -- Note that since this is called before run.sh the BROWSERSIZE variable is not yet set and
#    it will always say "screen size 'desktop'"
if [ "$CIRCLE_NODE_INDEX" == "0" ]; then
  if [ "$SKIP_TEST_REGEX" != "" ]; then
    babel-node --presets es2015 lib/slack-ping-cli.js "Attention! Tests are being skipped with pattern [$SKIP_TEST_REGEX]"
  fi
fi

if [ "$NODE_ENV_OVERRIDE" != "" ]; then
  NODE_ENV=$NODE_ENV_OVERRIDE
fi

export TESTARGS="-R -p"

if [ "$RUN_SPECIFIED" == "true" ]; then
  TESTARGS=$RUN_ARGS
elif [[ "$CIRCLE_BRANCH" =~ .*[Jj]etpack.*|.*[Jj][Pp].* ]]; then
  TESTARGS="-R -j" # Execute Jetpack tests
elif [[ "$CIRCLE_BRANCH" =~ .*[Ww][Oo][Oo].* ]]; then
  TESTARGS="-R -W" # Execute WooCommerce tests
elif [ "$CIRCLE_BRANCH" == "master" ]; then
  TESTARGS="-R -p" # Parallel execution, implies -g -s mobile,desktop
fi

if [ "$liveBranches" == "true" ]; then
  TESTARGS+=" -b $branchName"
fi

npm test
