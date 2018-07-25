#!/bin/bash
export JETPACKHOST=PRESSABLE
export TARGET=JETPACK
array=( 'goDaddyJetpackUser' 'asoJetpackUser' 'goDaddyJetpackUserSub'
'bluehostJetpackUser' 'bluehostJetpackUserSub' 'siteGroundJetpackUser')

for i in "${array[@]}"
do
  export JETPACKUSER="$i"
	eval "./node_modules/.bin/mocha ./specs-jetpack/connect-disconnect-spec.js &"
done
