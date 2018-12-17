/** @format */

import { forEach } from 'lodash';
import fs from 'fs';
import path from 'path';
import * as slackNotifier from './slack-notifier';

export async function saveLogin( driver, username ) {
	const dir = `./temp-cookies/${username}`;
	createDir( dir );
	await driver.get( 'https://public-api.wordpress.com/wp-admin/' );
	const cookies = await driver.manage().getCookies();
	await fs.writeFileSync( `${dir}/cookies.json`, JSON.stringify( cookies ), 'utf-8' );
	await driver.navigate().back();
}

export async function loadLoginCookies( driver, filePath ) {
	const rawData = await fs.readFileSync( filePath );
	const cookies = await JSON.parse( rawData );
	await driver.manage().deleteAllCookies();
	for ( const cookie of cookies ) {
		await driver.manage().addCookie( cookie );
	}
}

export async function useLoginCookies( driver, username ) {
	const dir = `./temp-cookies/${username}`;
	const cookieDir = `${dir}/cookies.json`;
	let usedCookie = false;
	if ( fs.existsSync( cookieDir ) ) {
		const stats = fs.statSync( dir );
		const today = new Date();
		//if ( today.getDate() - stats.mtime > 7 ) {
		console.log( today.getDate() - stats.mtime );
		await loadLoginCookies( driver, cookieDir );
		usedCookie = true;
		//}
	}

	return usedCookie;
}

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

