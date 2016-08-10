# WordPress.com End to End Tests (Mobile Edition)

This document is a supplement to the main [README](README.md) file for this project, and is intended to help guide you through running the e2e tests on the iOS app*.  The prerequisites listed there also apply for the mobile tests, with the addition that you must download and build the app from source: https://github.com/wordpress-mobile/WordPress-iOS

*Android is only partially supported as of this writing, but that will change in the future

#### Appium
These tests are written to use [Appium](http://appium.io) as the interface for talking to the device/simulator.  You can either run it standalone, or connect to the [SauceLabs](https://saucelabs.com/) interface.  Appium is included as an npm dependency, but you can also download and install it manually.  Just be sure to start the server before running any tests (if you're not using SauceLabs)

#### Specs

The iOS specs are kept in the [specs-ios](/specs-ios) folder.

### Running Specs

To run an individual spec:

`./node_modules/mocha/bin/mocha specs-ios/wp-ios-log-in-out-spec.js lib/after.js`

Note - There are two necessary environment variables: `$ORIENTATION` (PORTRAIT/LANDSCAPE) and `$DEVICE` (matching one of the configurations in [lib/mobile-capabilities.js](lib/mobile-capabilities.js)

To run the full set of specs:

The `run-mobile.sh` script takes the following parameters, which can be combined to execute a variety of suites
```
-R	- Use custom Slack/Spec/XUnit reporter, otherwise just use Spec reporter
-d  - Device name
-p	- Portrait orientation
-l	- Landscape orientation
-s	- Use SauceLabs
-h	- This help listing
```
