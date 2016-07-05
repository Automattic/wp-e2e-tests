'use strict';

module.exports = function (grunt) {
    // configure tasks
    grunt.initConfig({
      shell: {
        runTests: {
            command: function(browserSize, sauceConfig) {
              return './run.sh -R -l ' + sauceConfig + ' -s ' + browserSize
            }
        }
      },

      parallel: {
        assets: {
            options: {
                grunt: true
            },
            tasks: [ 'run_mobile_OSX_Chrome', 'run_desktop_OSX_Chrome', 'run_tablet_OSX_Chrome' ]
        }
      }
    });

    // load tasks
    grunt.loadNpmTasks('grunt-parallel');
    grunt.loadNpmTasks('grunt-shell');

    // register tasks
    grunt.registerTask('default', ['parallel']);

    grunt.registerTask('run_mobile_OSX_Chrome', ['shell:runTests:mobile:osx-chrome']);
    grunt.registerTask('run_desktop_OSX_Chrome', ['shell:runTests:desktop:osx-chrome']);
    grunt.registerTask('run_tablet_OSX_Chrome', ['shell:runTests:tablet:osx-chrome']);
};
