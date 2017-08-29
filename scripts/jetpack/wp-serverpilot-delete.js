#!/usr/bin/env node
const config = require( 'config' );
const ServerPilot = require( 'serverpilot' );

const spConfig = config.get( 'spConfig' );

const sp = new ServerPilot( {
	clientId: spConfig.clientId,
	apiKey: spConfig.apiKey
} );

sp.getApps( ( getErr, data ) => {
	if ( getErr !== null ) {
		console.log( getErr );
		throw getErr;
	}

	const currentApp = data.data.filter( ( app ) => {
		return app.name === `wordpress-${process.env.CIRCLE_SHA1.substr( 0, 20 )}`;
	} )[0];

	sp.deleteApp( currentApp.id, function( delErr ) {
		if ( delErr !== null ) {
			console.log( delErr );
			throw delErr;
		} else {
			console.log( `App ${currentApp.id} successfully deleted` );
		}
	} );
} );
