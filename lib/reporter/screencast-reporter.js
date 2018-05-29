/** @format */

const BaseReporter = require( 'testarmada-magellan' ).Reporter;
const util = require( 'util' );

// Requirements for Slack output
const config = require( 'config' );
const fs = require( 'fs-extra' );

const Xvfb = require( 'xvfb' );
const screenRecorder = require( '../screen-recorder' );

let recorders = {};

let Reporter = function() {};

util.inherits( Reporter, BaseReporter );

Reporter.prototype.listenTo = function( testRun, test, source ) {
	// Print STDOUT/ERR to the screen for extra debugging
	if ( !! process.env.MAGELLANDEBUG ) {
		source.stdout.pipe( process.stdout );
		source.stderr.pipe( process.stderr );
	}

	// Create global report and screenshots directories
	let finalScreenshotDir = './screenshots';
	if ( process.env.SCREENSHOTDIR ) {
		finalScreenshotDir = `./${ process.env.SCREENSHOTDIR }`;
	}

	let screenshotDir = testRun.tempAssetPath + '/screenshots';
	if ( process.env.SCREENSHOTDIR ) {
		screenshotDir = testRun.tempAssetPath + `/${ process.env.SCREENSHOTDIR }`;
	}

	fs.mkdir( finalScreenshotDir, () => {} );

	source.on( 'message', msg => {
		if ( msg.type === 'worker-status' ) {
			console.log( '-------------' );
			console.log( msg );
			console.log( '-------------' );
			const testRunKey = keyify( msg.name );
			// const passCondition = msg.passed;
			// const failCondition =
			// 	! msg.passed && msg.status === 'finished' && test.maxAttempts === test.attempts + 1;

			if ( msg.status === 'started' ) {
				let xvfb = new Xvfb();
				xvfb.startSync();
				let recorder;
				recorder = screenRecorder( testRunKey );
				recorder.start();
				recorders[ testRunKey ] = { xvfb, recorder };
			}

			if ( msg.status === 'finished' ) {
				recorders[ testRunKey ].xvfb.stopSync();
				recorders[ testRunKey ].recorder.stop();
			}

			// if ( failCondition ) {
			// }
			// if ( passCondition ) {
			// }
		}
	} );
};

function keyify( string ) {
	string.replace( /[\[\]():@]/g, '' ).replace( /\W/g, '-' );
}

module.exports = Reporter;
