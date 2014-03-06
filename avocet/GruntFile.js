module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        'watch': {
            'less': {
                'files': ['app/less/**/*.less'],
                'tasks': ['less:dev']
            }
        },
        'less': {
            'dev': {
                'files': {
                    'app/css/avocet.css': 'app/less/avocet.less'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
