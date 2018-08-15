#!/bin/bash

update-wrapper-node-version () {
    version=$(<.nvmrc)
    version=${version:1}
    config=( $(jq -r '.circleCIToken' ./config/local-${NODE_ENV}.json) )
    token=${config[0]}

    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-for-branches/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-canary-for-branches/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-canary/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-ie11/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-jetpack/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-jetpack-be/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-woocommerce/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-i18n/envvar?circle-token=${token}
}


head-changed-file () {
        set -- $(git rev-parse "@:$1" "@~:$1")
        [[ $1 != $2 ]]
}

if [head-changed-file .nvmrc]  && [$CIRCLE_BRANCH == "master"]; then
   update-wrapper-node-version
else
   echo ".nvmrc file not updated"
fi
