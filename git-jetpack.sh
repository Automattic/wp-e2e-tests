#!/bin/bash
export APP_NAME=$1
if [ "$APP_NAME" == "" ]; then
  echo "Please supply app directory name!"
  exit 1
elif [ ! -d apps/$APP_NAME ]; then
  echo "App directory apps/$APP_NAME does not exist!"
  exit 1
fi

cd apps/$APP_NAME/public/wp-content/plugins
git clone --depth 1 https://github.com/Automattic/jetpack.git
cd jetpack
yarn build
