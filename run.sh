#!/bin/bash
MOCHA=./node_modules/mocha/bin/mocha
GRUNT=./node_modules/.bin/grunt
REPORTER=""
PARALLEL=0
CANARY_PARALLEL=0
JOBS=0
OPTS=""
SCREENSIZES="mobile,desktop"
BRANCH=""
RETURN=0
CLEAN=0
GREP=""

# Function to join arrays into a string
function joinStr { local IFS="$1"; shift; echo "$*"; }

I18N_CONFIG="\"browser\":\"firefox\",\"proxy\":\"system\",\"neverSaveScreenshots\":\"true\""
IE11_CONFIG="\"sauce\":\"true\",\"sauceConfig\":\"win-ie11\""

declare -a TARGETS
declare -a LOCALE_TESTS=( en )

usage () {
  cat <<EOF
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
-i		  - Execute i18n tests in the specs-i18n/ directory, not compatible with -g flag
-I		  - Execute each test repeatedly with many different LOCALE_TEST environment values. Use with care.
-v		  - Execute the visdiff tests in specs-visdiff/
-x		  - Execute the tests from the context of xvfb-run
-h		  - This help listing
EOF
  exit 0
}

if [ $# -eq 0 ]; then
  usage
fi

while getopts ":Rpb:s:gjWCH:wl:cm:fiIvxh" opt; do
  case $opt in
    R)
      REPORTER="-R spec-xunit-slack-reporter"
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
      TARGET="specs/"
      ;;
    i)
      NODE_CONFIG_ARGS+=$I18N_CONFIG
      TARGET="specs-i18n/"
      ;;
    I)
      LOCALE_TESTS=( en es pt-br de fr he ja it nl ru tr id zh-cn zh-tw ko ar sv )
      ;;
    w)
      NODE_CONFIG_ARGS+=$IE11_CONFIG
      SCREENSIZES=desktop
      TARGET="specs/*wp-signup-spec.js" # wildcard needed to account for random filename ordering
      ;;
    l)
      NODE_CONFIG_ARGS+=("\"sauce\":\"true\",\"sauceConfig\":\"$OPTARG\"")
      continue
      ;;
    v)
      TARGET="specs-visdiff/"
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
      MOCHA+=" --compilers js:babel-register"
      SCREENSIZES="desktop,mobile"
      TARGET="specs-jetpack-calypso/"
      ;;
    W)
      MOCHA+=" --compilers js:babel-register"
      SCREENSIZES="desktop,mobile"
      TARGET="specs-woocommerce/"
      ;;
    C)
      if [ "$CI" == "true" ]; then
        GREP="-g '@canary$CIRCLE_NODE_INDEX'"
        CANARY_PARALLEL=1
      else
        GREP="-g '@canary'"
      fi

      SCREENSIZES="mobile"
      TARGET="specs/"
      ;;
    H)
      export JETPACKHOST=$OPTARG
      ;;
    f)
      NODE_CONFIG_ARGS+=("\"failVisdiffs\":\"true\"")
      ;;
    x)
      MOCHA="xvfb-run $MOCHA"
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

  TARGETS+=("$TARGET")
  unset TARGET
done

# Skip any tests in the given variable
if [ "$SKIP_TEST_REGEX" != "" ]; then
	GREP="-i -g '$SKIP_TEST_REGEX'"
fi

# Combine any NODE_CONFIG entries into a single object
NODE_CONFIG_ARG="$(joinStr , ${NODE_CONFIG_ARGS[*]})"

if [ $PARALLEL == 1 ]; then
  # Assign an index to each test segment to run in parallel
  MOBILE=$(expr 0 % $CIRCLE_NODE_TOTAL)
  DESKTOP=$(expr 1 % $CIRCLE_NODE_TOTAL)
  echo "Parallel execution details:"
  echo "mobile=$MOBILE, desktop=$DESKTOP, node=$CIRCLE_NODE_INDEX, total=$CIRCLE_NODE_TOTAL"

  if [ $CIRCLE_NODE_INDEX == $MOBILE ]; then
      echo "Executing tests at mobile screen width"
      NC="--NODE_CONFIG='{$NODE_CONFIG_ARG}'"
      for LOCALE_TEST in "${LOCALE_TESTS[@]}"; do
        CMD="env BROWSERSIZE=mobile LOCALE_TEST=$LOCALE_TEST $MOCHA $NC $GREP $REPORTER specs/"
      done

      eval $CMD
      RETURN+=$?
  fi
  if [ $CIRCLE_NODE_INDEX == $DESKTOP ]; then
      echo "Executing tests at desktop screen width"
      NC="--NODE_CONFIG='{$NODE_CONFIG_ARG}'"
      for LOCALE_TEST in "${LOCALE_TESTS[@]}"; do
        CMD="env BROWSERSIZE=desktop LOCALE_TEST=$LOCALE_TEST $MOCHA $NC $GREP $REPORTER specs"
      done;
      eval $CMD
      RETURN+=$?
  fi
else # Not a parallel run, just queue up the tests in sequence
  NC="--NODE_CONFIG='{$NODE_CONFIG_ARG}'"

  if [ "$CI" != "true" ] || [ $CIRCLE_NODE_INDEX == 0 ] || [ $CANARY_PARALLEL == 1 ]; then
    IFS=, read -r -a SCREENSIZE_ARRAY <<< "$SCREENSIZES"
    for size in ${SCREENSIZE_ARRAY[@]}; do
      for LOCALE_TEST in "${LOCALE_TESTS[@]}"; do
        for target in "${TARGETS[@]}"; do
          if [ "$target" != "" ]; then
            CMD="env BROWSERSIZE=$size LOCALE_TEST=$LOCALE_TEST $MOCHA $NC $GREP $REPORTER $target"

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
