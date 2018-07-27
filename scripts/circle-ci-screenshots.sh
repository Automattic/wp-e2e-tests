#!/bin/bash

sudo apt install -y libxcb1-dev libxcb-shm0-dev libxcb-xfixes0-dev ffmpeg xvfb
nohup Xvfb -ac :99 -screen 0 1440x1000x16 +extension RANDR > /dev/null 2>&1 &

export DISPLAY=:99
export TEST_VIDEO='true'
