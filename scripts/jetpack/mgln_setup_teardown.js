const Q = require( 'q' );
const exec = require( 'child_process' ).exec;
const shell = require( 'shelljs' );


const SetupTeardown = function() {};

SetupTeardown.prototype = {

	consoleExecutor: function( shellCommand, callbackFunction ) {
		return exec( shellCommand, ( error, stdout, stderr ) => {
			if ( error ) {
				console.error( `exec error: ${error}` );
				console.error( `${error.code}` );
				return 1;
			};
			console.log( `stdout: ${stdout}` );
			if ( stderr ) {
				console.log( `stderr: ${stderr}` );
			};

			if ( callbackFunction ) {
				return callbackFunction( stdout, stderr );
			}
		} );
	},

	initialize: function() {
		var deferred = Q.defer();
		// this.consoleExecutor(
		// 	'source $HOME/.nvm/nvm.sh',
		// 	() => this.consoleExecutor(
		// 		'./scripts/jetpack/wp-serverpilot-delete.js',
		// 		() => this.consoleExecutor(
		// 		'./scripts/jetpack/wp-serverpilot-init.js',
		// 		() => this.consoleExecutor(
		// 			'scp -o "StrictHostKeyChecking no" scripts/jetpack/git-jetpack.sh serverpilot@wp-e2e-tests.pw:~serverpilot/git-jetpack.sh',
		// 			() => this.consoleExecutor(
		// 			'ssh -o "StrictHostKeyChecking no" serverpilot@wp-e2e-tests.pw ~serverpilot/git-jetpack.sh wordpress-${CIRCLE_SHA1:0:20}',
		// 			() => this.consoleExecutor(
		// 				'xvfb-run ./node_modules/.bin/mocha scripts/jetpack/wp-jetpack-activate.js',
		// 				() => deferred.resolve()
		// ) ) ) ) ) );

		shell.exec( 'source $HOME/.nvm/nvm.sh && ./scripts/jetpack/wp-serverpilot-delete.js' );
		shell.exec( './scripts/jetpack/wp-serverpilot-init.js' );
		shell.exec( 'scp -o "StrictHostKeyChecking no" scripts/jetpack/git-jetpack.sh serverpilot@wp-e2e-tests.pw:~serverpilot/git-jetpack.sh' );
		shell.exec( 'ssh -o "StrictHostKeyChecking no" serverpilot@wp-e2e-tests.pw ~serverpilot/git-jetpack.sh wordpress-${CIRCLE_SHA1:0:20}' );
		shell.exec( 'xvfb-run ./node_modules/.bin/mocha scripts/jetpack/wp-jetpack-activate.js',
			() => deferred.resolve()
		);

		return deferred.promise;
	},

	flush: function() {
		const deferred = Q.defer();
		// name: Run Jetpack deactivation spec
		const jpDeactivate =
			`if [ "$E2E_DEBUG" == "true" ]; then
				echo "Skipping deactivation step for DEBUG purposes"
			else
			source $HOME/.nvm/nvm.sh && xvfb-run ./node_modules/.bin/mocha scripts/jetpack/wp-jetpack-deactivate.js
			fi`;

		// name: Delete site from Digital Ocean via ServerPilot
		const spDelete =
			`if [ "$E2E_DEBUG" == "true" ]; then
				echo "Skipping delete step for DEBUG purposes"
			else
				source $HOME/.nvm/nvm.sh && ./scripts/jetpack/wp-serverpilot-delete.js
			fi`;

		this.consoleExecutor(
			jpDeactivate,
			() => this.consoleExecutor(
				spDelete,
				() => deferred.resolve()
		) )

		return deferred.promise;
	}
};

module.exports = SetupTeardown;
