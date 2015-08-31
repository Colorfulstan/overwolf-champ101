module.exports = function (grunt) {
	grunt.initConfig({
		"browserify": {
			karma: {
				src: ['main.js', 'settings.js', 'match.js'],
				dest: 'tests/src/bundle.js',
				options: {
					alias: {
						'can': './node_modules/can',
						'global': './js/global.js'
					}
				}
			},
			dist: {
				src: ['main.js', 'settings.js', 'match.js'],
				dest: 'dist/bundle/script.js',
				options: {
					alias: {
						'can': './node_modules/can',
						'global': './js/global.js'
					}
				}
			}
		},
		"steal-build": {
			bundle: {
				options: {
					system: {
						bundles: ['main.js', 'settings.js', 'match.js'],
						config: __dirname + "/package.json",
						main: ['main', 'settings', 'match'],
						map: {
							"can": __dirname + "/node_modules/can/can"
						}
					}
				},
				buildOptions: {
					bundleSteal: true,
					bundleDepth: 10,
					bundle: ['System', 'can']
				}
			}
		},
		"steal-export": {
			dist: {
				system: {
					config: "package.json!npm"
				},
				outputs: {
					"+cjs": {},
					"+amd": {},
					"+global-js": {},
					"+global-css": {}
				}
			}
		}
		//webpack: {
		//	testing: {
		//		// webpack options
		//		entry: "./index.js",
		//		output: {
		//			path: "webpack/",
		//			filename: "main.js"
		//		},
		//		resolve: {
		//			alias:
		//				{
		//					'global': __dirname + '/js/global.js',
		//					'can' : __dirname + '/node_modules/can'
		//				}
		//
		//		},
		//
		//		stats: {
		//			// Configure the console output
		//			colors: true,
		//			modules: true,
		//			reasons: true
		//		},
		//		// stats: false disables the stats output
		//
		//		storeStatsTo: "xyz", // writes the status to a variable named xyz
		//		// you may use it later in grunt i.e. <%= xyz.hash %>
		//
		//		progress: true, // Don't show progress
		//		// Defaults to true
		//
		//		failOnError: false, // don't report error to grunt if webpack find errors
		//		// Use this if webpack errors are tolerable and grunt should continue
		//
		//		watch: false, // use webpacks watcher
		//		// You need to keep the grunt process alive
		//
		//		keepalive: false // don't finish the grunt task
		//		// Use this in combination with the watch option
		//
		//		//inline: true,  // embed the webpack-dev-server runtime into the bundle
		//		// Defaults to false
		//
		//		//hot: true, // adds the HotModuleReplacementPlugin and switch the server to hot mode
		//		// Use this in combination with the inline option
		//
		//	}
		//}
	});
	grunt.loadNpmTasks("steal-tools");
	grunt.loadNpmTasks('grunt-browserify');
	//grunt.registerTask("build", ["steal-build"]);
	grunt.registerTask("build", ["browserify"]);
	grunt.loadNpmTasks('grunt-webpack');
};