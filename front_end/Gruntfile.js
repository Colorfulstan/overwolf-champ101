module.exports = function (grunt) {
	grunt.initConfig({
		"steal-build": {
			dist: {
				options: {
					system: {
						config: __dirname + "/stealconfig.js",
						main: ['js/main', 'js/settings', 'js/match'],
						bundlesPath: 'dist/bundles/'
					},
					buildOptions: {
						bundleSteal: false, // doesn't work? propably needs steel-tools also then
						minify: true,
						sourceMaps: false,

						//debug: false, // use script tag environment="development" instead
						//removeDevelopmentCode: true, // use script tag environment="development" instead

						//	quiet {Boolean}
						//	bundle {Array<moduleName>}
						//bundleDepth {Number}
						//mainDepth {Number}
						//cleanCSSOptions {Object}
						//uglifyOptions {Object}
						//sourceMapsContent {Boolean}
						watch:false
					}
				}
			}
		},
		clean: ["dist", 'out'],
		copy: {
			views: { expand: true, src: 'views/**/*', dest: 'out/',
				options: {
					timestamp: true,
					process: function (content, srcpath) {
						// set steal's data-env to production
						var temp = content.replace(/data-env="development"/g,'data-env="production"');
						// fix src-path (needs to match the path where the steal.js file gets located through grunt-copy)
						return temp.replace(/src='\.\.\/node_modules\/steal\/steal\.js'/g,'src="../steal.production.js"');
					}
				}
			}
			, js: { expand: true, cwd: 'dist/', src: 'bundles/**', dest: 'out/dist/'}
			, css: { expand:true, src: ['assets/css/*.css'], dest: 'out/'}
			, fonts: { expand:true, src: ['assets/font/**/*'], dest: 'out/'}
			, img: { expand:true, src: 'assets/img/**/*', dest: 'out/'}
			, cfg: { expand:true, src: 'manifest.json', dest: 'out/'}
			, steal: { expand:true, cwd: 'node_modules/steal', src: ['steal.production.js'], dest: 'out/'}
			, videojs: { expand:true, src: ['node_modules/video.js/dist/video-js/**'], dest: 'out/'}
		}

	});
	grunt.loadNpmTasks("steal-tools");
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask("build", ["clean","steal-build:dist", "copy"]);
};