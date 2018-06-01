/** @format */

// import fs from 'fs';
// import path from 'path';
// import child_process from 'child_process';
const fs = require( 'fs' );
const path = require( 'path' );
const child_process = require( 'child_process' );

const Xvfb = require( 'xvfb' );

/**
 * the screen recorder behavior is controlled by 2 environment variables:
 *
 *  - SCREENCAST_DIR - determine where the screencast files are saved.
 *  - SCREENCAST_SAVE_PASSED - weather saving screencast for passed tests
 */

export default class ScreenRecorder {
	constructor( test, display ) {
		this.test = test;
		this.display = display;
		this.movieFile = '';
		this.recordingDir = process.env.SCREENCAST_DIR || './screenshots';
		this.recorder = '';
		fs.mkdir( this.recordingDir, () => {} );
	}

	start( done ) {
		if ( this.recordingDir ) {
			this.movieFile = path.join(
				this.recordingDir,
				this.test + '-' + Date.now().toString() + '.mov'
			);
			console.log( this.movieFile );

			this.recorder = child_process.spawn( 'ffmpeg', [
				'-video_size',
				'1280x1024',
				'-framerate',
				'25',
				'-f',
				'x11grab',
				'-i',
				this.display || process.env.DISPLAY,
				this.movieFile,
			] );

			this.recorder.stdout.on( 'data', data => {
				console.log( `child stdout:\n${ data }` );
			} );

			this.recorder.stderr.on( 'data', data => {
				console.error( `child stderr:\n${ data }` );
			} );
		}
		done();
	}

	stop( done ) {
		if ( this.recordingDir ) {
			if ( this.recorder ) {
				this.recorder.kill();
			}

			// if ( test.state === 'passed' && !process.env.SCREENCAST_SAVE_PASSED ) {
			// 	fs.unlink( movieFile, done );
			// } else {
			// 	done();
			// }
			done();
		} else {
			done();
		}
	}

	static applyMochaHooks() {
		// if ( ! process.env.CIRCLECI ) {
		// 	return;
		// }

		let recorder;
		let xvfb;

		before( function( done ) {
			xvfb = new Xvfb();
			xvfb.startSync();
			process.env.DISPLAY = xvfb.display();
			recorder = new ScreenRecorder( this.test.parent.title, xvfb.display() );
			recorder.start( done );
		} );

		after( function( done ) {
			recorder.stop( done );
			xvfb.stopSync( done );
		} );
	}
}

// module.exports = function( test ) {
// 	var api = Object.create( null ),
// 		movieFile,
// 		recordingDir = process.env.SCREENCAST_DIR || './screenshots',
// 		recorder;

// 	fs.mkdir( recordingDir, () => {} );

// 	api.start = function( done, display ) {
// 		if ( recordingDir ) {
// 			movieFile = path.join( recordingDir, test + '-' + Date.now().toString() + '.mov' );
// 			console.log( movieFile );

// 			// ffmpeg -video_size 1024x768 -framerate 25 -f x11grab -i $DISPLAY test.mov
// 			// recorder = child_process.spawn( 'ffmpeg', [
// 			// 	'-y',
// 			// 	'-r',
// 			// 	'30',
// 			// 	'-g',
// 			// 	'300',
// 			// 	'-f',
// 			// 	'x11grab',
// 			// 	'-s',
// 			// 	'1440x1000',
// 			// 	'-i',
// 			// 	display || process.env.DISPLAY,
// 			// 	'-vcodec',
// 			// 	'qtrle',
// 			// 	movieFile,
// 			// ] );

// 			recorder = child_process.spawn( 'ffmpeg', [
// 				'-video_size',
// 				'1280x1024',
// 				'-framerate',
// 				'25',
// 				'-f',
// 				'x11grab',
// 				'-i',
// 				display || process.env.DISPLAY,
// 				movieFile,
// 			] );

// 			recorder.stdout.on( 'data', data => {
// 				console.log( `child stdout:\n${ data }` );
// 			} );

// 			recorder.stderr.on( 'data', data => {
// 				console.error( `child stderr:\n${ data }` );
// 			} );

// 			done();
// 		}
// 	};

// 	api.stop = function( done ) {
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
// 		}
// 	};

// 	return api;
// };