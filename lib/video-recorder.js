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

export async function startDisplay() {
	if ( process.env.TEST_VIDEO === 'true' ) {
		await getFreeDisplay();
		return global.display = child_process.exec(
			`Xvfb -ac ${process.env.DISPLAY} -screen 0 1440x1000x16 +extension RANDR > /dev/null 2>&1`
		);
	}
}

export async function stopDisplay() {
	const xvfb = global.display;
	if ( process.env.TEST_VIDEO === 'true' && xvfb ) {
		await xvfb.kill();
		global.display = null;
	}
}

export async function startVideo() {
	if ( process.env.TEST_VIDEO === 'true' ) {
		const dateTime = new Date().toISOString().split( '.' )[0].replace( /:/g, '-' );
		const fileName = `test-${dateTime}.mp4`;
		file = path.resolve( path.join( './screenshots/videos', fileName ) );
		await createDir( path.dirname( file ) );
		return global.screencast = child_process.spawn(
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

export async function stopVideo( currentTest = null ) {
	if ( process.env.TEST_VIDEO === 'true' ) {
		const ffmpeg = global.screencast;

		// Stop the video if the test is failed
		if ( currentTest && ffmpeg ) {
			const currentTestName = currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
			const dateTime = new Date().toISOString().split( '.' )[0].replace( /:/g, '-' );
			const fileName = `${currentTestName}-${dateTime}.mp4`;
			const newFile = path.resolve( path.join( './screenshots/videos', fileName ) );

			await ffmpeg.kill();

			global.screencast = null;

			return fs.rename( file, newFile, function( err ) {
				if ( err ) {
					console.log( 'Screencast Video:' + file );
					throw err;
				}
				console.log( 'Screencast Video:' + newFile );
			} );
		} else if ( ffmpeg ) {
			await ffmpeg.kill();

			return fs.unlink( file, function() {
				global.screencast = null;
			} );
		}
	}
}
