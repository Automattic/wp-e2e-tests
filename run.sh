#!/bin/bash
MOCHA=./mocha/bin/mocha
REPORTER=""
PARALLEL=0
JOBS=0
AFTER="lib/after.js"
OPTS=""
SCREENSIZES="mobile,desktop,tablet"
RETURN=0

I18N_CONFIG="--NODE_CONFIG='{\"browser\":\"firefox\",\"proxy\":\"system\",\"neverSaveScreenshots\":\"true\"}'"
VISDIFF_CONFIG="--NODE_CONFIG='{\"browser\":\"firefox\", \"proxy\":\"system\", \"neverSaveScreenshots\":\"true\"}'"
declare -a TARGETS

usage () {
  cat <<EOF
-R		  - Use custom Slack/Spec/XUnit reporter, otherwise just use Spec reporter
-p [jobs]	  - Execute [num] jobs in parallel
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

while getopts ":Rp:s:giv:h" opt; do
  case $opt in
    R)
      REPORTER="-R spec-xunit-slack-reporter"
      continue
      ;;
    p)
      PARALLEL=1
      JOBS=$OPTARG
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

# Ensure no parallel_exec command list file exists
rm -f parallel_exec.cmd

# Skip any tests in the given variable
GREP="-i -g '$SKIP_TEST_REGEX'"

IFS=, read -r -a SCREENSIZE_ARRAY <<< "$SCREENSIZES"
for size in ${SCREENSIZE_ARRAY[@]}; do
  for target in "${TARGETS[@]}"; do
    CMD="env BROWSERSIZE=$size $MOCHA $GREP $REPORTER $target $AFTER"

    if [ $PARALLEL == 1 ]; then
      echo $CMD >> parallel_exec.cmd
    else
      eval $CMD
      RETURN+=$?
    fi
  done
done

if [ $PARALLEL == 1 ]; then
#  cat parallel_exec.cmd | parallel --jobs $JOBS --pipe bash
  parallel -a parallel_exec.cmd -j3 --no-notice -u
  RETURN+=$?
  rm -f parallel_exec.cmd
fi

exit $RETURN
