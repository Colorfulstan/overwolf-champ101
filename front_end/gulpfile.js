const gulp = require('gulp');
const replace = require('gulp-replace');
const del = require('del');

gulp.task('build', ['clean:preBuild', 'steal:build', 'copy', 'clean:postBuild']);

//region version and name constants
const devV = require('./manifest.json').meta.version;
const appV = (function () {
	// find last . (if there are 4)
	const dots = devV.match(/\./g);
	if (dots.length === 3) { // M.m.p.rc
		let i = devV.lastIndexOf('.');
		return devV.substring(0, i);
	} else {
		return devV;
	}
})();

console.log('dev-Version: ' + devV, 'App-Version: ' + appV);
const appName = 'champ101';
//endregion

gulp.task('clean:preBuild', function () {
	// working dir is "front_end/"
	return del([
		'out',
		// removing old release from submission folder
		'../' + appName + '_latest/app',
		// removing possible previous build from releases folder
		'../release-candidates/' + appName + '_v' + devV + '/'
	], {force: true});
});
gulp.task('clean:postBuild', ['copy'], function () {
	return del(['script-bundles', 'out', 'dist']);
});


//region copy tasks
gulp.task('copy', ['copy:postBuildRelease', 'copy:postBuildSubmission', 'copy:postBuildSubmissionManifest']);
gulp.task('copy:postBuildRelease', ['copy:recursively'], function () {
	// release candidates
	return copy('out/**/*', '../release-candidates/' + appName + '_v' + devV);
});
gulp.task('copy:postBuildSubmission', ['copy:recursively'], function () {
	// submission to the store
	return copy('out/**/*', '../' + appName + '_latest/app');
});
gulp.task('copy:postBuildSubmissionManifest', ['copy:postBuildSubmission'], function () {
	return gulp.src('out/manifest.json')
	// replace the Version for production
		.pipe(replace(devV, appV))
		.pipe(gulp.dest('../' + appName + '_latest/app'));
});

// copies files while preserving their original folder structure
gulp.task('copy:recursively', ['steal:build', 'copy:views', 'copy:videoJS', 'copy:fakeFilesForUpload', 'copy:steal'], function () {
	return copy([
		'script-bundles/**',
		'assets/css/*.css',
		'assets/font/**/*',
		'assets/img/**/*',
		'manifest.json',
		'plugins/*',
		'readme-curious-dev.md'
	], 'out', true);
});

gulp.task('copy:views', ['clean:preBuild'], function () {
	return gulp.src('views/**/*', {"base": "./"})
	// set steal's data-env to production
		.pipe(replace(/data-env="development"/g, 'data-env="production"'))
		// fix src-path (needs to match the path where the steal.js file gets located through grunt-copy)
		.pipe(replace(/src='\.\.\/node_modules\/steal\/steal\.js'/g, 'src="../steal.production.js"'))
		// change videojs paths
		.pipe(replace(/\.\.\/node_modules\/video\.js\/dist\/video-js/g, '../vendor/videojs'))
		.pipe(gulp.dest('out'));
});
gulp.task('copy:videoJS', ['clean:preBuild'], function () {
	return copy(['node_modules/video.js/dist/video-js/video.js', 'node_modules/video.js/dist/video-js/video-js.min.css'], 'out/vendor/videojs');
});
gulp.task('copy:fakeFilesForUpload', ['clean:preBuild'], function () {
	return copy('filesForUploadRestriction/*', 'out');
});
gulp.task('copy:steal', ['clean:preBuild'], function () {
	return copy('node_modules/steal/steal.production.js', 'out');
});

function copy(src, dest, expand) {
	if (expand) {
		return gulp.src(src, {
			"base": "./"
		}).pipe(gulp.dest(dest));
	} else {
		return gulp.src(src).pipe(gulp.dest(dest));
	}
}
//endregion

const stealTools = require('steal-tools');
gulp.task('steal:build', function () {
	return stealTools.build({
		config: __dirname + "/stealconfig.js",
		main: ['js/main', 'js/settings', 'js/match'],
		bundlesPath: 'script-bundles' // only responsible for creation, not where steal looks for the files
	}, {
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
		watch: false
	});
});