var WP = require( 'wp-cli' );
var localtunnel = require( 'localtunnel' );

var ltPrefix = '';

var t = localtunnel( 80, function( err, tunnel ) {
	if ( err ) {
		console.log( 'UH OH! - Failed to establish localtunnel - ' + err );
		return;
	}

	console.log( 'Tunnel Established: ' + tunnel.url );
	ltPrefix = tunnel.url.replace( /https:\/\//, '' ).split( '.' )[0];

	WP.discover( { path: '/var/www/html' }, function( wp ) {
		wp.core.install( {
			url: tunnel.url,
			title: 'e2e-Jetpack',
			admin_user: 'wordpress',
			admin_password: 'password', // TODO - Make this better
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
