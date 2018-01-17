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

	const currentApps = data.data.filter( ( app ) => {
		return app.name.match( /^wordpress-/ );
	} );

	for ( let i = 0; i < currentApps.length; i++ ) {
		sp.deleteApp( currentApps[i].id, function( delErr ) {
			if ( delErr !== null ) {
				console.log( delErr );
				throw delErr;
			} else {
				console.log( `App ${currentApps[i].id} successfully deleted` );
			}
		} );
	}
} );
