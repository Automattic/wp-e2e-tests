#!/bin/bash
# CircleCI Reports
# Assuming the $CIRCLE_TOKEN envvar is populated, this will retrieve all of the xunit report files from the last 30 failed runs and print the errors
# to the screen.  The idea is that this will give you a nice easy way to skim all the recent results to see if the same jobs have been failing repeatedly.

which jq > /dev/null 2>&1
RC=$?
if [ $RC != 0 ];then
  echo "Please install jq"
  exit 1
fi

red='\E[31;40m'
reset='\e[0m'

#0) Keep all artifacts in a reports subdirectory
mkdir -p reports
cd reports

#1) Get list of recent deploy-triggered builds (failures only), building a subdir for each
curl https://circleci.com/api/v1.1/project/github/Automattic/wp-e2e-tests?circle-token=$CIRCLE_TOKEN\&filter=failed 2>/dev/null | jq '.[] | select( .build_parameters.DEPLOY_USER != null ) | select( .build_parameters.DEPLOY_USER != "" ) | .build_num' | xargs mkdir -p

#2) Retrieve xunit artifacts for each failed build, skipping any directories that already have files
for BUILD_NUM in $(ls); do
  cd $BUILD_NUM
  if [ "$(ls)" == "" ]; then
    curl https://circleci.com/api/v1.1/project/github/Automattic/wp-e2e-tests/$BUILD_NUM/artifacts?circle-token=$CIRCLE_TOKEN 2>/dev/null | jq '.[] | select( .path | contains( "xml" ) ) | .url' | xargs wget
  fi
  cd ..
done

#3) For each build, parse out the failed test names and errors
for BUILD_NUM in $(ls); do
  cd $BUILD_NUM
  echo $BUILD_NUM

  # Print timestamp of the first file
  head -1 $(ls | head -1) | sed 's/^.*timestamp="//' | sed 's/".*$//'
    
  # Loop through the files that have a failure recorded
  for file in $(grep -l failures=\"[^0]\" *); do
    # Convert the XML to JSON
    json=$(xml2json < $file)
    failures=$(echo $json | jq -M '.testsuite.testcase | map( select( .failure ) | { classname: .classname, name: .name, failure: .failure."$cd" } )')
    numFailures=$(echo $failures | jq '. | length')
    i=0
    while [ $i -lt $numFailures ]; do
      failure=$(echo $failures | jq -M --arg index $i '.[$index | tonumber]')
	# TODO - Truncate string with ellipsis
      echo "	$(echo $failure | jq -M '.classname')"
      echo "		$(echo $failure | jq -M '.name')"
      printf "		$red %s $reset\n" "$(echo $failure | jq -C '.failure' | grep -o 'Error:.*\\n' | sed 's/\\n.*$//')"

      i=$[$i+1]
    done
  done

  cd ..
done
