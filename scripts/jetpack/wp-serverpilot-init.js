#!/usr/bin/env node
const config = require( 'config' );
const fs = require( 'fs-extra' );
const ServerPilot = require( 'serverpilot' );

const spConfig = config.get( 'spConfig' );

const sp = new ServerPilot( {
	clientId: spConfig.clientId,
	apiKey: spConfig.apiKey
} );

const userConfig = config.get( 'testAccounts' );
const username = userConfig.jetpackUserCI[0];
const password = userConfig.jetpackUserCI[1];

const serverPrefix = process.env.CIRCLE_SHA1.substr( 0, 20 );

const serverOptions = {
	name: `wordpress-${serverPrefix}`,
	sysuserid: spConfig.sysuserid,
	runtime: 'php7.0',
	domains: [ `${serverPrefix}.wp-e2e-tests.pw` ],
	wordpress: {
		site_title: 'Jetpack e2e Testing',
		admin_user: username,
		admin_password: password,
		admin_email: 'example@example.com'
	}
};
sp.createApp( serverOptions, function( err, data ) {
	if ( err !== null ) {
		console.log( err );
		throw err;
	}

	console.log( `Site created - http://${serverPrefix}.wp-e2e-tests.pw - ID ${data.data.id}` );

	// Write the app ID to the BASH_ENV file to be used by later steps in CircleCI
	if ( process.env.CIRCLECI === 'true' ) {
		fs.appendFileSync( process.env.BASH_ENV, `export SP_APP_ID=${data.data.id}` );
	}
} );
