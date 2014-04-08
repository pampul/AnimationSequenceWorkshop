'use strict'
module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    cssmin: {
      combine: {
        files: {
          'public/css/combine.css': [
            'bower_components/bootstrap/dist/css/bootstrap.css',
            'bower_components/font-awesome/css/font-awesome.min.css',
            'public/css/animate-shake.css',
            'public/css/style.css'
          ]
        }
      },
      minify: {
        expand: true,
        cwd: 'public/css/',
        src: ['combine.css'],
        dest: 'public/css/',
        ext: '.min.css'
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'bower_components/jquery/dist/jquery.js',
          'bower_components/jquery-migrate/jquery-migrate.js',
          'bower_components/jquery-ui/ui/jquery-ui.js',
          'bower_components/jquery-ui-touch-punch/jquery.ui.touch-punch.js',
          'bower_components/jquery-mousewheel/jquery.mousewheel.js',
          'public/js-lib/jquery-drag-scroll.js',
          'bower_components/bootstrap/dist/js/bootstrap.js',
          'bower_components/modernizr/modernizr.js',
          'config/app.js',
          'app/*.js'
        ],
        dest: 'public/js/combine.js'
      }
    },
    stylus: {
      compile: {
        files: {
          'public/css/style.css': 'public/css/style.styl' // 1:1 compile
        }
      }
    },
    uglify: {
      my_target: {
        files: {
          'public/js/combine.min.js': ['public/js/combine.js']
        }
      }
    },
    imagemin: {
      dynamic: {
        options: { // Target options
          optimizationLevel: 7
        },
        files: [
          {
            expand: true, // Enable dynamic expansion
            cwd: 'public/video/', // Src matches are relative to this path
            src: ['**/**/*.{png,jpg,gif}'], // Actual patterns to match
            dest: 'public/video/' // Destination path prefix
          }
        ]
      }
    },
    htmlmin: { // Task
      dist: { // Target
        options: { // Target options
          removeComments: true,
          collapseWhitespace: true
        },
        files: { // Dictionary of files
          'index.html': 'public/views/index.html'
        }
      }
    },
    jshint: {
      all: ['app/AnimationSequence.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    jsbeautifier: {
      modify: {
        src: ['app/AnimationSequence.js'],
        options: {
          config: '.jsbeautifyrc'
        }
      },
      verify: {
        src: ['app/AnimationSequence.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    watch: {
      minifyall: {
        files: ['public/css/style.styl', 'config/*.js', 'app/**/*.js', 'bower_components/jquery-mousewheel/*.js', 'bower_components/jquery-drag-scroll/jquery-drag-scroll.js'],
        tasks: ['stylus', 'cssmin', 'concat'],
        options: {
          spawn: false
        }
      }
    }
  });

  // Load the plugin that provides the "cssmin" task
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  // Load concat
  grunt.loadNpmTasks('grunt-contrib-concat');
  // Load concat
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Load image min
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  // Load stylus compiler
  grunt.loadNpmTasks('grunt-contrib-stylus');
  // Load jshint
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Load jsbeautifier
  grunt.loadNpmTasks('grunt-jsbeautifier');
  // Load a watcher
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['cssmin', 'concat', 'uglify', 'stylus', 'imagemin']);

  // Dev task(s).
  grunt.registerTask('dev', ['cssmin', 'concat', 'uglify', 'stylus', 'watch']);

  grunt.registerTask('clean', [
    'jsbeautifier:modify',
    'jshint'
  ]);

  grunt.registerTask('verify', [
    'jsbeautifier:verify',
    'jshint'
  ]);

};
