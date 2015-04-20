'use strict';

<<<<<<< HEAD
module.exports = function(grunt) {
=======
module.exports = function (grunt) {
>>>>>>> 4b602f40c10625f82156688e51d0da1a63b4c0f1

    grunt.loadNpmTasks('grunt-mocha-test');
    //grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    //grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-env');
<<<<<<< HEAD
    //grunt.loadNpmTasks('grunt-node-inspector');
    grunt.loadNpmTasks('grunt-jshint');
    //grunt.loadNpmTasks('grunt-csslint');
    //grunt.loadNpmTasks('grunt-ng-annotate');
    //grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    //grunt.loadNpmTasks('grunt-karma');

    // Unified Watch Object
    var watchFiles = {
        serverJS: ['Gruntfile.js', 'server.js', 'lib/**/*.js'],
        clientViews: ['client/app/views/**/*.html', 'client/app/index.html'],
        clientJS: ['client/app/scripts/**/*.js'],
        clientCSS: ['client/app/styles/*.css'],
        mochaTests: ['test/unit/*.js', 'test/e2e/**/*.js', 'test/e2e/*.js']
    };

=======
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    
    grunt.registerTask('timestamp', function () {
        grunt.log.subhead(Date());
    });

    // Unified Watch Object
    var watchFiles = {
        serverJS: ['Gruntfile.js', 'server.js', 'lib/**/*.js'],
        clientViews: ['client/app/views/**/*.html', 'client/app/index.html'],
        clientJS: ['client/app/scripts/**/*.js'],
        clientCSS: ['client/app/styles/*.css'],
        mochaTests: ['test/unit/*.js', 'test/e2e/**/*.js', 'test/e2e/*.js']
    };

>>>>>>> 4b602f40c10625f82156688e51d0da1a63b4c0f1
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            serverJS: {
                files: watchFiles.serverJS,
                tasks: ['jshint', 'jsbeautifier'],
                options: {
                    livereload: true
                }
            },
            clientViews: {
                files: watchFiles.clientViews,
                options: {
                    livereload: true,
                }
            },
            clientJS: {
                files: watchFiles.clientJS,
<<<<<<< HEAD
                tasks: ['jshint','jsbeautifier'],
=======
                tasks: ['jshint', 'jsbeautifier'],
>>>>>>> 4b602f40c10625f82156688e51d0da1a63b4c0f1
                options: {
                    livereload: true
                }
            },
            clientCSS: {
                files: watchFiles.clientCSS,
                //tasks: ['csslint'],
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
            files: ['./test/unit/*.js'], //['gruntFile.js', 'package.json', '*.js', './lib/*.js','./lib/**/*.js','./test/*.js', './test/**/*.js'],
            options: {
                browser: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: false,
                boss: true,
                eqnull: true,
                node: true,
                expr: true,
                globals: {
                    'xit': true,
                    'xdescribe': true,
                    'it': true,
                    'describe': true,
                    'before': true,
                    'after': true,
                    'done': true
                }
            }
        },
        jsbeautifier: {
            beautify: {
                src: ['Gruntfile.js', 'lib/*.js', 'lib/**/*.js', 'test/**/*.js', '*.js', 'test/xmlmods/*.json', 'client/app/scripts/**/*.js', 'client/app/scripts/*.js', 'client/app/views/*.html', 'client/app/views/**/*.html', 'client/app/*.html'],
                options: {
                    config: '.jsbeautifyrc'
                }
            },
            check: {
                src: ['Gruntfile.js', 'lib/*.js', 'lib/**/*.js', 'test/**/*.js', '*.js', 'test/xmlmods/*.json', 'client/app/scripts/**/*.js', 'client/app/scripts/*.js', 'client/app/views/*.html', 'client/app/views/**/*.html', 'client/app/*.html'],
                options: {
                    mode: 'VERIFY_ONLY',
                    config: '.jsbeautifyrc'
                }
            }
        },
<<<<<<< HEAD
/*                csslint: {
                    options: {
                        csslintrc: '.csslintrc',
                    },
                    all: {
                        src: watchFiles.clientCSS
                    }
                }, */
=======
        /*                csslint: {
                            options: {
                                csslintrc: '.csslintrc',
                            },
                            all: {
                                src: watchFiles.clientCSS
                            }
                        }, */
>>>>>>> 4b602f40c10625f82156688e51d0da1a63b4c0f1
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    //nodeArgs: ['--debug'],
                    ext: 'js,html',
                    watch: watchFiles.serverJS
                }
            }
        },
        /*        'node-inspector': {
                    custom: {
                        options: {
                            'web-port': 3000,
                            'web-host': 'localhost',
                            'debug-port': 5858,
                            'save-live-edit': true,
                            'no-preload': true,
                            'stack-trace-limit': 50,
                            'hidden': []
                        }
                    }
                }, */
        concurrent: {
            default: ['nodemon', 'watch'],
            //test: ['nodemon', 'watch', 'node-inspector', 'mochaTest'], //'karma:unit'
<<<<<<< HEAD
            test: ['env:test', 'nodemon', 'watch', 'mochaTest'], //'karma:unit'
=======
            //test: ['nodemon', 'mochaTest'], //'karma:unit'
>>>>>>> 4b602f40c10625f82156688e51d0da1a63b4c0f1
            options: {
                logConcurrentOutput: true,
                limit: 10
            }
        },
        env: {
            options: {
                //Shared Options Hash 
            },
            all: {
                src: ["env/*"],
                options: {
                    envdir: true
                }
            },
            test: {
<<<<<<< HEAD
                DBname: 'test'
=======
                DBname: 'devtests'
>>>>>>> 4b602f40c10625f82156688e51d0da1a63b4c0f1
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    timeout: '10000'
                },
                src: watchFiles.mochaTests
<<<<<<< HEAD
            }
        },
=======
            }
        },
        express: {
            dev: {
                options: {
                    script: './server.js'
                }
            }
        }
>>>>>>> 4b602f40c10625f82156688e51d0da1a63b4c0f1
        /*        karma: {
                    unit: {
                        configFile: 'karma.conf.js'
                    }
                } */
    });

    // Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    // Default task(s).
<<<<<<< HEAD
    grunt.registerTask('default', ['concurrent:default']);

    // Test task.
    //grunt.registerTask('test', ['env:test', 'jshint', 'lint', 'concurrent:test']);
    grunt.registerTask('test', ['concurrent:test']);
=======
    grunt.registerTask('default', ['env:test', 'express:dev', 'mochaTest']);

    // Test task.
    //grunt.registerTask('test', ['env:test', 'jshint', 'lint', 'concurrent:test']);
    grunt.registerTask('live', ['concurrent:default']);
>>>>>>> 4b602f40c10625f82156688e51d0da1a63b4c0f1

    // Lint task(s).
    //grunt.registerTask('lint', ['jshint', 'csslint']);
};
