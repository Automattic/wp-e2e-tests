var WP = require( 'wp-cli' );
var localtunnel = require( 'localtunnel' );

localtunnel( 80, function( err, tunnel ) {
	if ( err ) {
		console.log( 'UH OH! - Failed to establish localtunnel - ' + err );
	}

	console.log( 'Tunnel: ' + tunnel.url );

	WP.discover( { path: '/var/www/html' }, function( wp ) {
		wp.core.install( {
			url: tunnel.url,
			title: 'Docker FTW',
			admin_user: 'wordpress',
			admin_password: 'Abcde123',
			admin_email: 'user@example.com'
		}, function( wperr, info ) {
			console.log( 'Install complete! - ' + info );
		} );
	} );
} );

