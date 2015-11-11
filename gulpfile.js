// Expose required modules
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	//coffee = require('gulp-coffee'),
	//browserify = require('gulp-browserify'),
	compass = require('gulp-compass'),
	connect = require('gulp-connect'),
	gulpif = require('gulp-if'),
	uglify = require('gulp-uglify'),
	minifyHTML = require('gulp-minify-html'),
	jsonminify = require('gulp-jsonminify'),
	imagemin = require('gulp-imagemin'),
	pngcrush = require('imagemin-pngcrush'),
	bower = require('gulp-bower'),
	concat = require('gulp-concat');

// Declare variables
var env,
	coffeeSources,
	jsSources,
	sassSources,
	htmlSources,
	jsonSources,
	outputDir,
	bowerDir,
	sassStyle;

// Set environment variable: development ('gulp') or production ('NODE_ENV=production gulp')
env = process.env.NODE_ENV || 'development';

// Set output directory depending on the environmnet
if (env === 'development') {
	outputDir = 'builds/development/';
	sassStyle = 'expanded';
} else {
	outputDir = 'builds/production/'
	sassStyle = 'compressed';
}

// Sources - can be multiple in each array
bowerDir = 'bower_components/' ;
//coffeeSources = ['components/coffee/*.coffee'];
jsSources = [
	bowerDir + 'jquery/dist/jquery.js',
	bowerDir + 'bootstrap-sass/assets/javascripts/bootstrap.js',	
	'components/scripts/*.js'];
sassSources = ['components/sass/main.scss'];
htmlSources = [outputDir + '*.html'];
jsonSources = [outputDir + 'js/*.json'];

//// Tasks

// Bower
gulp.task('bower', function() { 
    return bower()
         .pipe(gulp.dest(bowerDir)) 
});

// Coffee
// gulp.task('coffee', function(){
// 	gulp.src(coffeeSources)
// 		.pipe(coffee({bare: true})
// 		.on('error', gutil.log))
// 		.pipe(gulp.dest('components/scripts'))
// });

// jS
gulp.task('js', function() {
	gulp.src(jsSources)
	.pipe(concat('script.js'))
	//.pipe(browserify())
	.pipe(gulpif(env === 'production', uglify()))
	.pipe(gulp.dest(outputDir + 'js'))
	.pipe(connect.reload()) // Server reload
});

// Sass / Compass
gulp.task('compass', function() {
	gulp.src(sassSources)
	.pipe(compass({
		sass: 'components/sass',
		image: outputDir + 'image',
		style: sassStyle,
		import_path: bowerDir + 'bootstrap-sass/assets/stylesheets'
	})
	.on('error', gutil.log))
	.pipe(gulp.dest(outputDir + 'css'))
	.pipe(connect.reload()) // Server reload
});

// HTML
gulp.task('html', function() {
	gulp.src('builds/development/*.html')
		.pipe(gulpif(env === 'production', jsonminify()))
		.pipe(gulpif(env === 'production', gulp.dest(outputDir)))
		.pipe(connect.reload()) // Server reload
});

// json
gulp.task('json', function() {
	gulp.src('builds/development/js/*.json')
		.pipe(gulpif(env === 'production', minifyHTML()))
		.pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
		.pipe(connect.reload()) // Server reload
});

// Images
gulp.task('images', function() {
	gulp.src('builds/development/images/*.*')
		.pipe(gulpif(env === 'production', imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			use: [pngcrush()]
		})))
		.pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
		.pipe(connect.reload()) // Server reload
});


// Watch for changes
gulp.task('watch', function() {
	//gulp.watch(coffeeSources, ['coffee']);
	gulp.watch(jsSources, ['js']);
	gulp.watch('components/sass/*.scss', ['compass']);
	gulp.watch('builds/development/*.html', ['html']);
	gulp.watch('builds/development/js/*.json', ['json']);
	gulp.watch('builds/development/images/*.*', ['images']);
});

// Start server with live reload
gulp.task('connect', function() {
	connect.server({
		root: outputDir,
		livereload: true
	});
});

// Default: runs when 'gulp' is run from terminal
gulp.task('default', ['bower', 'html', 'js', 'compass', 'images', 'json', 'connect', 'watch']);
