/** @format */

import fs from 'fs-extra';
import path from 'path';
import webdriver from 'selenium-webdriver';
import sanitize from 'sanitize-filename';
import pngitxt from 'png-itxt';
import { PassThrough } from 'stream';

export function createFile( notRandom, uploadDirectoryName = 'image-uploads' ) {
	let d = webdriver.promise.defer();
	let randomImageNumber = Math.floor( Math.random() * 2 );

	// If notRandom is set, always choose image 0 for visual comparison
	if ( notRandom ) {
		randomImageNumber = 0;
	}

	let originalImageName = 'image' + randomImageNumber;
	let originalFileName = `${ originalImageName }.jpg`;
	let originalFile = path.resolve( __dirname, `../${ uploadDirectoryName }/${ originalFileName }` );
	let newImageName = (
		'0000' + ( ( Math.random() * Math.pow( 36, 4 ) ) << 0 ).toString( 36 )
	).slice( -4 ); // random number
	let newFileName = `${ newImageName }.jpg`;
	let newFile = path.resolve( __dirname, `../${ uploadDirectoryName }/${ newFileName }` );
	fs.copySync( originalFile, newFile );

	d.fulfill( {
		imageName: newImageName,
		fileName: newFileName,
		file: newFile,
	} );

	return d.promise;
}

export function getMP3FileWithFilename( filename ) {
	const d = webdriver.promise.defer();
	const originalFileName = 'bees.mp3';
	const originalFile = path.resolve( __dirname, `../image-uploads/${ originalFileName }` );
	const newFile = path.resolve( __dirname, '../image-uploads/' + filename );
	fs.copySync( originalFile, newFile );

	d.fulfill( {
		imageName: filename,
		fileName: filename,
		file: newFile,
	} );

	return d.promise;
}

export function createFileWithFilename( filename, skipNameCheck ) {
	if ( ! skipNameCheck && sanitize( filename ) !== filename ) {
		throw new Error( `Invalid filename given ${ filename }` );
	}

	const d = webdriver.promise.defer();
	const originalFileName = 'image0.jpg';
	const originalFile = path.resolve( __dirname, `../image-uploads/${ originalFileName }` );
	const newFile = path.resolve( __dirname, '../image-uploads/' + filename );
	fs.copySync( originalFile, newFile );

	d.fulfill( {
		imageName: filename,
		fileName: filename,
		file: newFile,
	} );

	return d.promise;
}

export function deleteFile( fileDetails ) {
	var d = webdriver.promise.defer();
	fs.deleteSync( fileDetails.file );
	d.fulfill( true );
	return d.promise;
}

export function writeScreenshot( data, filenameCallback, metadata ) {
	const d = webdriver.promise.defer();
	const buffer = Buffer.from( data, 'base64' );
	let filename;
	let pt = new PassThrough();

	let screenShotBase = __dirname + '/..';
	if ( process.env.TEMP_ASSET_PATH ) {
		screenShotBase = process.env.TEMP_ASSET_PATH;
	}

	let directoryName = 'screenshots';
	if ( process.env.SCREENSHOTDIR ) {
		directoryName = process.env.SCREENSHOTDIR;
	}

	const screenShotDir = path.resolve( screenShotBase, directoryName );
	if ( ! fs.existsSync( screenShotDir ) ) {
		fs.mkdirSync( screenShotDir );
	}

	if ( typeof filenameCallback === 'function' ) {
		filename = filenameCallback();
	} else {
		filename = new Date().getTime().toString();
	}
	const screenshotPath = `${ screenShotDir }/${ filename }.png`;
	if ( typeof metadata === 'object' ) {
		for ( let i in metadata ) {
			pt = pt.pipe( pngitxt.set( i, metadata[ i ] ) );
		}
	}
	pt.pipe( fs.createWriteStream( screenshotPath ) );
	pt.end( buffer, 'buffer', () => d.fulfill() );

	return d.promise;
}

export function writeTextLogFile( textContent, prefix, pathOverride ) {
	if ( prefix === undefined ) {
		prefix = '';
	}
	let directoryName = pathOverride || '../logs';
	let logDir = path.resolve( __dirname, directoryName );
	if ( ! fs.existsSync( logDir ) ) {
		fs.mkdirSync( logDir );
	}
	let dateString = new Date().getTime().toString();
	let fileName = `${ dateString }-${ prefix }-log.txt`;
	let logPath = `${ logDir }/${ fileName }`;
	fs.writeFileSync( logPath, textContent );

	return logPath;
}
