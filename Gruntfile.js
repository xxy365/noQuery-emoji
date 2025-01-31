module.exports = function (grunt) {
    // 项目配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // JSHint 配置
        jshint: {
            build: ['Gruntfile.js', 'src/js/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Terser 配置
        terser: {
            build: {
                files: {
                    'dist/js/noQuery.min.js': ['src/js/noQuery.js','src/js/jquery.emoji.js'],
                    'dist/js/emoji.list.js': ['src/js/emoji.list.js']
                }
            },
            options: {
                mangle: true, // 混淆变量名
                compress: {
                    drop_console: true // 移除所有 console.* 调用
                },
                output: {
                    comments: false // 移除注释
                }
            }
        },

        // CSS Minify 配置
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'src/css/',
                    src: ['**/*.css'],
                    dest: 'dist/css/',
                    ext: '.min.css'
                }]
            }
        },

        // 监视文件变化
        watch: {
            js: {
                files: ['src/js/*.js'],
                tasks: ['jshint', 'terser']
            },
            css: {
                files: ['src/css/**/*.css'],
                tasks: ['cssmin']
            }
        }
    });

    // 加载插件
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-terser'); // 使用 terser 插件
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 默认任务
    grunt.registerTask('default', ['jshint', 'terser', 'cssmin', 'watch']);
};