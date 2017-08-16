#!/bin/bash
export APP_NAME=$1
if [ "$APP_NAME" == "" ]; then
  echo "Please supply app directory name!"
  exit 1
elif [ ! -d apps/$APP_NAME ]; then
  # Wait up to 30 seconds for app to be created
  echo "App directory apps/$APP_NAME does not exist, waiting..."
  sleep 10
  if [ ! -d apps/$APP_NAME ]; then
    echo "App directory apps/$APP_NAME does not exist, waiting..."
    sleep 10
    if [ ! -d apps/$APP_NAME ]; then
      echo "App directory apps/$APP_NAME does not exist, waiting..."
      sleep 10
      if [ ! -d apps/$APP_NAME ]; then
        echo "App directory apps/$APP_NAME does not exist after 30s, quitting!"
        exit 1
      fi
    fi
  fi
fi
echo "App directory apps/$APP_NAME found!  Installing Jetpack..."

# Refresh jetpack in home directory and copy it into the site
mkdir -p apps/$APP_NAME/public/wp-content/plugins
cp -a jetpack apps/$APP_NAME/public/wp-content/plugins
cd apps/$APP_NAME/public/wp-content/plugins/jetpack
git checkout master && git pull
npm build
