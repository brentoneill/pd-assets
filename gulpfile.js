// Gulp related packages
var gulp = require('gulp'),
    ngAnnotate = require('gulp-ng-annotate'),
    concat = require('gulp-concat'),
    gutil = require('gulp-util'),
    serve = require('gulp-serve'),
    minify = require('gulp-minify'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    htmlmin = require('gulp-htmlmin'),
    plumber = require('gulp-plumber'),
    serve = require('gulp-serve'),
    rimraf = require('gulp-rimraf'),
    uglify = require('gulp-uglify'),
    templateCache = require('gulp-angular-templatecache'),
    mainBowerFiles = require('gulp-main-bower-files'),
    gulpDocs = require('gulp-ngdocs'),
    gulpFilter = require('gulp-filter'),
    sourcemaps = require('gulp-sourcemaps'),
    runSequence = require('gulp-run-sequence'),
    gulpSequence = require('gulp-sequence');


// Non gulp related packages
var del = require('del'),
    canonical = require('canonical-path'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync').create();

// setup some paths for ease of use
var paths = {
    jsPD: 'components/**/*.js',
    jsVendor: 'vendor/**/*.js',
    stylesImport: 'styles/core/imports-all.less',
    componentTemplates: 'components/**/*.html',
    componentLess: 'components/**/*.less',
    fonts: 'fonts/*.*',
    images: 'images/*.*',
    oldLess: 'less/imports.less',
    dist: 'dist',
    docs: 'docs',
    docsContent: 'docs-content/**/*.ngdoc ',
    docsData: 'docs-data'
};

// builds pd-assets docs
gulp.task('build:docs', ['js:docs', 'less:docs', 'templates:docs', 'vendor:docs', 'fonts:docs', 'images:docs', 'data:docs'], function () {
    var options = {
        html5Mode: false,
        title: 'PD Assets Documentation',
        startPage: '/components',
        image: 'images/pd-logo.png',
        inlinePartials: true,
        scripts: [
            'pd-assets-vendor.js',
            'pd-assets-templates.js',
            'pd-assets.js'
        ],
        styles: [
            'pd-assets.css',
        ],
        editExample: false,
        editLink: false,
        bestMatch: true,
        loadDefaults: {
            prettify: false
        }
    };
    return gulpDocs.sections({
            // creates two nav sections
            components: {
                glob: ['docs-content/components/*.ngdoc', paths.jsPD],
                title: 'Components'
            },
            styles: {
                glob: ['docs-content/styles/*.ngdoc'],
                title: 'Styles'
            },
            resources: {
                glob: ['docs-content/resources/*.ngdoc', 'docs-content/resource/*.html`'],
                title: 'Resources'
            }
        })
        .pipe(plumber({
            errorHandler: function(err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(gulpDocs.process(options))
        .pipe(gulp.dest(paths.docs))
        .pipe(browserSync.stream());
});

// concats all old pdassets styles
gulp.task('oldLess', function (done) {
    return gulp.src([paths.oldLess])
        .pipe(less())
        .pipe(rename('old-pd-assets.css'))
        .pipe(gulp.dest(paths.docs + '/css'))
});

// concats all pd-assets angular modules and moves to docs folder
gulp.task('js:docs', function (done) {
    return gulp.src(paths.jsPD)
        .pipe(concat('pd-assets.js'))
        .pipe(ngAnnotate())
        .pipe(gulp.dest(paths.docs + '/js'));
});

// concats all pd-assets angular modules and moves to docs folder
gulp.task('js:build', ['clean:build'], function (done) {
    return gulp.src(paths.jsPD)
        .pipe(concat('pd-assets.js'))
        .pipe(ngAnnotate())
        .pipe(gulp.dest(paths.dist));
});

// concats all pd-assets less files then converts to css
gulp.task('less:docs', function (done) {
    return gulp.src([ paths.stylesImport ])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(rename('pd-assets.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.docs + '/css'))
});

// concats all pd-assets less files then converts to css
gulp.task('less:build', function (done) {
    return gulp.src([ paths.stylesImport ])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(rename('pd-assets.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.dist))
});

// grab all fonts from pd-assets and move to doc folder
gulp.task('fonts:docs', function (done) {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest(paths.docs + '/assets/fonts'));
});

// moves all the images found in pd assets in to the docs folder
gulp.task('images:docs', function (done) {
    return gulp.src(paths.images)
        .pipe(gulp.dest(paths.docs + '/assets/images'));
});

// cleans the old docs folder
gulp.task('clean:docs', function(done) {
    return gulp.src(paths.docs, { read: false })
        .pipe(rimraf({ force: true }))
})

// grabs all pd-assets templates and drops them in docs
gulp.task('templates:docs', function (done) {
    var options = {
        standalone: true,
        module: 'templates.pdassets'
    };
    return gulp.src(paths.componentTemplates)
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(templateCache('pd-assets-templates.js', options))
        .pipe(gulp.dest(paths.docs + '/js'));
});

// grabs all pd-assets templates and drops them in docs
gulp.task('templates:build', function (done) {
    var options = {
        standalone: true,
        module: 'pdAssetsTemplates'
    };
    return gulp.src(paths.componentTemplates)
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(templateCache('pd-assets-templates.js', options))
        .pipe(gulp.dest(paths.dist));
});

// serves up the docs and builds them first
gulp.task('serve:docs', ['build:docs'], function () {
    browserSync.init({
        port: 9000,
        reloadDebounce: 1500,
        server: {
            baseDir: paths.docs
        }
    });
});

gulp.task('vendor:docs', function(done) {
    var filterJS = gulpFilter('**/*.js', { restore: true });
    return gulp.src('./bower.json')
        .pipe(mainBowerFiles())
        .pipe(filterJS)
        .pipe(concat('pd-assets-vendor.js'))
        .pipe(filterJS.restore)
        .pipe(gulp.dest(paths.docs + '/js'))
});

gulp.task('vendor:build', function(done) {
    var filterJS = gulpFilter('**/*.js', { restore: true });
    return gulp.src('./bower.json')
        .pipe(mainBowerFiles())
        .pipe(filterJS)
        .pipe(concat('pd-assets-vendor.js'))
        .pipe(gulp.dest(paths.dist))
});

gulp.task('data:docs', function(done) {
    return gulp.src(paths.docsData + '/*.json')
        .pipe(gulp.dest(paths.docs + '/data'));
})

gulp.task('clean:docs', function(done) {
    return gulp.src(paths.docs, { read: false })
        .pipe(rimraf());
})

gulp.task('clean:build', function(done) {
    return gulp.src(paths.dist, { read: false })
        .pipe(rimraf());
})

// reloads the server via browser sync
gulp.task('reload', function () {
    browserSync.reload();
    return gutil.log('Something changed! Reloading your browser....');
});

// Builds all less and javascript and dumps in to a dist folder
gulp.task('build', function(done) {
    runSequence('clean:build', ['js:build', 'vendor:build', 'less:build', 'templates:build'], done)
});

// main task for running doc development
gulp.task('docs', function (done) {
    runSequence('clean:docs', 'serve:docs', 'watch:docs', done);
});

gulp.task('watch:docs', function () {
    gulp.watch(paths.jsPD, ['js:docs', 'templates:docs']);
    gulp.watch(paths.docsContent, ['build:docs']);
    gulp.watch('**/*.less', ['less:docs']);
    gulp.watch(paths.docs + '/**/*.*', ['reload']);
})
