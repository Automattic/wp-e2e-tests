/** @format */

import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

/**
 * the screen recorder behavior is controlled by 2 environment variables:
 *
 *  - SCREENCAST_DIR - determine where the screencast files are saved.
 *  - SCREENCAST_SAVE_PASSED - weather saving screencast for passed tests
 */

export default class ScreenRecorder {
	constructor( test ) {
		this.test = test;
		this.movieFile = '';
		( this.recordingDir = process.env.SCREENCAST_DIR || './screenshots' ), ( this.recorder = '' );
		fs.mkdir( this.recordingDir, () => {} );
	}

	start( done ) {
		if ( this.recordingDir ) {
			this.movieFile = path.join(
				this.recordingDir,
				this.test.fullTitle().replace( /\W/g, '-' ) + '.mov'
			);
			console.log( this.movieFile );

			this.recorder = child_process.spawn( 'ffmpeg', [
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

			// if ( this.test.state === 'passed' && !process.env.SCREENCAST_SAVE_PASSED ) {
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
		if ( ! process.env.CIRCLECI ) {
			return;
		}

		let recorder;

		before( function( done ) {
			console.log( this.test.parent.title );

			recorder = new ScreenRecorder( this.test.parent );
			recorder.start( done );
		} );

		after( function( done ) {
			console.log( '====+++++=======' );
			console.log( this );
			console.log( '====+++++=======' );
			console.log( this.currentTest );
			console.log( '====+++++=======' );
			recorder.stop( done );
		} );
	}
}
