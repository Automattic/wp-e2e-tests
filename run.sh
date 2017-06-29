#!/bin/bash
MAGELLAN=./node_modules/.bin/magellan
MOCHA_ARGS=""
WORKERS=3
GRUNT=./node_modules/.bin/grunt
REPORTER=""
PARALLEL=0
JOBS=0
OPTS=""
SCREENSIZES="mobile,desktop"
LOCALES="en"
BRANCH=""
RETURN=0
CLEAN=0
GREP=""

# Function to join arrays into a string
function joinStr { local IFS="$1"; shift; echo "$*"; }

I18N_CONFIG="\"browser\":\"chrome\",\"proxy\":\"system\",\"saveAllScreenshots\":true"
IE11_CONFIG="\"sauce\":\"true\",\"sauceConfig\":\"win-ie11\""

declare -a MAGELLAN_CONFIGS

usage () {
  cat <<EOF
-a [workers]	  - Number of parallel workers in Magellan (defaults to 3)
-R		  - Use custom Slack/Spec/XUnit reporter, otherwise just use Spec reporter
-p 		  - Execute the tests in parallel via CircleCI envvars (implies -g -s mobile,desktop)
-b [branch]	  - Run tests on given branch via https://calypso.live
-s		  - Screensizes in a comma-separated list (defaults to mobile,desktop)
-g		  - Execute general tests in the specs/ directory
-j 		  - Execute Jetpack tests in the specs-jetpack-calypso/ directory (desktop and mobile)
-W		  - Execute WooCommerce tests in the specs-woocommerce/ directory (desktop and mobile)
-C		  - Execute tests tagged with @canary
-H [host]	  - Specify an alternate host for Jetpack tests
-w		  - Only execute signup tests on Windows/IE11, not compatible with -g flag
-l [config]	  - Execute the critical visdiff tests via Sauce Labs with the given configuration
-c		  - Exit with status code 0 regardless of test results
-m [browsers]	  - Execute the multi-browser visual-diff tests with the given list of browsers via grunt.  Specify browsers in comma-separated list or 'all'
-f		  - Tell visdiffs to fail the tests rather than just send an alert
-i		  - Execute i18n screenshot tests, not compatible with -g flag
-v		  - Execute the visdiff tests in specs-visdiff/
-x		  - Execute the tests from the context of xvfb-run
-u [baseUrl]	  - Override the calypsoBaseURL config
-h		  - This help listing
EOF
  exit 0
}

if [ $# -eq 0 ]; then
  usage
fi

while getopts ":a:Rpb:s:gjWCH:wl:cm:fivxu:h" opt; do
  case $opt in
    a)
      WORKERS=$OPTARG
      continue
      ;;
    R)
      MOCHA_ARGS+="-R spec-xunit-reporter "
      continue
      ;;
    p)
      PARALLEL=1
      continue
      ;;
    c)
      CLEAN=1
      continue
      ;;
    b)
      NODE_CONFIG_ARGS+=("\"liveBranch\":\"true\",\"branchName\":\"$OPTARG\",\"calypsoBaseURL\":\"https://calypso.live\"")
      continue
      ;;
    s)
      SCREENSIZES=$OPTARG
      continue
      ;;
    g)
      MAGELLAN_CONFIG="magellan.json"
      ;;
    i)
      NODE_CONFIG_ARGS+=$I18N_CONFIG
      LOCALES="en,pt-BR,es,ja,fr,he"
      MAGELLAN_CONFIG="magellan-i18n.json"
      ;;
    w)
      NODE_CONFIG_ARGS+=$IE11_CONFIG
      SCREENSIZES=desktop
      MAGELLAN_CONFIG="magellan-ie11.json"
      ;;
    l)
      NODE_CONFIG_ARGS+=("\"sauce\":\"true\",\"sauceConfig\":\"$OPTARG\"")
      continue
      ;;
    v)
      MAGELLAN_CONFIG="magellan-visdiff.json" # File does not exist, visdiffs aren't using Magellan yet
      ;;
    m)
      BROWSERS=$(echo $OPTARG | sed 's/,/ /g')
      if [ "$CI" != "true" ] || [ $CIRCLE_NODE_INDEX == 0 ]; then
        CMD="$GRUNT $BROWSERS"

	eval $CMD
      fi
      exit $?
      ;;
    j)
      SCREENSIZES="desktop,mobile"
      MAGELLAN_CONFIG="magellan-jetpack.json"
      ;;
    W)
      SCREENSIZES="desktop,mobile"
      MAGELLAN_CONFIG="magellan-woocommerce.json"
      ;;
    C)
      SCREENSIZES="mobile"
      MAGELLAN_CONFIG="magellan-canary.json"
      ;;
    H)
      export JETPACKHOST=$OPTARG
      ;;
    f)
      NODE_CONFIG_ARGS+=("\"failVisdiffs\":\"true\"")
      ;;
    x)
      MAGELLAN="xvfb-run $MAGELLAN"
      ;;
    u)
      NODE_CONFIG_ARGS+=("\"calypsoBaseURL\":\"$OPTARG\"")
      continue
      ;;
    h)
      usage
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      echo ""
      usage
      ;;
    :)
      echo "Option -$OPTARG requires an argument" >&2
      echo ""
      usage
      ;;
  esac

  MAGELLAN_CONFIGS+=("$MAGELLAN_CONFIG")
  unset MAGELLAN_CONFIG
done

# Skip any tests in the given variable - DOES NOT WORK WITH MAGELLAN - See issue #506
if [ "$SKIP_TEST_REGEX" != "" ]; then
  GREP="-i -g '$SKIP_TEST_REGEX'"
fi

# Combine any NODE_CONFIG entries into a single object
NODE_CONFIG_ARG="$(joinStr , ${NODE_CONFIG_ARGS[*]})"
MOCHA_ARGS+="--NODE_CONFIG={$NODE_CONFIG_ARG}"

if [ $PARALLEL == 1 ]; then
  # Assign an index to each test segment to run in parallel
  MOBILE=$(expr 0 % $CIRCLE_NODE_TOTAL)
  DESKTOP=$(expr 1 % $CIRCLE_NODE_TOTAL)
  echo "Parallel execution details:"
  echo "mobile=$MOBILE, desktop=$DESKTOP, node=$CIRCLE_NODE_INDEX, total=$CIRCLE_NODE_TOTAL"

  if [ $CIRCLE_NODE_INDEX == $MOBILE ]; then
      echo "Executing tests at mobile screen width"
      CMD="env BROWSERSIZE=mobile $MAGELLAN --mocha_args='$MOCHA_ARGS' --max_workers=$WORKERS"

      eval $CMD
      RETURN+=$?
  fi
  if [ $CIRCLE_NODE_INDEX == $DESKTOP ]; then
      echo "Executing tests at desktop screen width"
      CMD="env BROWSERSIZE=desktop $MAGELLAN --mocha_args='$MOCHA_ARGS' --max_workers=$WORKERS"

      eval $CMD
      RETURN+=$?
  fi
else # Not using multiple CircleCI containers, just queue up the tests in sequence
  if [ "$CI" != "true" ] || [ $CIRCLE_NODE_INDEX == 0 ]; then
    IFS=, read -r -a SCREENSIZE_ARRAY <<< "$SCREENSIZES"
    IFS=, read -r -a LOCALE_ARRAY <<< "$LOCALES"
    for size in ${SCREENSIZE_ARRAY[@]}; do
      for locale in ${LOCALE_ARRAY[@]}; do
        for config in "${MAGELLAN_CONFIGS[@]}"; do
          if [ "$config" != "" ]; then
            CMD="env BROWSERSIZE=$size BROWSERLOCALE=$locale $MAGELLAN --mocha_args='$MOCHA_ARGS' --config='$config' --max_workers=$WORKERS"
  
            eval $CMD
            RETURN+=$?
          fi
        done
      done
    done
  fi
fi

if [ $CLEAN == 1 ]; then
  exit  0
fi

exit $RETURN
