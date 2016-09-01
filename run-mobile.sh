#!/bin/bash
cd "$(dirname "$0")"
MOCHA=./node_modules/mocha/bin/mocha
REPORTER=""
AFTER="lib/after.js"
OPTS=""
DEVICE="ios92"
CLEAN=0
RETURN=0

declare -a TARGETS
declare -a ORIENTATIONS

# Hard coded to just the specs-ios directory, will change if/when we add something else like visdiff or i18n tests
TARGETS+=("specs-ios/")

usage () {
  cat <<EOF
-R	- Use custom Slack/Spec/XUnit reporter, otherwise just use Spec reporter
-c	- Exit with status code 0 regardless of test results
-p	- Portrait orientation
-l	- Landscape orientation
-s	- Use SauceLabs
-h	- This help listing
EOF
  exit 0
}

if [ $# -eq 0 ]; then
  usage
fi

while getopts ":Rplscd:h" opt; do
  case $opt in
    R)
      REPORTER="-R spec-xunit-slack-reporter"
      continue
      ;;
    c)
      CLEAN=1
      continue
      ;;
    p)
      ORIENTATIONS+=("PORTRAIT")
      continue
      ;;
    l)
      ORIENTATIONS+=("LANDSCAPE")
      continue
      ;;
    s)
      NC="--NODE_CONFIG='{\"sauce\":true}'"
      continue
      ;;
    d)
      DEVICE=$OPTARG
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

  TARGETS+=("$TARGET")
done

if [ ${#ORIENTATIONS[@]} == 0 ]; then
  echo "Must supply at least one -p or -l" >&2
  echo ""
  usage
fi

for orientation in "${ORIENTATIONS[@]}"; do
  for target in "${TARGETS[@]}"; do
    CMD="env ORIENTATION=$orientation DEVICE=$DEVICE $MOCHA $NC $REPORTER $target $AFTER"

    eval $CMD
    RETURN+=$?
  done
done

if [ $CLEAN == 1 ]; then
  exit  0
fi

exit $RETURN
