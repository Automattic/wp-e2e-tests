#!/bin/bash
MOCHA=./mocha/bin/mocha
REPORTER=""
PARALLEL=0
JOBS=0
AFTER="lib/after.js"
OPTS=""
SCREENSIZES="mobile,desktop,tablet"
VISDIFF=0
RETURN=0

I18N_CONFIG="--NODE_CONFIG='{\"browser\":\"firefox\",\"proxy\":\"system\",\"neverSaveScreenshots\":\"true\"}'"
VISDIFF_CONFIG="--NODE_CONFIG='{\"browser\":\"firefox\", \"proxy\":\"system\", \"neverSaveScreenshots\":\"true\"}'"
declare -a TARGETS

usage () {
  cat <<EOF
-R		  - Use custom Slack/Spec/XUnit reporter, otherwise just use Spec reporter
-p 		  - Execute the tests in parallel via CircleCI envvars (implies -g -s mobile,desktop,tablet)
-s		  - Screensizes in a comma-separated list (defaults to mobile,desktop,tablet)
-g		  - Execute general tests in the specs/ directory
-i		  - Execute i18n tests in the specs-i18n/ directory
-v [all/critical] - Execute the visdiff tests in specs-visdiff[/critical].  Must specify either 'all' or 'critical'.
-h		  - This help listing
EOF
  exit 0
}

if [ $# -eq 0 ]; then
  usage
fi

while getopts ":Rps:giv:h" opt; do
  case $opt in
    R)
      REPORTER="-R spec-xunit-slack-reporter"
      continue
      ;;
    p)
      PARALLEL=1
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
      TARGET="$I18N_CONFIG specs-i18n/"
      ;;
    v)
      VISDIFF=1
      if [ "$OPTARG" == "all" ]; then
        TARGET="$VISDIFF_CONFIG specs-visdiff/\*"
      elif [ "$OPTARG" == "critical" ]; then
        TARGET="$VISDIFF_CONFIG specs-visdiff/critical/"
      else
        echo "-v supports the following values: all or critical"
        exit 1
      fi
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
      CMD="env BROWSERSIZE=mobile $MOCHA $GREP $REPORTER specs/ $AFTER"

      eval $CMD
      RETURN+=$?
  fi
  if [ $CIRCLE_NODE_INDEX == $DESKTOP ]; then
      echo "Executing tests at desktop screen width"
      CMD="env BROWSERSIZE=desktop $MOCHA $GREP $REPORTER specs/ $AFTER"

      eval $CMD
      RETURN+=$?
  fi
  if [ $CIRCLE_NODE_INDEX == $TABLET ]; then
      echo "Executing tests at tablet screen width"
      CMD="env BROWSERSIZE=tablet $MOCHA $GREP $REPORTER specs/ $AFTER"

      eval $CMD
      RETURN+=$?
  fi
  if [ $CIRCLE_NODE_INDEX == $VISUAL ] && [ $VISDIFF == 1 ]; then
      echo "Executing visdiff tests at all screen widths"
      CMD1="env BROWSERSIZE=mobile $MOCHA $GREP $REPORTER $VISDIFF_CONFIG specs-visdiff/critical/ $AFTER"
      CMD2="env BROWSERSIZE=desktop $MOCHA $GREP $REPORTER $VISDIFF_CONFIG specs-visdiff/critical/ $AFTER"
      CMD3="env BROWSERSIZE=tablet $MOCHA $GREP $REPORTER $VISDIFF_CONFIG specs-visdiff/critical/ $AFTER"

      eval $CMD1
      RETURN+=$?
      eval $CMD2
      RETURN+=$?
      eval $CMD3
      RETURN+=$?
  fi
else # Not a parallel run, just queue up the tests in sequence
  if [ "$CI" != "true" ] || [ $CIRCLE_NODE_INDEX == 0 ]; then
    IFS=, read -r -a SCREENSIZE_ARRAY <<< "$SCREENSIZES"
    for size in ${SCREENSIZE_ARRAY[@]}; do
      for target in "${TARGETS[@]}"; do
        CMD="env BROWSERSIZE=$size $MOCHA $GREP $REPORTER $target $AFTER"

        eval $CMD
        RETURN+=$?
      done
    done
  fi
fi

exit $RETURN
