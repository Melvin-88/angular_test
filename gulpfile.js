var gulp = require('gulp');
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var minify = require('gulp-minify');
var concat = require('gulp-concat');



//css
gulp.task('css', function() {
    return gulp.src('app/css/*.css')
        .pipe(concatCss("main.css"))
        .pipe(minifyCss())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest('app/src/css'));
});

//js
gulp.task('js', function() {
    return gulp.src([
        'app/js/jquery-3.1.1.min.js',
        'app/bower_components/angular/angular.js',
        'app/bower_components/angular-route/angular-route.js',
        'app/bower_components/ng-file-upload/ng-file-upload.min.js',
        'app/js/ng-infinite-scroll.js',
        'app/js/bootstrap.min.js',
        'app/bower_components/angular-bootstrap/ui-bootstrap.min.js',
        'app/bower_components/angular-animate/angular-animate.min.js',
        'app/js/app.js'
    ])
        .pipe(concat("main.js"))
        .pipe(rename('main.min.js'))
        .pipe(gulp.dest('app/src/js'));
});

