# WordPress.com End to End Tests

Automated end-to-end acceptance tests for the [wp-calypso](https://github.com/Automattic/wp-calypso) client and WordPress.com in general.

[![Circle CI](https://circleci.com/gh/Automattic/wp-e2e-tests/tree/master.svg?style=svg)](https://circleci.com/gh/Automattic/wp-e2e-tests/tree/master)

## Pre-requisites


### Install NodeJS and ChromeDriver

```
brew install node chromedriver
```

#### Install dependencies
```
npm install
npm pack lib/reporter
npm install ./spec-xunit-slack-reporter-0.0.1.tgz
```
Note - One of the dependencies for mobile app testing is [Appium](http://appium.io/), which in turn requires Java.  If you don't plan on running any mobile tests and don't have Java installed you can safely ignore the warnings given by `npm install`

#### Config / Environment Variables

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

#### To run the specs (in default browser sizes - mobile and desktop)

`./run.sh -g`

#### To run an individual spec

`./node_modules/mocha/bin/mocha specs/wp-log-in-out-spec.js lib/after.js`

Note: you can also change the spec _temporarily_ the use the <code>.only</code> syntax so it is the only spec that runs (making sure this isn't committed)

eg.

`test.describe.only( 'Logging In and Out:', function() {`

#### To run a specific suite of specs

The `run.sh` script takes the following parameters, which can be combined to execute a variety of suites
```
-R		  - Use custom Slack/Spec/XUnit reporter, otherwise just use Spec reporter
-p 		  - Execute the tests in parallel via CircleCI envvars (implies -g -s mobile,desktop)
-b [branch]	  - Run tests on given branch via https://calypso.live
-s		  - Screensizes in a comma-separated list (defaults to mobile,desktop)
-g		  - Execute general tests in the specs/ directory
-j 		  - Execute Jetpack tests in the specs-jetpack-calypso/ directory
-H [host]	  - Specify an alternate host for Jetpack tests
-w		  - Only execute signup tests on Windows/IE11, not compatible with -g flag
-l [config]	  - Execute the critical visdiff tests via Sauce Labs with the given configuration
-c		  - Exit with status code 0 regardless of test results
-m [browsers]	  - Execute the multi-browser visual-diff tests with the given list of browsers via grunt.  Specify browsers in comma-separated list or 'all'
-f		  - Tell visdiffs to fail the tests rather than just send an alert
-i		  - Execute i18n tests in the specs-i18n/ directory, not compatible with -g flag
-v		  - Execute the visdiff tests in specs-visdiff/
-h		  - This help listing
```

#### To run

All tests should be written to work in three modes: desktop (1440 wide), tablet (1024 wide) and mobile (375 wide).

You can run tests in different modes by setting an environment variable `BROWSERSIZE` to either `desktop`, `tablet` or `mobile`.

Eg:

`env BROWSERSIZE=tablet ./node_modules/mocha/bin/mocha --compilers js:babel-register specs lib/after.js`

Or you can use the -s option on the run.sh script:

`./run.sh -g -s mobile`
`./run.sh -g -s desktop,tablet`

#### Config Values

A full list of config values are:

| Name | Description | Example | Required | Store in file? |
| ---- | ----------- | ------- | -------- | ------------------- |
| authURL | The page where you authenticate to use calypso - this **should not** include the redirect | https://wordpress.com/wp-login.php | Yes | Yes |
| calypsoBaseURL | The home page for calypso | https://wordpress.com | Yes | Yes |
| explicitWaitMS | The explicit wait time in milliseconds to wait for an element to appear - for example a widget loading data via an API | 10000 | Yes | Yes |
| mochaTimeoutMS | This is the maximum total time in milliseconds a single mocha end to end test can take to finish - otherwise it will time out. | 120000 | Yes | Yes |
| mochaDevDocsTimeoutMS | A unique timeout value for visual diff tests on the /devdocs pages | 1000000 | Yes (visdiff testing only) | Yes |
| startBrowserTimeoutMS | This is the maximum total time in milliseconds that the browser can take to start - this is different from test time as we want it to fail fast | 30000 | Yes | Yes |
| startAppTimeoutMS | This is the maximum total time in milliseconds that the app can take to start for mobile testing - this is different from test time as we want it to fail fast | 240000 | Yes (for app testing only)| Yes |
| afterHookTimeoutMS | This is the maximum total time in milliseconds that an after test hook can take including capturing the screenshots | 20000 | Yes | Yes |
| browser | The browser to use: either <code>firefox</code> or <code>chrome</code> | <code>chrome</code> | Yes |  Yes |
| proxy | The type of proxy to use: either <code>system</code> to use whatever your system is configured to use, or <code>direct</code> to use no proxy. | <code>direct</code> | Yes |  Yes |
| saveAllScreenshots | Whether screenshots should be saved for all steps, including those that pass | <code>false</code> | Yes |  Yes |
| neverSaveScreenshots | Overrides the screenshot function so nothing is captured.  This is intended for use with the Applitools visual diff specs, since the screenshots are handled via their utilities instead. | <code>false</code> | Yes |  Yes |
| checkForConsoleErrors | Automatically report on console errors in the browser | <code>true</code> | Yes |  Yes |
| reportWarningsToSlack | Specifies whether warnings should be reported to Slack - should be used for CI builds | <code>false</code> | Yes |  Yes |
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
| emailPrefix | A string to stick on the beginning of the e-mail addresses used for invites and signups | username | No | **NO** |
| testAccounts | A JSON object with username/password pairs assigned to keynames for easy retrieval.  The necessary accounts can be found in the config/local.example.json file.  | {"defaultUser": ["username1","password1"], "multiSiteUser": ["username2","password2"] } | No | **NO** |
| highlightElements | Boolean to indicate whether to visually highlight elements being interacted with on the page | true | No | Yes |

#### Standalone Environment Variables


| Name | Description | Example | Required | Store in file? |
| ---- | ----------- | ------- | -------- | ------------------- |
| EYESDEBUG | If this is set, no connection is opened to Applitools, only local screenshots are taken | 1 | No | **NO** |
| SAUCEDEBUG | If this is set, on test failure a breakpoint will be set in SauceLabs, enabling you to continue interacting with the browser for troubleshooting | 1 | No | **NO** |

#### CircleCI Environment Variables
These environment variables are intended for use inside CircleCI, to control which tests are being run

| Name | Description | Default | Required |
| ---- | ----------- | ------- | -------- |
| DISABLE_EMAIL | Setting this to `true` will cause the Invite and Signup tests to be skipped | false | No |
| SKIP_TEST_REGEX | The value of this variable will be used in the `-i -g *****` parameter, to skip any tests that match the given RegEx.  List multiple keywords separated by a `|` (i.e. `Invite|Domain|Theme`) | `Empty String` | No |
