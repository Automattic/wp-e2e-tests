#!/bin/bash
SCREENSHOTDIR=$(pwd)/screenshots
CONFIGDIR=$(pwd)/config

usage () {
  cat <<EOF
Unless the -b option is given, this command runs the Docker image named wp-e2e-tests
-b		  - Build the Docker container
-c		  - Directory holding local-docker.json file (fully qualified)
-s		  - Output directory for screenshots (fully qualified)
-h		  - This help listing
EOF
  exit 0
}

while getopts ":bc:s:h" opt; do
  case $opt in
    b)
      docker build -t wp-e2e-tests .
      exit $?
      ;;
    c)
      CONFIGDIR=$OPTARG
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

eval docker run -it -v $CONFIGDIR:/secrets -v $SCREENSHOTDIR:/screenshots wp-e2e-tests
