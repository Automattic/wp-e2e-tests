# Run tests

## Table of Contents

- [To run the default specs](#to-run-the-default-specs-in-parallel-in-default-browser-sizes---mobile-and-desktop)
- [To run an individual spec](#to-run-an-individual-spec)
- [To run with different modes](#to-run-with-different-modes)
- [To run a specific suite of specs](#to-run-a-specific-suite-of-specs)
- [To run headlessly](#to-run-headlessly)

## To run the default specs in parallel (in default browser sizes - mobile and desktop)

`./run.sh -g`

- or -

`./node_modules/.bin/magellan`

See the magellan.json file for the default parameters.  This is the process used in CI.

**NOTE!** - The magellan mocha plugin will search for all suites tagged with `@parallel`.  If you add a new test to this repo, you MUST add that tag to ensure that your test is run via CircleCI.

## To run an individual spec

`./node_modules/.bin/mocha specs/wp-log-in-out-spec.js`

Note: you can also change the spec _temporarily_ the use the `.only` syntax so it is the only spec that runs (making sure this isn't committed)

eg.

`describe.only( 'Logging In and Out:', function() {`

## To run with different modes

All tests should be written to work in three modes: desktop (1440 wide), tablet (1024 wide) and mobile (375 wide).

You can run tests in different modes by setting an environment variable `BROWSERSIZE` to either `desktop`, `tablet` or `mobile`.

Eg:

`env BROWSERSIZE=tablet ./node_modules/.bin/mocha specs`

Or you can use the -s option on the run.sh script:

`./run.sh -g -s mobile`
`./run.sh -g -s desktop,tablet`

## To run a specific suite of specs

The `run.sh` script takes the following parameters, which can be combined to execute a variety of suites

    -a [workers]  - Number of parallel workers in Magellan (defaults to 3)
    -R      - Use custom Slack/Spec/XUnit reporter, otherwise just use Spec reporter
    -p      - Execute the tests in parallel via CircleCI envvars (implies -g -s mobile,desktop)
    -b [branch]   - Run tests on given branch via https://calypso.live
    -s      - Screensizes in a comma-separated list (defaults to mobile,desktop)
    -g      - Execute general tests in the specs/ directory
    -j      - Execute Jetpack tests in the specs-jetpack-calypso/ directory (desktop and mobile)
    -W      - Execute WooCommerce tests in the specs-woocommerce/ directory (desktop and mobile)
    -H [host]   - Specify an alternate host for Jetpack tests
    -w      - Only execute signup tests on Windows/IE11, not compatible with -g flag
    -l [config]   - Execute the tests via Sauce Labs with the given configuration
    -c      - Exit with status code 0 regardless of test results
    -f      - Tell visdiffs to fail the tests rather than just send an alert
    -I      - Execute i18n tests in the specs-i18n/ directory (desktop)
    -i      - Execute i18n signup screenshot tests, not compatible with -g flag
    -v      - Execute the integrated visdiff tests
    -x      - Execute the tests using the --headless flag in Chrome
    -u [baseUrl]  - Override the calypsoBaseURL config
    -h      - This help listing

## To run headlessly

By default the tests start their own Selenium server in the background, which in turn launches a Chrome browser on your desktop where you can watch the tests execute.  This can be a bit of a headache if you're trying to do other work while the tests are running, as the browser may occasionally steal focus back (although that's mostly been resolved).

The easiest way to run "headlessly" without a visible window is to add the `-x` flag when running `run.sh` or using the `HEADLESS=1` environment variable which will run Chrome with the --headless flag.

1. `./run.sh -g -x`

or

1. `export HEADLESS=1`
1. `./node_modules/.bin/mocha specs/wp-log-in-out-spec.js`
