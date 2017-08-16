#!/usr/bin/env node
const config = require( 'config' );
const ServerPilot = require( 'serverpilot' );

const spConfig = config.get( 'spConfig' );

const sp = new ServerPilot( {
	clientId: spConfig.clientId,
	apiKey: spConfig.apiKey
} );

sp.deleteApp( process.env.SP_APP_ID, function( err ) {
	if ( err !== null ) {
		console.log( err );
		throw err;
	}
} );
