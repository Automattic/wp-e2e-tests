var WP = require( 'wp-cli' );
var localtunnel = require( 'localtunnel' );
var config = require( 'config' );

var ltPrefix = process.env.TUNNEL_PREFIX || new Date().getTime().toString();

// Gets the account configs from the NODE_CONFIG variable (code copied from login-flow.js for use inside Docker)
let localConfig = config.get( 'testAccounts' );

const username = localConfig[ 'jetpackUserMULTI' ][0];
const password = localConfig[ 'jetpackUserMULTI' ][1];

var t = localtunnel( 80, { subdomain: ltPrefix }, function( err, tunnel ) {
	if ( err ) {
		console.log( 'UH OH! - Failed to establish localtunnel - ' + err );
		return;
	}

	console.log( 'Tunnel Established: ' + tunnel.url );

	WP.discover( { path: '/var/www/html' }, function( wp ) {
		wp.core.install( {
			url: tunnel.url,
			title: 'e2e-Jetpack',
			admin_user: username,
			admin_password: password,
			admin_email: 'user@example.com'
		}, function( wperr, info ) {
			console.log( 'Install complete! - ' + info );
		} );
	} );
} );

var ltCloseHandler = function() {
	console.log( 'LocalTunnel CLOSED' );
};

var ltErrorHandler = function( receivedError ) {
	console.log( `LocalTunnel ERROR, attempting reconnect - ${receivedError}` );
	t.close();

	t = localtunnel( 80, { subdomain: ltPrefix }, function( err, tunnel ) {
		if ( err ) {
			console.log( 'UH OH! - Failed to establish localtunnel - ' + err );
			return;
		}

		console.log( 'Tunnel: ' + tunnel.url );
		ltPrefix = tunnel.url.replace( /https:\/\//, '' ).split( '.' )[0];
	} );

	t.on( 'error', ltErrorHandler );
	t.on( 'close', ltCloseHandler );
};

t.on( 'error', ltErrorHandler );
t.on( 'close', ltCloseHandler );
