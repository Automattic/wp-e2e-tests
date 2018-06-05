/** @format */

const BaseReporter = require( 'testarmada-magellan' ).Reporter;
const util = require( 'util' );

// Requirements for Slack output
const Xvfb = require( 'xvfb' );
const screenRecorder = require( '../screen-recorder' );

let recorders = {};
let Reporter = function() {};

util.inherits( Reporter, BaseReporter );

Reporter.prototype.listenTo = function( testRun, test, source ) {
	source.on( 'message', msg => {
		if ( msg.type === 'worker-status' ) {
			// test.before( async function() {
			// 	this.timeout( startBrowserTimeoutMS );
			// 	return ( d = await driverManager.startBrowser() );
			// } );
			let testName = keyify( msg.name );
			console.log( msg );

			if ( msg.status === 'started' ) {
				let xvfb = new Xvfb();
				xvfb.startSync();
				console.log( '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~' );
				console.log( 'STARTING UP ' + testName + ' ON:' + xvfb.display() );
				console.log( '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~' );
				process.env.DISPLAY = xvfb.display();
				let recorder = screenRecorder( testName, xvfb.display() );
				recorder.start( () => {} );
				recorders[ testName ] = { xvfb: xvfb, recorder: recorder };
			}

			if ( msg.status === 'finished' ) {
				recorders[ testName ].recorder.stop( () => {} );
				recorders[ testName ].xvfb.stopSync( () => {} );
			}
		}
	} );
};

function keyify( string ) {
	return string.replace( /[\[\]():@]/g, '' ).replace( /\W/g, '-' );
}

module.exports = Reporter;
