#!/bin/bash

version=$(<.nvmrc)
version=${version:1}
config=( $(jq -r '.circleCIToken' ./config/local-${NODE_ENV}.json) )
token=${config[0]}

curl -X POST --header "Content-Type: application/json" -d '{"name":"NODE_VERSION", "value":"${version}"}' https://circleci.com/api/v1.1/project/gh/automattic/wp-e2e-tests-for-branches/envvar?circle-token=${token}
curl -X POST --header "Content-Type: application/json" -d '{"name":"NODE_VERSION", "value":"${version}"}' https://circleci.com/api/v1.1/project/gh/automattic/wp-e2e-canary-for-branches/envvar?circle-token=${token}
curl -X POST --header "Content-Type: application/json" -d '{"name":"NODE_VERSION", "value":"${version}"}' https://circleci.com/api/v1.1/project/gh/automattic/wp-e2e-tests-canary/envvar?circle-token=${token}
curl -X POST --header "Content-Type: application/json" -d '{"name":"NODE_VERSION", "value":"${version}"}' https://circleci.com/api/v1.1/project/gh/automattic/wp-e2e-tests-ie11/envvar?circle-token=${token}
curl -X POST --header "Content-Type: application/json" -d '{"name":"NODE_VERSION", "value":"${version}"}' https://circleci.com/api/v1.1/project/gh/automattic/wp-e2e-tests-jetpack/envvar?circle-token=${token}
curl -X POST --header "Content-Type: application/json" -d '{"name":"NODE_VERSION", "value":"${version}"}' https://circleci.com/api/v1.1/project/gh/automattic/wp-e2e-tests-jetpack-be/envvar?circle-token=${token}
curl -X POST --header "Content-Type: application/json" -d '{"name":"NODE_VERSION", "value":"${version}"}' https://circleci.com/api/v1.1/project/gh/automattic/wp-e2e-tests-woocommerce/envvar?circle-token=${token}
curl -X POST --header "Content-Type: application/json" -d '{"name":"NODE_VERSION", "value":"${version}"}' https://circleci.com/api/v1.1/project/gh/automattic/wp-e2e-tests-visdiff/envvar?circle-token=${token}
curl -X POST --header "Content-Type: application/json" -d '{"name":"NODE_VERSION", "value":"${version}"}' https://circleci.com/api/v1.1/project/gh/automattic/wp-e2e-tests-i18n/envvar?circle-token=${token}
