# Run tests

## Table of Contents

- [To run the default specs](#to-run-the-default-specs-in-parallel-in-default-browser-sizes---mobile-and-desktop)
- [To run an individual spec](#to-run-an-individual-spec)
- [To run with different modes](#to-run-with-different-modes)
- [To run a specific suite of specs](#to-run-a-specific-suite-of-specs)
- [To run headlessly](#to-run-headlessly)
- [To run inside a Docker container](#to-run-inside-a-docker-container)
- [Jetpack Tests on CircleCI](#jetpack-tests-on-circleci)

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

`test.describe.only( 'Logging In and Out:', function() {`

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

Another way is to run a separate Selenium server via Docker.  There are lots of options for this on Docker Hub, but I recommend [this one](https://hub.docker.com/r/selenium/standalone-chrome-debug/), as it also allows you to VNC into the container if you do want to view the results.  Just drop the "-debug" from these steps if you don't need that feature.

1. If you haven't already, [install Docker](https://docs.docker.com/engine/installation/)
1. `export SELENIUM_REMOTE_URL=http://localhost:4444/wd/hub`
1. `docker-compose up -d`
1. Execute your tests as normal, and no browser will appear

*Note that this command needs to be run from the root of the wp-e2e-tests repo to enable data sharing from the host.  It opens VNC access at `localhost:5902`, with password "secret".  The `-d` flag runs in the background, omit that if you want to view the Selenium server output on the screen.  If running in the background you can stop it with the `docker-compose down` command.

A couple additional steps are necessary if you want to connect that Selenium server to a locally running branch of Calypso.  This runs two separate containers, for both Selenium and Calypso, and handles all the networking in between them.  These steps assume you've already configured and built Calypso for Docker with an image name of `wp-calypso`.

1. Set your `calypsoBaseUrl` config variable to `http://wpcalypso.wordpress.com` (note the http, not https)
1. From the `wp-e2e-tests` directory, run `docker-compose -f docker-compose/docker-compose-calypso.yml up -d`

Note that you'll need to supply the `-f docker-compose/docker-compose-calypso.yml` parameter to the `down` command as well, or you'll get a warning message about orphaned containers.

## To run inside a Docker container

We can also run the test suite (including Selenium) from within the context of a Docker container, which allows us to force a particular version of Chrome/driver to reduce compatibility issues.  This would mostly be useful from a CI server.

1. If you haven't already, [install Docker](https://docs.docker.com/engine/installation/)
1. Execute `docker build -t wp-e2e-tests .` to build the image (this may take several minutes the first time)
1. Execute `docker run -v /dev/shm:/dev/shm -v $(pwd):$(pwd) -w $(pwd) -e NODE_ENV -it --rm wp-e2e-tests ./run.sh -g -x` and it will run the default test suite at mobile/desktop width

## Jetpack Tests on CircleCI

The scripts in the `scripts/jetpack` directory are designed to build/configure a Jetpack site via the ServerPilot API on a DigitalOcean droplet.  Once you've built a droplet and connected it to ServerPilot (and configured your keys in the `spConfig` object), build the site via `./scripts/jetpack/wp-serverpilot-init.js`.  There are also scripts in that directory for installing/activating/connecting/disconnecting Jetpack, and deleting the site.

## Jetpack CI like tests localy

To locally run Jetpack CI tests against dynamicaly created sites (as they runs in CI) do the following:

1. `export CIRCLE_SHA1=#{some_random_long_lowercased_string}`
1. `export JETPACKHOST=CI`
1. create new dynamic site via: `$ ./scripts/jetpack/wp-serverpilot-init.js`
1. login (using jetpackUserCI creds) to your new shiny site and install Jetack (Do not activate!)
1. run activate script: `$ ./node_modules/.bin/mocha scripts/jetpack/wp-jetpack-activate.js`
1. run magelan tests: `./node_modules/.bin/magellan --config=./magellan-jetpack.json --test=path/to/test.js`
