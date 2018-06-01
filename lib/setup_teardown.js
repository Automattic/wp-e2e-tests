/** @format */

var Q = require( 'q' );

// const Xvfb = require( 'xvfb' );
const screenRecorder = require( './screen-recorder' );

let recorder;
// let xvfb;

var SetupTeardown = function() {};

SetupTeardown.prototype = {
	initialize: function() {
		var deferred = Q.defer();

		// xvfb = new Xvfb();
		recorder = screenRecorder( 'testname' );
		// xvfb.startSync();
		// console.log( '==============' );
		// console.log( xvfb.display() );
		// console.log( '==============' );

		recorder.start( deferred.resolve );
		return deferred.promise;
	},

	flush: function() {
		var deferred = Q.defer();

		// xvfb.stopSync();
		recorder.stop( deferred.resolve );

		return deferred.promise;
	},
};

module.exports = SetupTeardown;
