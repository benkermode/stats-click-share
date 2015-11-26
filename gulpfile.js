var gulp = require( 'gulp' );
var concat = require ( 'gulp-concat' );
var uglify = require ( 'gulp-uglify' );
var ngAnnotate = require('gulp-ng-annotate')
var minifyCss = require('gulp-minify-css');
var watch = require ( 'gulp-watch' );
var stripDebug = require ( 'gulp-strip-debug' );
//gulp-imagemin


var jsglobs = [ './html/libs/1.4.4.angular.min.js', './html/angular-modules/statsApp/statsApp.js', './html/angular-modules/**/*.js' ];
var cssglobs = [ './html/css/reset.css', './html/css/style.css' ]; 

gulp.task ( 'scripts', function () {
  gulp.src( jsglobs )
    .pipe(stripDebug())
    .pipe(concat( 'bundle.js' ) )
  //    .pipe( ngAnnotate() )
    .pipe ( uglify() )
    .pipe ( gulp.dest ('./html/js') );
});

gulp.task ( 'styles', function () {
  gulp.src ( cssglobs )
    .pipe ( concat ( 'bundle.css'))
    .pipe( minifyCss() )
    .pipe ( gulp.dest ( './html/css'));
});

gulp.task( 'default', [ 'scripts', 'styles'] , function() {

  gulp.watch(  cssglobs , [ 'styles' ]);
  gulp.watch(  jsglobs , [ 'scripts' ]);

});
