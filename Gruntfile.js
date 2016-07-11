'use strict';

module.exports = function (grunt) {
	// configure tasks
	grunt.initConfig({
		shell: {
			runTests: {
				command: function(browserSize, sauceConfig) {
					return './run.sh -R -c -l ' + sauceConfig + ' -s ' + browserSize
				}
			}
		},

		concurrent: {
			target: {
				tasks: [ 'run_mobile_osx-chrome', 'run_desktop_osx-chrome', 'run_tablet_osx-chrome' ],
//					'run_mobile_win-firefox', 'run_desktop_win-firefox', 'run_tablet_win-firefox',
//					'run_mobile_osx-safari', 'run_desktop_osx-safari', 'run_tablet_osx-safari',
//					'run_mobile_win-ie11', 'run_desktop_win-ie11', 'run_tablet_win-ie11' ],
				options: {
					limit: 5
				}
			}
		}
	});

	// load tasks
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-shell');

	// register tasks
	grunt.registerTask('default', ['concurrent:target']);

	grunt.registerTask('run_mobile_osx-chrome', ['shell:runTests:mobile:osx-chrome']);
	grunt.registerTask('run_desktop_osx-chrome', ['shell:runTests:desktop:osx-chrome']);
	grunt.registerTask('run_tablet_osx-chrome', ['shell:runTests:tablet:osx-chrome']);
	grunt.registerTask('run_mobile_win-firefox', ['shell:runTests:mobile:win-firefox']);
	grunt.registerTask('run_desktop_win-firefox', ['shell:runTests:desktop:win-firefox']);
	grunt.registerTask('run_tablet_win-firefox', ['shell:runTests:tablet:win-firefox']);
	grunt.registerTask('run_mobile_osx-safari', ['shell:runTests:mobile:osx-safari']);
	grunt.registerTask('run_desktop_osx-safari', ['shell:runTests:desktop:osx-safari']);
	grunt.registerTask('run_tablet_osx-safari', ['shell:runTests:tablet:osx-safari']);
	grunt.registerTask('run_mobile_win-ie11', ['shell:runTests:mobile:win-ie11']);
	grunt.registerTask('run_desktop_win-ie11', ['shell:runTests:desktop:win-ie11']);
	grunt.registerTask('run_tablet_win-ie11', ['shell:runTests:tablet:win-ie11']);
};
