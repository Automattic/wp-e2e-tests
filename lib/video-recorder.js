/** @format */
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';

let file;

// Create directory for video files
function createDir( dir ) {
	dir = path.resolve( dir );
	if ( fs.existsSync( dir ) ) return dir;
	try {
		fs.mkdirSync( dir );
		return dir;
	} catch ( error ) {
		if ( error.code === 'ENOENT' ) {
			return createDir( path.dirname( dir ) ) && createDir( dir );
		}
		throw error;
	}
}

export function start( ) {
	if ( process.env.TEST_VIDEO === true ) {
		const dateTime = new Date().toISOString().split( '.' )[0].replace( /:/g, '-' );
		const fileName = `test-${dateTime}.mpg`;
		file = path.resolve( path.join( './screenshots/videos', fileName ) );
		createDir( path.dirname( file ) );
		global.screencast = child_process.spawn(
			'ffmpeg',
			[
				'-video_size',
				'1440x1000',
				'-r',
				30,
				'-f',
				'x11grab',
				'-i',
				process.env.DISPLAY,
				'-pix_fmt',
				'yuv420p',
				'-loglevel',
				'error',
				file
			]
		);
	}
}

export function stop( currentTest ) {
	if ( process.env.TEST_VIDEO === true ) {
		const ffmpeg = global.screencast;

		// Stop the video if the test is failed
		if ( currentTest && ffmpeg ) {
			const currentTestName = currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
			const dateTime = new Date().toISOString().split( '.' )[0].replace( /:/g, '-' );
			const fileName = `${currentTestName}-${dateTime}.mpg`;
			const newFile = path.resolve( path.join( './screenshots/videos', fileName ) );

			ffmpeg.kill();

			fs.rename( file, newFile, function( err ) {
				if ( err ) {
					console.log( 'Screencast Video:' + file );
					throw err;
				}
				console.log( 'Screencast Video:' + newFile );
			} );

			global.screencast = null;
		} else if ( ffmpeg ) {
			ffmpeg.kill();

			fs.unlink( file, function() {
				global.screencast = null;
			} );
		}
	}
}
