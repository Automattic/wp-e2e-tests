// WordPress.com REST API oauth flows
// See https://developer.wordpress.com/docs/oauth2/

const expect = require( 'chai' ).expect;
const config = require( 'config' );

function login( wp, account ) {
	var r;
	var options = {};
	options.server = 'https://public-api.wordpress.com';
	options.login = 'https://wordpress.com/wp-login.php';
	options.proxy = null;
	options.clientId = config.restApiApplication.client_id;
	options.redirectUri = config.restApiApplication.redirect_uri;
	options.clientSecret = config.restApiApplication.client_secret;
	options.responseType = 'code';
	options.scope = 'global';
	options.action = 'oauth2-login';
	options.redirectTo = `https://public-api.wordpress.com/oauth2/authorize/?client_id=${options.clientId}&redirect_uri=${options.redirectUri}&response_type=code&scope=global&jetpack-code&jetpack-user-id=0&action=oauth2-login`;
	options.account = account;

	const loginForm = {
		redirect_to: options.redirectTo,
		log: options.account[0],
		pwd: options.account[1]
	};

	// Simulate wp login to get _wpnonce
	r = wp.rawRequest( {
		method: 'POST',
		uri: options.login,
		proxy: options.proxy,
		followRedirect: true,
		followAllRedirects: true,
		form: loginForm,
	} );
	expect( r.data.statusCode ).to.equal( 200 );
	const wpnonce = r.data.body.match( /_wpnonce=([a-zA-Z0-9_]+)/ )[1];

	// Get access code
	const loginQuery = {
		blog_id: 0,
		client_id: options.clientId,
		redirect_uri: options.redirectUri,
		response_type: options.responseType,
		scope: options.scope,
		action: options.action,
		redirect_to: options.redirectTo,
		_wpnonce: wpnonce
	};

	r = wp.rawRequest( {
		method: 'GET',
		uri: options.server + '/oauth2/login/',
		qs: loginQuery,
		proxy: options.proxy,
		followRedirect: false,
	} );
	expect( r.data.statusCode ).to.equal( 302 );
	const accessCode = r.data.headers.location.match( /code=(.+)&state/i )[1];

	// Get access token
	r = wp.rawRequest( {
		method: 'POST',
		uri: options.server + '/oauth2/token',
		proxy: options.proxy,
		form: {
			client_id: options.clientId,
			client_secret: options.clientSecret,
			redirect_uri: options.redirectUri,
			code: accessCode,
			grant_type: 'authorization_code'
		}
	} );
	expect( r.data.statusCode ).to.equal( 200 );
	const accessToken = JSON.parse( r.data.body ).access_token;
	expect( accessToken ).to.be.a( 'String' );

	// Validate access token
	r = wp.oauth2['token-info'].GET( {
		query: {
			client_id: options.clientId,
			token: accessToken
		}
	} );
	expect( r.data.statusCode ).to.equal( 200 );
	expect( r.data.body.scope ).to.equal( options.scope );

	// set access token header for all the coming API calls
	wp.setHeaders( {
		Authorization: 'Bearer ' + accessToken
	} );

	return {
		response: r,
		accessToken: accessToken
	};
};

module.exports.login = login;
