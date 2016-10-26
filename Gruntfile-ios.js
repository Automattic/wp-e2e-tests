module.exports = function( grunt ) {
	// configure tasks
	grunt.initConfig( {
		shell: {
			runTests: {
				command: function( orientationFlag, device ) {
					return 'echo ./run-mobile.sh -R -s -c -d ' + device + ' ' + orientationFlag
				}
			}
		},

		concurrent: {
			target: {
				tasks: [ 'run_portrait_ios92-iPhone6', 'run_landscape_ios92-iPhone6',
					 'run_portrait_ios92-iPadAir', 'run_landscape_ios92-iPadAir' ],
				options: {
					limit: 4,
					logConcurrentOutput: true
				}
			}
		}
	} );

	// load tasks
	grunt.loadNpmTasks( 'grunt-concurrent' );
	grunt.loadNpmTasks( 'grunt-shell' );

	// register tasks
	grunt.registerTask( 'default', ['concurrent:target'] );

	grunt.registerTask( 'run_portrait_ios92-iPhone6', ['shell:runTests:-p:ios92_iPhone6'] );
	grunt.registerTask( 'run_landscape_ios92-iPhone6', ['shell:runTests:-l:ios92_iPhone6'] );
	grunt.registerTask( 'run_portrait_ios92-iPadAir', ['shell:runTests:-p:ios92_iPadAir'] );
	grunt.registerTask( 'run_landscape_ios92-iPadAir', ['shell:runTests:-l:ios92_iPadAir'] );
};
