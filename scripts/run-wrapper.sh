#!/bin/bash

if [ "$CI" == "true" ]; then
  if [ -d $HOME/.nvm ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  fi

  nvm install
fi

# Notify Slack if any tests are being skipped -- Only runs on Node 0 so you just get one ping
# -- Note that since this is called before run.sh the BROWSERSIZE variable is not yet set and
#    it will always say "screen size 'desktop'"
if [ "$CIRCLE_NODE_INDEX" == "0" ]; then
  if [ "$SKIP_TEST_REGEX" != "" ]; then
    ./node_modules/.bin/babel-node --presets es2015 lib/slack-ping-cli.js "Attention! Tests are being skipped with pattern [$SKIP_TEST_REGEX]"
  fi
  if [ "$DISABLE_EMAIL" == "true" ]; then
    ./node_modules/.bin/babel-node --presets es2015 lib/slack-ping-cli.js "WARNING::: Any test that uses email is currently disabled as DISABLE_EMAIL is set to true"
  fi
fi

if [ "$NODE_ENV_OVERRIDE" != "" ]; then
  NODE_ENV=$NODE_ENV_OVERRIDE
fi

export TESTARGS="-R -p -x"

if [ "$RUN_SPECIFIED" == "true" ]; then
  TESTARGS=$RUN_ARGS
elif [[ "$CIRCLE_BRANCH" =~ .*[Jj]etpack.*|.*[Jj][Pp].* ]]; then
  export JETPACKHOST=GODADDY
  TESTARGS="-R -j" # Execute Jetpack tests
elif [[ "$CIRCLE_BRANCH" =~ .*[Ww][Oo][Oo].* ]]; then
  TESTARGS="-R -W -u https://wpcalypso.wordpress.com" # Execute WooCommerce tests
elif [ "$CIRCLE_BRANCH" == "master" ]; then
  TESTARGS="-R -p -x" # Parallel execution, implies -g -s mobile,desktop
fi

if [ "$liveBranches" == "true" ]; then
  TESTARGS+=" -b $branchName"
fi

# If on CI and the -x flag is not yet set, set it
if [ "$CI" == "true" ] && [[ "$TESTARGS" != *"-x"* ]]; then
  TESTARGS+=" -x"
fi

npm test
