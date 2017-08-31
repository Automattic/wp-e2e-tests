# WordPress.com End to End Tests

Automated end-to-end acceptance tests for the [wp-calypso](https://github.com/Automattic/wp-calypso) client and WordPress.com in general.

[![Circle CI](https://circleci.com/gh/Automattic/wp-e2e-tests/tree/master.svg?style=svg)](https://circleci.com/gh/Automattic/wp-e2e-tests/tree/master)

## Table of contents

- [Pre-requisites](#pre-requisites)
  - [Install NodeJS and ChromeDriver](#install-nodejs-and-chromedriver)
  - [Install dependencies](#install-dependencies)
  - [Config / Environment Variables](#config--environment-variables)
- [Run tests](#run-tests)
  - [To run all the specs](#to-run-all-the-specs-in-default-browser-sizes---mobile-and-desktop)
  - [To run all the specs in parallel](#to-run-all-the-specs-in-parallel)
  - [To run an individual spec](#to-run-an-individual-spec)
  - [To run with different modes](#to-run-with-different-modes)
  - [To run a specific suite of specs](#to-run-a-specific-suite-of-specs)
  - [To run headlessly](#to-run-headlessly)
  - [To run inside a Docker container](#to-run-inside-a-docker-container)
  - [Config Values](#config-values)
  - [Standalone Environment Variables](#standalone-environment-variables)
  - [CircleCI Environment Variables](#circleci-environment-variables)
  - [Jetpack Tests on CircleCI](#jetpack-tests-on-circleci)
- [NodeJS Version](#nodejs-version)
- [Launch Logged-In Window](#launch-logged-in-window)


## Pre-requisites


### Install NodeJS and ChromeDriver

```
brew install node chromedriver
```

### Install dependencies
```
npm install
```

### Config / Environment Variables

The tests use the node [config](https://www.npmjs.com/package/config) library to specify config values for the tests.

Under the config directory, there are files for each environment: <code>default.json</code> is the base for all environments, then <code>development.json</code> for local, and <code>test.json</code> for CI.

You can also use local config files that are not committed.

The config files should be added under the `config/` tree and should follow the naming scheme: `local-<env>.json`

The properties in the local configuration override the `default.json` properties. This is useful for local testing of different configurations on local, e.g. testing on local Calypso instance, instead of production, by setting the `calypsoBaseURL` property to `http://calypso.localhost:3000`.

If the configuration doesn't exist, the code falls back to using the environmental variables.

Note: `NODE_ENV` is still required, as it is used to determine what `<env>` config to load.

For example: `export NODE_ENV='personal'`

An example configuration file is provided in the config directory.

The local configurations are excluded from the repository, in order to prevent accidental commit of sensitive data.

**Please don't commit usernames and passwords in these (non local- )files!**


## Run tests


### To run the default specs in parallel (in default browser sizes - mobile and desktop)

`./run.sh -g`

- or -

`./node_modules/.bin/magellan`

See the magellan.json file for the default parameters.  This is the process used in CI.

**NOTE!** - The magellan mocha plugin will search for all suites tagged with `@parallel`.  If you add a new test to this repo, you MUST add that tag to ensure that your test is run via CircleCI.

### To run an individual spec

`./node_modules/.bin/mocha specs/wp-log-in-out-spec.js`

Note: you can also change the spec _temporarily_ the use the <code>.only</code> syntax so it is the only spec that runs (making sure this isn't committed)

eg.

`test.describe.only( 'Logging In and Out:', function() {`

## To run with different modes
All tests should be written to work in three modes: desktop (1440 wide), tablet (1024 wide) and mobile (375 wide).

You can run tests in different modes by setting an environment variable `BROWSERSIZE` to either `desktop`, `tablet` or `mobile`.

Eg:

`env BROWSERSIZE=tablet ./node_modules/.bin/mocha specs

Or you can use the -s option on the run.sh script:

`./run.sh -g -s mobile`
`./run.sh -g -s desktop,tablet`


### To run a specific suite of specs

The `run.sh` script takes the following parameters, which can be combined to execute a variety of suites
```
-a [workers]	  - Number of parallel workers in Magellan (defaults to 3)
-R		  - Use custom Slack/Spec/XUnit reporter, otherwise just use Spec reporter
-p 		  - Execute the tests in parallel via CircleCI envvars (implies -g -s mobile,desktop)
-b [branch]	  - Run tests on given branch via https://calypso.live
-s		  - Screensizes in a comma-separated list (defaults to mobile,desktop)
-g		  - Execute general tests in the specs/ directory
-j 		  - Execute Jetpack tests in the specs-jetpack-calypso/ directory (desktop and mobile)
-W		  - Execute WooCommerce tests in the specs-woocommerce/ directory (desktop and mobile)
-H [host]	  - Specify an alternate host for Jetpack tests
-w		  - Only execute signup tests on Windows/IE11, not compatible with -g flag
-l [config]	  - Execute the critical visdiff tests via Sauce Labs with the given configuration
-c		  - Exit with status code 0 regardless of test results
-m [browsers]	  - Execute the multi-browser visual-diff tests with the given list of browsers via grunt.  Specify browsers in comma-separated list or 'all'
-f		  - Tell visdiffs to fail the tests rather than just send an alert
-i		  - Execute i18n screenshot tests, not compatible with -g flag
-U		  - Execute the i18n screenshot upload script in scripts/
-v		  - Execute the visdiff tests in specs-visdiff/
-x		  - Execute the tests from the context of xvfb-run
-u [baseUrl]	  - Override the calypsoBaseURL config
-h		  - This help listing
```

### To run headlessly

By default the tests start their own Selenium server in the background, which in turn launches a Chrome browser on your desktop where you can watch the tests execute.  This can be a bit of a headache if you're trying to do other work while the tests are running, as the browser may occasionally steal focus back (although that's mostly been resolved).  The easiest way to run "headlessly" without a visible window is to run a separate Selenium server via Docker.  There are lots of options for this on Docker Hub, but I recommend [this one](https://hub.docker.com/r/selenium/standalone-chrome-debug/), as it also allows you to VNC into the container if you do want to view the results.  Just drop the "-debug" from these steps if you don't need that feature.

1. If you haven't already, [install Docker](https://docs.docker.com/engine/installation/)
1. `export SELENIUM_REMOTE_URL=http://localhost:4444/wd/hub`
1. `docker-compose up -d`
1. Execute your tests as normal, and no browser will appear

*Note that this command needs to be run from the root of the wp-e2e-tests repo to enable data sharing from the host.  It opens VNC access at `localhost:5902`, with password "secret".  The `-d` flag runs in the background, omit that if you want to view the Selenium server output on the screen.  If running in the background you can stop it with the `docker-compose down` command.

A couple additional steps are necessary if you want to connect that Selenium server to a locally running branch of Calypso.  This runs two separate containers, for both Selenium and Calypso, and handles all the networking in between them.  These steps assume you've already configured and built Calypso for Docker with an image name of `wp-calypso`.

1. Set your `calypsoBaseUrl` config variable to `http://wpcalypso.wordpress.com` (note the http, not https)
1. From the `wp-e2e-tests` directory, run `docker-compose -f docker-compose/docker-compose-calypso.yml up -d`

Note that you'll need to supply the `-f docker-compose/docker-compose-calypso.yml` parameter to the `down` command as well, or you'll get a warning message about orphaned containers.

### To run inside a Docker container
We can also run the test suite (including Selenium) from within the context of a Docker container, which allows us to force a particular version of Chrome/driver to reduce compatibility issues.  This would mostly be useful from a CI server.

1. If you haven't already, [install Docker](https://docs.docker.com/engine/installation/)
1. Execute `docker build -t wp-e2e-tests .` to build the image (this may take several minutes the first time)
1. Execute `docker run -v /dev/shm:/dev/shm -v $(pwd):$(pwd) -w $(pwd) -e NODE_ENV -it --rm wp-e2e-tests ./run.sh -g -x` and it will run the default test suite at mobile/desktop width

### Config Values

A full list of config values are:

| Name | Description | Example | Required | Store in file? |
| ---- | ----------- | ------- | -------- | ------------------- |
| calypsoBaseURL | The home page for calypso | https://wordpress.com | Yes | Yes |
| explicitWaitMS | The explicit wait time in milliseconds to wait for an element to appear - for example a widget loading data via an API | 10000 | Yes | Yes |
| mochaTimeoutMS | This is the maximum total time in milliseconds a single mocha end to end test can take to finish - otherwise it will time out. | 120000 | Yes | Yes |
| mochaDevDocsTimeoutMS | A unique timeout value for visual diff tests on the /devdocs pages | 1000000 | Yes (visdiff testing only) | Yes |
| startBrowserTimeoutMS | This is the maximum total time in milliseconds that the browser can take to start - this is different from test time as we want it to fail fast | 30000 | Yes | Yes |
| startAppTimeoutMS | This is the maximum total time in milliseconds that the app can take to start for mobile testing - this is different from test time as we want it to fail fast | 240000 | Yes (for app testing only)| Yes |
| afterHookTimeoutMS | This is the maximum total time in milliseconds that an after test hook can take including capturing the screenshots | 20000 | Yes | Yes |
| browser | The browser to use: either <code>firefox</code> or <code>chrome</code> | <code>chrome</code> | Yes |  Yes |
| proxy | The type of proxy to use: either <code>system</code> to use whatever your system is configured to use, or <code>direct</code> to use no proxy. Also supports <code>charles</code> to send web traffic through the [Charles Proxy](https://www.charlesproxy.com/) app for troubleshooting.| <code>direct</code> | Yes |  Yes |
| saveAllScreenshots | Whether screenshots should be saved for all steps, including those that pass | <code>false</code> | Yes |  Yes |
| neverSaveScreenshots | Overrides the screenshot function so nothing is captured.  This is intended for use with the Applitools visual diff specs, since the screenshots are handled via their utilities instead. | <code>false</code> | Yes |  Yes |
| checkForConsoleErrors | Automatically report on console errors in the browser | <code>true</code> | Yes |  Yes |
| reportWarningsToSlack | Specifies whether warnings should be reported to Slack - should be used for CI builds | <code>false</code> | Yes |  Yes |
| closeBrowserOnComplete | Specifies whether to close the browser window when the tests are done | <code>true</code> | Yes |  Yes |
| sauceConfigurations | Config values for launching browsers on Sauce Labs | <code>{ "osx-chrome": { "browserName": "chrome", "platform": "OS X 10.11", "screenResolution": "2048x1536", "version": "50.0" } }</code>  | Yes (if using Sauce) |  Yes |
| knownABTestKeys | An array of expected, known AB testing keys used in localstorage. If a key is found on any page that isn't in here, the test will fail | [ "freeTrials_20160112", "plansPageBusinessAATest_20160108" ] | Yes | Yes |
| overrideABTests | An array of key/value pairs for AB tests and their values to manually override their settings | [ [ "signupStore_20160927", "designTypeWithStore" ] ] | Yes | Yes |
| testUserName   | This is an existing test WordPress.com account for testing purposes - this account should have a **single** site | testuser123 | Yes | **NO** |
| testPassword   | This is the password for the test WordPress.com account | testpassword$$$%### | Yes | **NO** |
| testUserNameMultiSite   | This is an existing test WordPress.com account for testing purposes **that has multiple sites** | testuser123 | Yes | **NO** |
| testPasswordMultiSite   | This is the password for the test WordPress.com account **that has multiple sites** | testpassword$$$%### | Yes | **NO** |
| testUserNameJetpack   | This is an existing test WordPress.com account for testing purposes **that has a single jetpack site** | testuser123 | Yes | **NO** |
| testPasswordJetpack   | This is the password for the test WordPress.com account **that has a single jetpack site** | testpassword$$$%### | Yes | **NO** |
| testSiteForInvites   | This is wordpress.com site that is used for testing invitations | e2eflowtesting.wordpress.com | Yes | **NO** |
| privateSiteForInvites   | This is a wordpress.com **private** site that is used for testing invitations | e2eflowtestingprivate.wordpress.com | Yes | **NO** |
| mailosaurAPIKey   | This is the API key from mailosaur used for testing email | hsjdhsjdh7878sd | Yes | **NO** |
| inviteInboxId   | This is an inbox id from mailosaur used for **invite** email testing | sad34id44ss | Yes | **NO** |
| signupInboxId   | This is an inbox id from mailosaur used for **signup** email testing | sad34id44ss | Yes | **NO** |
| domainsInboxId   | This is an inbox id from mailosaur used for **domains** email testing | sad34id44ss | Yes | **NO** |
| publicizeTwitterAccount | This is the name of the test twitter account connected to your test username | @endtoendtesting | Yes | **NO** |
| passwordForNewTestSignUps | This is the password that will be set for new sign ups created for testing purposes | alongcomplexpassword%### | Yes | **NO** |
| storeSandboxCookieValue | This is a secret cookie value used for testing payments |  | No | **NO** |
| slackHook | This is a Slack incoming webhook where notifications are sent for test status (https://my.slack.com/services/new/incoming-webhook -- requires Slack login) | https://hooks.slack.com/services/XXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX | No | **NO** |
| slackTokenForScreenshots | This is a Slack token used for uploading screenshots (https://api.slack.com/custom-integrations/legacy-tokens -- requires Slack login) | XXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXXX-XXXXXXXXXX | No | **NO** |
| slackChannelForScreenshots | String name (including the `#`) of the channel to receive screenshots | #e2eflowtesting-notif | No | Yes |
| emailPrefix | A string to stick on the beginning of the e-mail addresses used for invites and signups | username | No | **NO** |
| testAccounts | A JSON object with username/password pairs assigned to keynames for easy retrieval.  The necessary accounts can be found in the config/local.example.json file.  | {"defaultUser": ["username1","password1"], "multiSiteUser": ["username2","password2"] } | No | **NO** |
| highlightElements | Boolean to indicate whether to visually highlight elements being interacted with on the page | true | No | Yes |
| restApiApplication | A JSON object with your [WordPress REST API app](https://developer.wordpress.com/apps/) client ID, redirect URI, and client secret | {"client_id": "YOUR_CLIENT_ID", "redirect_uri": "YOUR_REDIRECT_URI", "client_secret": "YOUR CLIENT_SECRET"} | Yes (for REST API scripts only) | **NO** |
| spConfig | A JSON object with your [ServerPilot API](serverpilot.io) client ID, API key, and System User ID | {"clientId": "YOUR_CLIENT_ID", "apiKey": "YOUR_API_KEY", "sysuserid": "YOUR_SYSUSERID"} | Yes (for Jetpack on CI scripts only) | **NO** |

### Standalone Environment Variables


| Name | Description | Example | Required | Store in file? |
| ---- | ----------- | ------- | -------- | ------------------- |
| EYESDEBUG | If this is set, no connection is opened to Applitools, only local screenshots are taken | 1 | No | **NO** |
| MAGELLANDEBUG | If this is set, the full mocha output is printed while running Magellan | 1 | No | **NO** |
| SAUCEDEBUG | If this is set, on test failure a breakpoint will be set in SauceLabs, enabling you to continue interacting with the browser for troubleshooting | 1 | No | **NO** |

### CircleCI Environment Variables
These environment variables are intended for use inside CircleCI, to control which tests are being run

| Name | Description | Default | Required |
| ---- | ----------- | ------- | -------- |
| DISABLE_EMAIL | Setting this to `true` will cause the Invite and Signup tests to be skipped | false | No |
| SKIP_TEST_REGEX | The value of this variable will be used in the `-i -g *****` parameter, to skip any tests that match the given RegEx.  List multiple keywords separated by a `|` (i.e. `Invite|Domain|Theme`) | `Empty String` | No |

### Jetpack Tests on CircleCI
The scripts in the `scripts/jetpack` directory are designed to build/configure a Jetpack site via the ServerPilot API on a DigitalOcean droplet.  Once you've built a droplet and connected it to ServerPilot (and configured your keys in the `spConfig` object), build the site via `./scripts/jetpack/wp-serverpilot-init.js`.  There are also scripts in that directory for installing/activating/connecting/disconnecting Jetpack, and deleting the site.

### NodeJS Version
The node version should be defined in the `.nvmrc` file for use with the [nvm](https://github.com/creationix/nvm) project.  When changing the version a new Docker container should be built/pushed to Docker Hub for use on CircleCI 2.0

### Launch Logged-In Window
To facilitate manual testing, the [launch-wpcom-login.js](/scripts/launch-wpcom-login.js) file in `/scripts` will launch a Chrome browser window to WordPress.com and log in with the account definition given on the command line.  The only config requirement for this is that the `local-${NODE_ENV}.json` file needs to have the `testAccounts` object defined.  If no account is given on the command line, `defaultUser` will be used.

Example:
```bash
./node_modules/.bin/babel-node scripts/launch-wpcom-login.js multiSiteUser
```
