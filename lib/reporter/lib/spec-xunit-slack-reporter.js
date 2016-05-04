// This code combines the Mocha spec and xunit outputs with a ping to Slack on failure

/**
 * Module dependencies.
 */

var mocha = require( 'mocha' );
var fs = require( 'fs-extra' );
var Spec = mocha.reporters.Spec;
var XUnit = mocha.reporters.XUnit;
var utils = mocha.utils;
var inherits = utils.inherits;

// Requirements for Slack output
var slack = require( 'slack-notify' );
var config = require( 'config' );

var reportDir = process.env.CIRCLE_TEST_REPORTS || '.';
var reportName = reportDir + '/xunit_' + new Date().getTime().toString() + '.xml';

/**
 * Expose `SpecXUnitSlack`.
 */

exports = module.exports = SpecXUnitSlack;

function grabLogs( test ) {
	var driver = global.__BROWSER__;
	var shortTestFileName = test.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();

	driver.manage().logs().get( 'browser' ).then( function( logs ) {
		if ( logs.length > 0 ) {
			fs.writeFile( reportDir + '/' + process.env.BROWSERSIZE + '_' + shortTestFileName + '.json', JSON.stringify( logs ) );
		}
	} );
}

/**
 * Initialize a new `SpecXUnitSlack` test reporter.
 *
 * @api public
 * @param {Runner} runner Test runner object, handled implicitly by mocha
 */
function SpecXUnitSlack( runner ) {
	Spec.call( this, runner );
	XUnit.call( this, runner, { reporterOptions: { output: reportName } } );

	if ( config.has( 'slackHook' ) && process.env.CIRCLE_BRANCH === 'master' ) {
		runner.on( 'pass', function( test ) {
			grabLogs( test );
		} );

		// Slack notification
		runner.on( 'fail', function( test, err ) {
			var slackClient = slack( config.get( 'slackHook' ) );

			var fieldsObj = { Error: err.message };
			grabLogs( test );
			if ( process.env.DEPLOY_USER ) {
				fieldsObj['Git Diff'] = '<https://github.com/Automattic/wp-calypso/compare/' + process.env.PROD_REVISION + '...' + process.env.TO_DEPLOY_REVISION + '|Compare Commits>';
				fieldsObj.Author = process.env.DEPLOY_USER;
			}

			slackClient.send( {
				icon_emoji: ':a8c:',
				text: '<!here> Test Failed: *' + test.fullTitle() + '* - Build <https://circleci.com/gh/Automattic/calypso-e2e-tests/' + process.env.CIRCLE_BUILD_NUM + '|#' + process.env.CIRCLE_BUILD_NUM + '>',
				fields: fieldsObj,
				username: 'e2e Test Runner'
			} );
		} );
	}
}

/**
 * Inherit from Spec and XUnit prototypes.
 */
inherits( SpecXUnitSlack, Spec );
inherits( SpecXUnitSlack, XUnit );
