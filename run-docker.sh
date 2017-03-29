#!/bin/bash
SCREENSHOTDIR=$(pwd)/screenshots
CONFIGDIR=$(pwd)/config
CMD=""
LOCAL=""

usage () {
  cat <<EOF
Unless the -b option is given, this command runs the Docker image named wp-e2e-tests
-b		  - Build the Docker container (overrides all other options)
-c		  - Directory holding local-docker.json file (fully qualified)
-i		  - Launch an interactive shell instead of directly running the tests
-l		  - Mount the current directory inside the container for modification/testing
-s		  - Output directory for screenshots (fully qualified)
-h		  - This help listing
EOF
  exit 0
}

while getopts ":bc:ils:h" opt; do
  case $opt in
    b)
      docker build -t wp-e2e-tests .
      exit $?
      ;;
    c)
      CONFIGDIR=$OPTARG
      continue
      ;;
    i)
      CMD=/bin/bash
      continue
      ;;
    l)
      LOCAL="-v $(pwd):/wp-e2e-tests"
      continue
      ;;
    s)
      SCREENSHOTDIR=$OPTARG
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
done

echo docker run -it --shm-size=128m -v $CONFIGDIR:/secrets -v $SCREENSHOTDIR:/screenshots $LOCAL wp-e2e-tests $CMD
