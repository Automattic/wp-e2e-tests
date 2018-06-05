/** @format */

// import fs from 'fs';
// import path from 'path';
// import child_process from 'child_process';
const fs = require( 'fs' );
const path = require( 'path' );
const child_process = require( 'child_process' );

// const Xvfb = require( 'xvfb' );

/**
 * the screen recorder behavior is controlled by 2 environment variables:
 *
 *  - SCREENCAST_DIR - determine where the screencast files are saved.
 *  - SCREENCAST_SAVE_PASSED - weather saving screencast for passed tests
 */

// export default class ScreenRecorder {
// 	constructor( test, display ) {
// 		this.test = test;
// 		this.display = display;
// 		this.movieFile = '';
// 		this.recordingDir = process.env.SCREENCAST_DIR || './screenshots';
// 		this.recorder = '';
// 		fs.mkdir( this.recordingDir, () => {} );
// 	}

// 	keyify( string ) {
// 		return string.replace( /[\[\]():@]/g, '' ).replace( /\W/g, '-' );
// 	}

// 	start( done ) {
// 		if ( this.recordingDir ) {
// 			this.movieFile = path.join(
// 				this.recordingDir,
// 				this.keyify( this.test ) + '-' + Date.now().toString() + '.mov'
// 			);
// 			console.log( this.movieFile );

// 			this.recorder = child_process.spawn( 'ffmpeg', [
// 				'-video_size',
// 				'1280x1024',
// 				'-framerate',
// 				'25',
// 				'-f',
// 				'x11grab',
// 				'-i',
// 				this.display || process.env.DISPLAY,
// 				this.movieFile,
// 			] );

// 			this.recorder.stdout.on( 'data', data => {
// 				console.log( `child stdout:\n${ data }` );
// 			} );

// 			this.recorder.stderr.on( 'data', data => {
// 				console.error( `child stderr:\n${ data }` );
// 			} );
// 		}
// 		return done();
// 	}

// 	stop( done ) {
// 		if ( this.recordingDir ) {
// 			if ( this.recorder ) {
// 				this.recorder.kill();
// 			}

// 			// if ( test.state === 'passed' && !process.env.SCREENCAST_SAVE_PASSED ) {
// 			// 	fs.unlink( movieFile, done );
// 			// } else {
// 			// 	done();
// 			// }
// 			return done();
// 		}
// 		return done();
// 	}

// 	static applyMochaHooks( test, driverManager, startBrowserTimeoutMS ) {
// 		// if ( ! process.env.CIRCLECI ) {
// 		// 	return;
// 		// }

// 		let recorder;
// 		let xvfb;
// 		let d;

// 		test.before( function( done ) {
// 			console.log( '>>>>>>>>>>>>>>> BEFORE applyMochaHooks' );

// 			xvfb = new Xvfb();
// 			xvfb.startSync();
// 			console.log( '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~' );
// 			console.log( xvfb.display() );
// 			console.log( '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~' );
// 			process.env.DISPLAY = xvfb.display();
// 			recorder = new ScreenRecorder( this.test.parent.title, xvfb.display() );
// 			recorder.start( done );
// 		} );

// 		test.before( async function() {
// 			this.timeout( startBrowserTimeoutMS );
// 			return ( d = await driverManager.startBrowser() );
// 		} );

// 		test.after( function( done ) {
// 			console.log( '>>>>>>>>>>>>>>> AFTER applyMochaHooks' );
// 			recorder.stop( done );
// 			xvfb.stopSync( done );
// 		} );

// 		return d;
// 	}
// }

module.exports = function( test, display ) {
	var api = Object.create( null ),
		movieFile,
		recordingDir = process.env.SCREENCAST_DIR || './screenshots',
		recorder,
		display = display,
		test = test;

	fs.mkdir( recordingDir, () => {} );

	api.keyify = function( string ) {
		return string.replace( /[\[\]():@]/g, '' ).replace( /\W/g, '-' );
	};

	api.start = function( done ) {
		if ( recordingDir ) {
			movieFile = path.join(
				recordingDir,
				api.keyify( test ) + '-' + Date.now().toString() + '.mov'
			);
			console.log( movieFile );

			recorder = child_process.spawn( 'ffmpeg', [
				'-video_size',
				'1280x1024',
				'-framerate',
				'25',
				'-f',
				'x11grab',
				'-i',
				display || process.env.DISPLAY,
				movieFile,
			] );

			recorder.stdout.on( 'data', data => {
				console.log( `child stdout:\n${ data }` );
			} );

			recorder.stderr.on( 'data', data => {
				console.error( `child stderr:\n${ data }` );
			} );
		}
		return done();
	};

	api.stop = function( done ) {
		if ( recordingDir ) {
			if ( recorder ) {
				recorder.kill();
			}

			// if ( test.state === 'passed' && !process.env.SCREENCAST_SAVE_PASSED ) {
			// 	fs.unlink( movieFile, done );
			// } else {
			// 	done();
			// }
			return done();
		}
		return done();
	};

	return api;
};
