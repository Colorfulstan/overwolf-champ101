module.exports = function (grunt) {
	grunt.initConfig({
		"steal-build": {
			dist: {
				options: {
					system: {
						config: __dirname + "/stealconfig.js",
						main: ['js/main', 'js/settings', 'js/match']
					},
					buildOptions: {
						bundleSteal: false, // doesn't work? propably needs steel-tools also then
						minify: true,
						sourceMaps: true,

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
			},
			// TODO: copying html files + change data-env
			// TODO: copying manifest.json
			// TODO: copying other neccessary dist files
			test: { // TODO: config karma
				options: {
					system: {
						config: __dirname + "/stealconfig.js",
						main: ['js/main', 'js/settings', 'js/match']
					},
					buildOptions: {
						bundleSteal: false, // doesn't work? propably needs steel-tools also then
						minify: false,
						sourceMaps: true,

						//debug: false, // use script tag data-env="development" instead
						//removeDevelopmentCode: true, // use script tag data-env="development" instead

						//	quiet {Boolean}
						//	bundle {Array<moduleName>}
						//bundleDepth {Number}
						//mainDepth {Number}
						//cleanCSSOptions {Object}
						//uglifyOptions {Object}
						//sourceMapsContent {Boolean}
						watch:true
					}
				}
			}
		}
	});
	grunt.loadNpmTasks("steal-tools");
	grunt.registerTask("build", ["steal-build:dist"]);
	grunt.registerTask("karma", ["steal-build:test"]);
};