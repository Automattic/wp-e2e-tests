var WP = require( 'wp-cli' );
var localtunnel = require( 'localtunnel' );
var config = require( 'config' );

const ltPrefix = `wpe2etestsjetpack${process.env.TUNNEL_PREFIX}` || new Date().getTime().toString();

// Gets the account configs from the NODE_CONFIG variable
const localConfig = config.get( 'testAccounts' );

const username = localConfig.jetpackUserCI[0];
const password = localConfig.jetpackUserCI[1];

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
	console.log( 't = ' );
	console.log( t );
	t.close();

	t = localtunnel( 80, { subdomain: ltPrefix }, function( err, tunnel ) {
		if ( err ) {
			console.log( 'UH OH! - Failed to establish localtunnel - ' + err );
			return;
		}

		console.log( 'Tunnel: ' + tunnel.url );
	} );

	t.on( 'error', ltErrorHandler );
	t.on( 'close', ltCloseHandler );
};

t.on( 'error', ltErrorHandler );
t.on( 'close', ltCloseHandler );
