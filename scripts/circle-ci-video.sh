#!/bin/bash
# Kill existing Xvfb process
kill `pgrep Xvfb`
sleep 3

# Restart Xvfb with the options we want
Xvfb -ac :99 -screen 0 1440x1000x16 +extension RANDR > /dev/null 2>&1 &
sleep 3
