module.exports = function( grunt ) {
	// configure tasks
	grunt.initConfig( {
		shell: {
			runTests: {
				command: function( browserSize, sauceConfig ) {
					return './run.sh -R -c -f -l ' + sauceConfig + ' -s ' + browserSize
				}
			}
		},

		concurrent: {
			target: {
				tasks: [ 'run_mobile_osx-chrome', 'run_desktop_osx-chrome', 'run_tablet_osx-chrome',
					'run_mobile_osx-firefox', 'run_desktop_osx-firefox', 'run_tablet_osx-firefox',
					'run_mobile_osx-safari', 'run_desktop_osx-safari', 'run_tablet_osx-safari',
					'run_desktop_win-ie11' ],
				options: {
					limit: 3,
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

	grunt.registerTask( 'run_mobile_osx-chrome', ['shell:runTests:mobile:osx-chrome'] );
	grunt.registerTask( 'run_desktop_osx-chrome', ['shell:runTests:desktop-small:osx-chrome'] );
	grunt.registerTask( 'run_tablet_osx-chrome', ['shell:runTests:tablet:osx-chrome'] );
	grunt.registerTask( 'run_mobile_osx-firefox', ['shell:runTests:mobile:osx-firefox'] );
	grunt.registerTask( 'run_desktop_osx-firefox', ['shell:runTests:desktop-small:osx-firefox'] );
	grunt.registerTask( 'run_tablet_osx-firefox', ['shell:runTests:tablet:osx-firefox'] );
	grunt.registerTask( 'run_mobile_osx-safari', ['shell:runTests:mobile:osx-safari'] );
	grunt.registerTask( 'run_desktop_osx-safari', ['shell:runTests:desktop-small:osx-safari'] );
	grunt.registerTask( 'run_tablet_osx-safari', ['shell:runTests:tablet:osx-safari'] );
	grunt.registerTask( 'run_desktop_win-ie11', ['shell:runTests:desktop-small:win-ie11'] );
};
