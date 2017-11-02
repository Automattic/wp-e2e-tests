const Q = require( 'q' );
const exec = require( 'child_process' ).exec;

const SetupTeardown = function() {};

SetupTeardown.prototype = {

	consoleExecutor: function( shellCommand, callbackFunction ) {
		return exec( shellCommand, ( error, stdout, stderr ) => {
			if ( error ) {
				console.error( `exec error: ${error}` );
				return;
			};
			console.log( `stdout: ${stdout}` );
			console.log( `stderr: ${stderr}` );

			if ( callbackFunction ) {
				return callbackFunction( stdout, stderr );
			}
		} );
	},

	initialize: function() {
		var deferred = Q.defer();

		// do asynchronous setup stuff here. Resolve (or reject) promise when ready.
		// doAsyncStuff( function() {
		// 	deferred.resolve();
		// } );

		console.log('====================================');
		this.consoleExecutor( 'pwd', () => deferred.resolve() );
		console.log('====================================');

		return deferred.promise;
	},

	flush: function() {
		var deferred = Q.defer();

		// do asynchronous teardown stuff here. Resolve (or reject) promise when ready.

		this.consoleExecutor(
			// 'source $HOME/.nvm/nvm.sh && xvfb-run ./node_modules/.bin/mocha scripts/jetpack/wp-jetpack-deactivate.js',
			'./node_modules/.bin/mocha scripts/jetpack/wp-jetpack-deactivate.js',
			() => this.consoleExecutor(
				// 'source $HOME/.nvm/nvm.sh && ./scripts/jetpack/wp-serverpilot-delete.js',
				'./scripts/jetpack/wp-serverpilot-delete.js',
				() => deferred.resolve()
		) )

		// command: source $HOME/.nvm/nvm.sh && xvfb-run ./node_modules/.bin/mocha scripts/jetpack/wp-jetpack-deactivate.js
		// command: source $HOME/.nvm/nvm.sh && ./scripts/jetpack/wp-serverpilot-delete.js

		return deferred.promise;
	}
};

module.exports = SetupTeardown;
