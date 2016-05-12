# WordPress.com End to End Tests

Automated end-to-end acceptance tests for the [wp-calypso](https://github.com/Automattic/wp-calypso) client and WordPress.com in general.

[![Circle CI](https://circleci.com/gh/Automattic/wp-e2e-tests/tree/master.svg?style=svg)](https://circleci.com/gh/Automattic/wp-e2e-tests/tree/master)

## Pre-requisites


### Install NodeJS and ChromeDriver

```
brew install node-js chromedriver
```

#### Install dependencies
```
npm install
npm pack lib/reporter
npm install ./spec-xunit-slack-reporter-0.0.1.tgz
```

#### To run the specs (in default browser size)

`./run.sh -g`

#### To run an individual spec

`./node_modules/mocha/bin/mocha specs/wp-log-in-out-spec.js lib/after.js`

Note: you can also change the spec _temporarily_ the use the <code>.only</code> syntax so it is the only spec that runs (making sure this isn't committed)

eg.

`test.describe.only( 'Logging In and Out:', function() {`

#### To run a specific suite of specs

The `run.sh` script takes the following parameters, which can be combined to execute a variety of suites
```
-R		              - Use custom Slack/Spec/XUnit reporter, otherwise just use Spec reporter
-p [jobs]         - Execute [num] jobs in parallel (experimental)
-s		              - Screensizes in a comma-separated list (defaults to mobile,desktop,tablet)
-g		              - Execute general tests in the specs/ directory
-i		              - Execute i18n tests in the specs-i18n/ directory
-v [all/critical] - Execute the visdiff tests in specs-visdiff[/critical].  Must specify either 'all' or 'critical'.
-h		              - This help listing
```

#### To run

All tests should be written to work in three modes: desktop (1440 wide), tablet (1024 wide) and mobile (375 wide).

You can run tests in different modes by setting an environment variable `BROWSERSIZE` to either `desktop`, `tablet` or `mobile`.

Eg:

`env BROWSERSIZE=tablet ./node_modules/mocha/bin/mocha --compilers js:babel-register specs lib/after.js`

Or you can use the -s option on the run.sh script:

`./run.sh -g -s mobile`
`./run.sh -g -s desktop,tablet`

#### Config / Environment Variables

The tests use the node config library to specify config values for the tests.

Under the config directory, there are files for each environment: <code>default.json</code> is the base for all environments, then <code>development.json</code> for local, and <code>test.json</code> for CI.

You can also use local config files that are not committed.

The config files should be added under the `config/` tree and should follow the naming scheme: `local-<env>.json`

The properties in the local configuration override the `default.json` properties. This is useful for local testing of different configurations on local, e.g. testing on local Calypso instance, instead of live one.

If the configuration doesn't exist, the code falls back to using the environmental variables.

Note: `NODE_ENV` is still required, as it is used to determine what `<env>` config to load.

For example: `export NODE_ENV='personal'`

An example configuration file is provided.

The local configurations are excluded from the repository, in order to prevent accidental commit of sensitive data.

**Please don't commit usernames and passwords in these files!**

**Note:** As the <code>NODE_CONFIG</code> variable is growing unwieldy for use in CircleCI, some environment variables are also being split out into separate entries.  These are listed below the *Config Values* section.


#### Config Values

A full list of config values are:

| Name | Description | Example | Required | Store in file? |
| ---- | ----------- | ------- | -------- | ------------------- |
| browser | The browser to use: either <code>firefox</code> or <code>chrome</code> | <code>chrome</code> | Yes |  Yes |
| proxy | The type of proxy to use: either <code>system</code> to use whatever your system is configured to use, or <code>direct</code> to use no proxy. | <code>direct</code> | Yes |  Yes |
| saveAllScreenshots | Whether screenshots should be saved for all steps, including those that pass | <code>false</code> | Yes |  Yes |
| neverSaveScreenshots | Overrides the screenshot function so nothing is captured.  This is intended for use with the Applitools visual diff specs, since the screenshots are handled via their utilities instead. | <code>false</code> | Yes |  Yes |
| authURL | The page where you authenticate to use calypso - this **should not** include the redirect | https://wordpress.com/wp-login.php | Yes | Yes |
| calypsoBaseURL | The home page for calypso | https://wpcalypso.wordpress.com | Yes | Yes |
| explicitWaitMS | The explicit wait time in milliseconds to wait for an element to appear - for example a widget loading data via an API | 10000 | Yes | Yes |
| mochaTimeoutMS | This is the maximum total time in milliseconds a single mocha end to end test can take to finish - otherwise it will time out. | 120000 | Yes | Yes |
| startBrowserTimeoutMS | This is the maximum total time in milliseconds that the browser can take to start - this is different from test time as we want it to fail fast | 10000 | Yes | Yes |
| afterHookTimeoutMS | This is the maximum total time in milliseconds that an after test hook can take including capturing the screenshots | 20000 | Yes | Yes |
| knownABTestKeys | An array of expected, known AB testing keys used in localstorage. If a key is found on any page that isn't in here, the test will fail | [ "freeTrials_20160112", "plansPageBusinessAATest_20160108" ] | Yes | Yes |
| testUserName   | This is an existing test WordPress.com account for testing purposes - this account should have a **single** site | testuser123 | Yes | **NO** |
| testPassword   | This is the password for the test WordPress.com account | testpassword$$$%### | Yes | **NO** |
| testUserNameMultiSite   | This is an existing test WordPress.com account for testing purposes **that has multiple sites** | testuser123 | Yes | **NO** |
| testPasswordMultiSite   | This is the password for the test WordPress.com account **that has multiple sites** | testpassword$$$%### | Yes | **NO** |
| testUserNameJetpack   | This is an existing test WordPress.com account for testing purposes **that has a single jetpack site** | testuser123 | Yes | **NO** |
| testPasswordJetpack   | This is the password for the test WordPress.com account **that has a single jetpack site** | testpassword$$$%### | Yes | **NO** |
| jetpackSiteId         | This is the test jetpack site id | 12344 | Yes | **NO** |
| testSiteForInvites   | This is wordpress.com site that is used for testing invitations | e2eflowtesting.wordpress.com | Yes | **NO** |
| privateSiteForInvites   | This is a wordpress.com **private** site that is used for testing invitations | e2eflowtestingprivate.wordpress.com | Yes | **NO** |
| mailosaurAPIKey   | This is the API key from mailosaur used for testing email | hsjdhsjdh7878sd | Yes | **NO** |
| inviteInboxId   | This is an inbox id from mailosaur used for **invite** email testing | sad34id44ss | Yes | **NO** |
| signupInboxId   | This is an inbox id from mailosaur used for **signup** email testing | sad34id44ss | Yes | **NO** |
| domainsInboxId   | This is an inbox id from mailosaur used for **domains** email testing | sad34id44ss | Yes | **NO** |
| publicizeTwitterAccount | This is the name of the test twitter account connected to your test username | @endtoendtesting | Yes | **NO** |
| passwordForNewTestSignUps | This is the password that will be set for new sign ups created for testing purposes | alongcomplexpassword%### | Yes | **NO** |
| storeSandboxCookieValue | This is a secret cookie value used for testing payments |  | No | **NO** |
| slackHook | This is a Slack incoming webhook where notifications are sent for new accounts that are created (https://my.slack.com/services/new/incoming-webhook -- requires Slack login) | https://hooks.slack.com/services/XXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX | No | **NO** |
| emailPrefix | A string to stick on the beginning of the e-mail addresses used for invites and signups | username | No | **NO** |
| testAccounts | A JSON object with username/password pairs assigned to keynames for easy retrieval.  The necessary keys are shown in the example to the right.  | {"defaultUser": ["username1","password1"], "multiSiteUser": ["username2","password2"], "jetpackUser": ["username3","password3"], "visualUser": ["username4", "password4"]}, "privateSiteUser": ["username5", "password5"] | No | **NO** |

#### Standalone Environment Variables


| Name | Description | Example | Required | Store in file? |
| ---- | ----------- | ------- | -------- | ------------------- |
| slackToken | This is a token for uploading files/screenshots to Slack (https://api.slack.com/tokens -- requires Slack login) | xxxx-##########-##########-###########-XXXXXXXXXX | No | **NO** |

#### CircleCI Environment Variables
These environment variables are intended for use inside CircleCI, to control which tests are being run

| Name | Description | Default | Required |
| ---- | ----------- | ------- | -------- |
| DISABLE_EMAIL | Setting this to `true` will cause the Invite and Signup tests to be skipped | false | No |
| RUN_VISDIFF | Setting this to `false` will cause the visual diff tests to be skipped | true | No |
| SKIP_TEST_REGEX | The value of this variable will be used in the `-i -g *****` parameter, to skip any tests that match the given RegEx.  List multiple keywords separated by a `|` (i.e. `Invite|Domain|Theme`) | `Empty String` | No |
