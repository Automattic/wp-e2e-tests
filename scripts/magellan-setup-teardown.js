var Q = require( 'q' );

var SetupTeardown = function() {
};

SetupTeardown.prototype = {
	initialize: function() {
		var deferred = Q.defer();

		let message = '[INFO] Magellan run just started';
		if ( process.env.LIVEBRANCH ) {
			message += `\n[INFO] Using live branch: ${process.env.LIVEBRANCH}`;
		}

		Promise.resolve( message ).then( value => {
			console.log( value );
			return deferred.resolve();
		} );

		return deferred.promise;
	},

	flush: function() {
		var deferred = Q.defer();

		let message = 'Magellan run stopped working';

		Promise.resolve( message ).then( value => {
			console.log( value );
			return deferred.resolve();
		} );

		return deferred.promise;
	}
};

module.exports = SetupTeardown;
