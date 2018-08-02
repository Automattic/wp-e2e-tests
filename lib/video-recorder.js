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

function getFreeDisplay() {
	let i = 99;
	while ( fs.existsSync( `/tmp/.X${i}-lock` ) ) {
		i++;
	}
	process.env.DISPLAY = ':' + i;
}

export function startDisplay() {
	if ( process.env.TEST_VIDEO === 'true' ) {
		getFreeDisplay();
		global.display = child_process.exec(
			`Xvfb -ac ${process.env.DISPLAY} -screen 0 1440x1000x16 +extension RANDR > /dev/null 2>&1`
		);
	}
}

export function stopDisplay() {
	const xvfb = global.display;
	if ( process.env.TEST_VIDEO === 'true' && xvfb ) {
		let i = 0;
		while ( i < 30 ) {
			if ( global.__BROWSER__ ) {
				i++;
				global.__BROWSER__.sleep( 1000 );
			} else {
				xvfb.kill();
				global.display = null;
				break;
			}
		}
	}
}

export function startVideo() {
	if ( process.env.TEST_VIDEO === 'true' ) {
		const dateTime = new Date().toISOString().split( '.' )[0].replace( /:/g, '-' );
		const fileName = `${Math.random() * 10}-${dateTime}.mp4`;
		file = path.resolve( path.join( './screenshots/videos', fileName ) );
		createDir( path.dirname( file ) );
		global.screencast = child_process.spawn(
			'ffmpeg',
			[
				'-f',
				'x11grab',
				'-video_size',
				'1440x1000',
				'-r',
				30,
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

export function stopVideo( currentTest = null ) {
	if ( process.env.TEST_VIDEO === 'true' ) {
		const ffmpeg = global.screencast;

		// Stop the video if the test is failed
		if ( currentTest && ffmpeg ) {
			const currentTestName = currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
			const dateTime = new Date().toISOString().split( '.' )[0].replace( /:/g, '-' );
			const fileName = `${currentTestName}-${dateTime}.mp4`;
			const newFile = path.resolve( path.join( './screenshots/videos', fileName ) );

			ffmpeg.kill();

			fs.rename( file, newFile, function( err ) {
				global.screencast = null;

				if ( err ) {
					console.log( 'Screencast Video:' + file );
					throw err;
				}
				console.log( 'Screencast Video:' + newFile );
			} );
		} else if ( ffmpeg ) {
			ffmpeg.kill();
			fs.unlink( file, function() {
				global.screencast = null;
			} );
		}
	}
}
