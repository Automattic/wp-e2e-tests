/** @format */
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';

let file;
let xvfb;
let ffmpeg;

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
	let i = 99 + Math.round( Math.random() * 100 );
	while ( fs.existsSync( `/tmp/.X${ i }-lock` ) ) {
		i++;
	}
	global.displayNum = i;
}

export function startDisplay() {
	if ( process.env.TEST_VIDEO !== 'true' ) {
		return;
	}
	getFreeDisplay();
	xvfb = child_process.spawn( 'Xvfb', [
		'-ac',
		':' + global.displayNum,
		'-screen',
		'0',
		'1600x1200x24',
		'+extension',
		'RANDR',
	] );
}

export function stopDisplay() {
	if ( process.env.TEST_VIDEO === 'true' && xvfb ) {
		xvfb.kill();
	}
}

export function startVideo() {
	if ( process.env.TEST_VIDEO !== 'true' ) {
		return;
	}
	const dateTime = new Date()
		.toISOString()
		.split( '.' )[ 0 ]
		.replace( /:/g, '-' );
	const fileName = `${ global.displayNum }-${ dateTime }.mpg`;
	file = path.resolve( path.join( './screenshots/videos', fileName ) );
	createDir( path.dirname( file ) );
	ffmpeg = child_process.spawn( 'ffmpeg', [
		'-f',
		'x11grab',
		'-video_size',
		'1440x1000',
		'-r',
		30,
		'-i',
		':' + global.displayNum,
		'-pix_fmt',
		'yuv420p',
		'-loglevel',
		'error',
		file,
	] );
}

export function stopVideo( currentTest = null ) {
	if ( process.env.TEST_VIDEO !== 'true' ) {
		return;
	}
	if ( currentTest && ffmpeg ) {
		const currentTestName = currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
		const dateTime = new Date()
			.toISOString()
			.split( '.' )[ 0 ]
			.replace( /:/g, '-' );
		const fileName = `${ currentTestName }-${ dateTime }.mpg`;
		const newFile = path.resolve( path.join( './screenshots/videos', fileName ) );
		ffmpeg.kill();

		fs.rename( file, newFile, function( err ) {
			if ( err ) {
				console.log( 'Screencast Video:' + file );
			}
			console.log( 'Screencast Video:' + newFile );
		} );
	} else if ( ffmpeg && ! ffmpeg.killed ) {
		ffmpeg.kill();
		fs.unlink( file, function( err ) {
			if ( err ) {
				console.log( 'Deleting of file for passed test failed.' );
			}
		} );
	}
}
