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

var reportDir = process.env.CIRCLE_TEST_REPORTS || './reports';
var reportName = reportDir + '/xunit_' + new Date().getTime().toString() + '.xml';

/**
 * Expose `SpecXUnitSlack`.
 */

exports = module.exports = SpecXUnitSlack;

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
		// Slack notification
		runner.on( 'fail', function( test, err ) {
			var slackClient = slack( config.get( 'slackHook' ) );

			var fieldsObj = { Error: err.message };
			if ( process.env.DEPLOY_USER ) {
				fieldsObj['Git Diff'] = '<https://github.com/Automattic/wp-calypso/compare/' + process.env.PROD_REVISION + '...' + process.env.TO_DEPLOY_REVISION + '|Compare Commits>';
				fieldsObj.Author = process.env.DEPLOY_USER;
			}

			slackClient.send( {
				icon_emoji: ':a8c:',
				text: '<!subteam^S0G7K98MB|flow-patrol-squad-team> Test Failed: *' + test.fullTitle() + '* - Build <https://circleci.com/gh/' + process.env.CIRCLE_PROJECT_USERNAME + '/' + process.env.CIRCLE_PROJECT_REPONAME + '/' + process.env.CIRCLE_BUILD_NUM + '|#' + process.env.CIRCLE_BUILD_NUM + '>',
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
