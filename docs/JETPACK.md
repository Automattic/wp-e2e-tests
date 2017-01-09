# Jetpack Plugin End to End Tests

Automated end-to-end acceptance tests for the Jetpack plugin

## Once off Setup

You will need a WordPress.org hosted site. For testing publicize social media features you will need a test twitter account, a Facebook page, an optional Slack hook for reporting errors to Slack, and two WordPress.com accounts to test connectivity and likes.


### Step One: Create a new config file `local-jetpack.json` in the `config` directory:

```
{
  "explicitWaitMS": 20000,
  "browser": "chrome",
  "jetpacksite": "example.mystagingwebsite.com",
  "pressablesiteusername": "exampleuserid",
  "pressablesitepassword": "examplepassword",
  "twitterAccount": "twitterusername",
  "twitterPassword": "twitterpassword",
  "facebookPageName": "ExampleFBPage",
  "slackHook": "https://hooks.slack.com/services/keyHere",
  "reportWarningsToSlack": false,
  "testAccounts": {
	"jetpackConnectAdminUser": [
	  "WordPressComUserName",
	  "password"
	],
	"jetpackLikeUser": [
	  "WordPressComUserName",
	  "password"
	]
  }
}
```

### Step Two: Install Jetpack Beta on your site

1. Download the beta from [here](https://jetpack.com/download-jetpack-beta/)
2. Upload, install and activate this on your WordPress instance
3. Set the Jetpack beta to either download tagged betas or bleeding edge releases, and disable automatic updates (the e2e tests run an update themselves)

### Step Three: Connect to WordPress.com to see sharing settings

You need to select a plan - free is fine for these tests

### Step Four: Manually connect the Facebook Page for sharing

This is done on the sharing page - this is a manual step at the moment as Facebook Page is owned by a Facebook user account.

### Step Five: Manually enable all sharing buttons

In Sharing settings, you need to manually drag all sharing buttons to enable them. This is a once off task.

### Step Six: Install the "Code Snippets" plugin

1. Install [Code Snippets](https://wordpress.org/plugins/code-snippets/) via the plugins page
2. Add and activate the following code snippet with a name of `Related Posts Show Four`:

```
function jetpackme_more_related_posts( $options ) {
    $options['size'] = 4;
    return $options;
}
add_filter( 'jetpack_relatedposts_filter_options', 'jetpackme_more_related_posts' );
```

## Running the e2e tests

The installation instructions are the same as per the e2e tests.

You can switch to your Jetpack config using the following terminal command:

```
export NODE_ENV='jetpack'

```

You can run the specs using the following terminal command (desktop sized):

```
env BROWSERSIZE=desktop ./node_modules/mocha/bin/mocha --compilers js:babel-register specs-jetpack lib/after.js

```

or mobile sized

```
env BROWSERSIZE=mobile ./node_modules/mocha/bin/mocha --compilers js:babel-register specs-jetpack lib/after.js

```
