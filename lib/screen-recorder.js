/** @format */

// import fs from 'fs';
// import path from 'path';
// import child_process from 'child_process';
const fs = require( 'fs' );
const path = require( 'path' );
const child_process = require( 'child_process' );

/**
 * the screen recorder behavior is controlled by 2 environment variables:
 *
 *  - SCREENCAST_DIR - determine where the screencast files are saved.
 *  - SCREENCAST_SAVE_PASSED - weather saving screencast for passed tests
 */

// export default class ScreenRecorder {
// 	constructor( test ) {
// 		test = test;
// 		movieFile = '';
// 		( recordingDir = process.env.SCREENCAST_DIR || './screenshots' ), ( recorder = '' );
// 		fs.mkdir( recordingDir, () => {} );
// 	}

// 	start( done ) {
// 		if ( recordingDir ) {
// 			movieFile = path.join(
// 				recordingDir,
// 				test + '.mov'
// 			);
// 			console.log( movieFile );

// 			recorder = child_process.spawn( 'ffmpeg', [
// 				'-y',
// 				'-r',
// 				'30',
// 				'-g',
// 				'300',
// 				'-f',
// 				'x11grab',
// 				'-s',
// 				'1440x1000',
// 				'-i',
// 				process.env.DISPLAY,
// 				'-vcodec',
// 				'qtrle',
// 				movieFile,
// 			] );

// 			recorder.stdout.on( 'data', data => {
// 				console.log( `child stdout:\n${ data }` );
// 			} );

// 			recorder.stderr.on( 'data', data => {
// 				console.error( `child stderr:\n${ data }` );
// 			} );
// 		}
// 		done();
// 	}

// 	stop( done ) {
// 		if ( recordingDir ) {
// 			if ( recorder ) {
// 				recorder.kill();
// 			}

// 			// if ( test.state === 'passed' && !process.env.SCREENCAST_SAVE_PASSED ) {
// 			// 	fs.unlink( movieFile, done );
// 			// } else {
// 			// 	done();
// 			// }
// 			done();
// 		} else {
// 			done();
// 		}
// 	}

// 	applyMochaHooks() {
// 		if ( ! process.env.CIRCLECI ) {
// 			return;
// 		}

// 		let recorder;

// 		before( function( done ) {
// 			console.log( test.parent.title );

// 			recorder = new ScreenRecorder( test.parent );
// 			recorder.start( done );
// 		} );

// 		after( function( done ) {
// 			console.log( '====+++++=======' );
// 			console.log( this );
// 			console.log( '====+++++=======' );
// 			console.log( this.currentTest );
// 			console.log( '====+++++=======' );
// 			recorder.stop( done );
// 		} );
// 	}
// }

module.exports = function( test ) {
	var api = Object.create( null ),
		movieFile,
		recordingDir = process.env.SCREENCAST_DIR,
		recorder;

	movieFile = '';
	( recordingDir = process.env.SCREENCAST_DIR || './screenshots' ), ( recorder = '' );
	fs.mkdir( recordingDir, () => {} );

	api.start = function() {
		if ( recordingDir ) {
			movieFile = path.join( recordingDir, test + Date.now() + '.mov' );
			console.log( movieFile );

			recorder = child_process.spawn( 'ffmpeg', [
				'-y',
				'-r',
				'30',
				'-g',
				'300',
				'-f',
				'x11grab',
				'-s',
				'1440x1000',
				'-i',
				process.env.DISPLAY,
				'-vcodec',
				'qtrle',
				movieFile,
			] );

			recorder.stdout.on( 'data', data => {
				console.log( `child stdout:\n${ data }` );
			} );

			recorder.stderr.on( 'data', data => {
				console.error( `child stderr:\n${ data }` );
			} );
		}
	};

	api.stop = function() {
		if ( recordingDir ) {
			if ( recorder ) {
				recorder.kill();
			}

			// if ( test.state === 'passed' && !process.env.SCREENCAST_SAVE_PASSED ) {
			// 	fs.unlink( movieFile, done );
			// } else {
			// 	done();
			// }
		}
	};

	return api;
};
