import fs from 'fs-extra';
import path from 'path';
import webdriver from 'selenium-webdriver';
import sanitize from 'sanitize-filename';
import config from 'config';

export function createFile( notRandom, uploadDirectoryName = 'image-uploads' ) {
	let d = webdriver.promise.defer();
	let randomImageNumber = Math.floor( Math.random() * 2 );

	// If notRandom is set, always choose image 0 for visual comparison
	if ( notRandom ) {
		randomImageNumber = 0;
	}

	let originalImageName = 'image' + randomImageNumber;
	let originalFileName = `${originalImageName}.jpg`;
	let originalFile = path.resolve( __dirname, `../${uploadDirectoryName}/${originalFileName}` );
	let newImageName = ( '0000' + ( Math.random() * Math.pow( 36, 4 ) << 0 ).toString( 36 ) ).slice( -4 ); // random number
	let newFileName = `${newImageName}.jpg`;
	let newFile = path.resolve( __dirname, `../${uploadDirectoryName}/${newFileName}` );
	fs.copySync( originalFile, newFile );

	d.fulfill( {
		imageName: newImageName,
		fileName: newFileName,
		file: newFile
	} );

	return d.promise;
}

export function getMP3FileWithFilename( filename ) {
	const d = webdriver.promise.defer();
	const originalFileName = 'bees.mp3';
	const originalFile = path.resolve( __dirname, `../image-uploads/${originalFileName}` );
	const newFile = path.resolve( __dirname, '../image-uploads/' + filename );
	fs.copySync( originalFile, newFile );

	d.fulfill( {
		imageName: filename,
		fileName: filename,
		file: newFile
	} );

	return d.promise;
}

export function createFileWithFilename( filename, skipNameCheck ) {
	if ( ! skipNameCheck && sanitize( filename ) !== filename ) {
		throw new Error( `Invalid filename given ${ filename }` );
	}

	const d = webdriver.promise.defer();
	const originalFileName = 'image0.jpg';
	const originalFile = path.resolve( __dirname, `../image-uploads/${originalFileName}` );
	const newFile = path.resolve( __dirname, '../image-uploads/' + filename );
	fs.copySync( originalFile, newFile );

	d.fulfill( {
		imageName: filename,
		fileName: filename,
		file: newFile
	} );

	return d.promise;
}

export function deleteFile( fileDetails ) {
	var d = webdriver.promise.defer();
	fs.deleteSync( fileDetails.file );
	d.fulfill( true );
	return d.promise;
}

export function writeScreenshot( data, prefix, i18nScreenshot ) {
	if ( prefix === undefined ) {
		prefix = '';
	}

	let screenShotBase = __dirname + '/..';
	if ( process.env.TEMP_ASSET_PATH ) {
		screenShotBase = process.env.TEMP_ASSET_PATH;
	}

	let directoryName = 'screenshots';
	if ( process.env.SCREENSHOTDIR ) {
		directoryName = process.env.SCREENSHOTDIR;
	}
	let screenShotDir = path.resolve( screenShotBase, directoryName );
	if ( ! fs.existsSync( screenShotDir ) ) {
		fs.mkdirSync( screenShotDir );
	}
	let dateString = new Date().getTime().toString();
	let fileName = `${dateString}-${prefix}.png`;
	if ( i18nScreenshot === true ) {
		let suitePrefix = prefix[0];
		let testPrefix = prefix[1];
		fileName = `${suitePrefix}-${dateString}-${testPrefix}.png`;
	}
	let screenshotPath = `${screenShotDir}/${fileName}`;
	fs.writeFileSync( screenshotPath, data, 'base64' );

	return screenshotPath;
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
	let fileName = `${dateString}-${prefix}-log.txt`;
	let logPath = `${logDir}/${fileName}`;
	fs.writeFileSync( logPath, textContent );

	return logPath;
}
