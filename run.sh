#!/bin/bash
MOCHA=./node_modules/mocha/bin/mocha
REPORTER=""
PARALLEL=0
JOBS=0
AFTER="lib/after.js"
OPTS=""
SCREENSIZES="mobile,desktop,tablet"
BRANCH=""
VISDIFF=0
RETURN=0
CLEAN=0

# Function to join arrays into a string
function joinStr { local IFS="$1"; shift; echo "$*"; }

I18N_CONFIG="\"browser\":\"firefox\",\"proxy\":\"system\",\"neverSaveScreenshots\":\"true\""
VISDIFF_CONFIG="\"browser\":\"firefox\", \"proxy\":\"system\", \"neverSaveScreenshots\":\"true\""
IE11_CONFIG="\"sauce\":\"true\",\"sauceConfig\":\"win-ie11\""
declare -a TARGETS

usage () {
  cat <<EOF
-R		  - Use custom Slack/Spec/XUnit reporter, otherwise just use Spec reporter
-p 		  - Execute the tests in parallel via CircleCI envvars (implies -g -s mobile,desktop,tablet)
-b [branch]	  - Run tests on given branch via https://calypso.live
-s		  - Screensizes in a comma-separated list (defaults to mobile,desktop,tablet)
-g		  - Execute general tests in the specs/ directory
-w		  - Only execute signup tests on Windows/IE11, not compatible with -g flag
-l [config]	  - Execute the critical visdiff tests via Sauce Labs with the given configuration
-c		  - Exit with status code 0 regardless of test results
-i		  - Execute i18n tests in the specs-i18n/ directory, not compatible with -g flag
-v [all/critical] - Execute the visdiff tests in specs-visdiff[/critical].  Must specify either 'all' or 'critical'.  Only accessible in combination with -p flag
-h		  - This help listing
EOF
  exit 0
}

if [ $# -eq 0 ]; then
  usage
fi

while getopts ":Rpb:s:giv:wl:ch" opt; do
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
    w)
      NODE_CONFIG_ARGS+=$IE11_CONFIG
      SCREENSIZES=desktop
      TARGET="specs/*wp-signup-spec.js" # wildcard needed to account for random filename ordering
      ;;
    l)
      NODE_CONFIG_ARGS+="\"sauce\":\"true\",\"sauceConfig\":\"$OPTARG\""
      TARGET="specs-visdiff/cross-browser/"
      ;;
    v)
      VISDIFF=1
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
done

# Skip any tests in the given variable
GREP="-i -g '$SKIP_TEST_REGEX'"

# Combine any NODE_CONFIG entries into a single object
NODE_CONFIG_ARG="$(joinStr , ${NODE_CONFIG_ARGS[*]})"

if [ $PARALLEL == 1 ]; then
  # Assign an index to each test segment to run in parallel
  MOBILE=$(expr 0 % $CIRCLE_NODE_TOTAL)
  DESKTOP=$(expr 1 % $CIRCLE_NODE_TOTAL)
  TABLET=$(expr 2 % $CIRCLE_NODE_TOTAL)
  VISUAL=$(expr 3 % $CIRCLE_NODE_TOTAL)
  echo "Parallel execution details:"
  echo "mobile=$MOBILE, desktop=$DESKTOP, tablet=$TABLET, visual=$VISUAL, node=$CIRCLE_NODE_INDEX, total=$CIRCLE_NODE_TOTAL"

  if [ $CIRCLE_NODE_INDEX == $MOBILE ]; then
      echo "Executing tests at mobile screen width"
      NC="--NODE_CONFIG='{$NODE_CONFIG_ARG}'"
      CMD="env BROWSERSIZE=mobile $MOCHA $NC $GREP $REPORTER specs/ $AFTER"

      echo $CMD
      RETURN+=$?
  fi
  if [ $CIRCLE_NODE_INDEX == $DESKTOP ]; then
      echo "Executing tests at desktop screen width"
      NC="--NODE_CONFIG='{$NODE_CONFIG_ARG}'"
      CMD="env BROWSERSIZE=desktop $MOCHA $NC $GREP $REPORTER specs/ $AFTER"

      echo $CMD
      RETURN+=$?
  fi
  if [ $CIRCLE_NODE_INDEX == $TABLET ] && [ "$CIRCLE_BRANCH" == "master" ]; then # only run tablet screensize on master branch
      echo "Executing tests at tablet screen width"
      NC="--NODE_CONFIG='{$NODE_CONFIG_ARG}'"
      CMD="env BROWSERSIZE=tablet $MOCHA $NC $GREP $REPORTER specs/ $AFTER"

      echo $CMD
      RETURN+=$?
  fi
  if [ $CIRCLE_NODE_INDEX == $VISUAL ] && [ $VISDIFF == 1 ]; then
      echo "Executing visdiff tests at all screen widths"
      if [ "$NODE_CONFIG_ARG" == "" ]; then
        NC="--NODE_CONFIG='{$VISDIFF_CONFIG}'"
      else
        NC="--NODE_CONFIG='{$VISDIFF_CONFIG,$NODE_CONFIG_ARG}'"
      fi

      CMD1="env BROWSERSIZE=mobile $MOCHA $NC $GREP $REPORTER specs-visdiff/critical/ $AFTER"
      CMD2="env BROWSERSIZE=desktop $MOCHA $NC $GREP $REPORTER specs-visdiff/critical/ $AFTER"
      CMD3="env BROWSERSIZE=tablet $MOCHA $NC $GREP $REPORTER specs-visdiff/critical/ $AFTER"

      eval $CMD1
      RETURN+=$?
      eval $CMD2
      RETURN+=$?
      eval $CMD3
      RETURN+=$?
  fi
else # Not a parallel run, just queue up the tests in sequence
  NC="--NODE_CONFIG='{$NODE_CONFIG_ARG}'"

  if [ "$CI" != "true" ] || [ $CIRCLE_NODE_INDEX == 0 ]; then
    IFS=, read -r -a SCREENSIZE_ARRAY <<< "$SCREENSIZES"
    for size in ${SCREENSIZE_ARRAY[@]}; do
      for target in "${TARGETS[@]}"; do
        CMD="env BROWSERSIZE=$size $MOCHA $NC $GREP $REPORTER $target $AFTER"

        eval $CMD
        RETURN+=$?
      done
    done
  fi
fi

if [ $CLEAN == 1 ]; then
  exit  0
fi

exit $RETURN
