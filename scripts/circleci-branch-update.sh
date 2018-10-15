#!/bin/bash

update-wrapper-node-version () {
    version=$(<.nvmrc)
    version=${version:1}
    config=( $(jq -r '.circleCIToken' ./config/local-${NODE_ENV}.json) )
    token=${config[0]}

    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-for-branches/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-canary-for-branches/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-canary/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-ie11/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-jetpack/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-jetpack-be/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-woocommerce/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-i18n/envvar?circle-token=${token}
    curl --write-out %{http_code} --silent --output /dev/null -X POST --header "Content-Type: application/json" -d "{\"name\":\"NODE_VERSION\", \"value\":\"$version\"}" https://circleci.com/api/v1.1/project/github/automattic/wp-e2e-tests-jetpack-smoke/envvar?circle-token=${token}
}


head-changed-file () {
        set -- $(git rev-parse "@:$1" "@~:$1")
        [[ $1 != $2 ]]
}

update-node () {
    version=$(<.nvmrc)
    version=${version:1}
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
    source ~/.bashrc
    nvm install $version &&
    nvm alias default $version
}

if head-changed-file ".nvmrc" && [ "$CIRCLE_BRANCH" = "master" ]; then
    update-node &&
    update-wrapper-node-version
elif head-changed-file ".nvmrc"; then
    update-node
else
    echo ".nvmrc file not updated or is not on master"
fi
