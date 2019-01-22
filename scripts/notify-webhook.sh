#!/bin/bash
set +o errexit
buildUrl=$CIRCLE_BUILD_URL
buildNum=$CIRCLE_BUILD_NUM

if [ "$CIRCLE_JOB" == "notify" ]; then
   buildUrl=$SAVED_BUILD_URL
   buildNum=$SAVED_BUILD_NUM
fi

curl -X POST "https://a8c-gh-e2e-bridge.go-vip.co/circleciwebhook" \
    -H 'Cache-Control: no-cache'                                                   \
    -H 'Content-Type: application/json'                                            \
    -d '{
            "payload": {
                "outcome": "'"$1"'",
                "status": "'"$1"'",
                "build_url": "'"$buildUrl"'",
                "build_parameters": {
                    "branch": "'"$BRANCHNAME"'",
                    "build_num": '"$buildNum"',
                    "sha": "'"$sha"'",
                    "prContext": "'"$prContext"'",
                    "calypsoProject": "'"$calypsoProject"'",
                    "jetpackProject": "'"$jetpackProject"'"
                }
            }
        }'
