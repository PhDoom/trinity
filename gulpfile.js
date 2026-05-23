const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
// Pass the modern dart-sass compiler into gulp-sass as required by Gulp 5 / Node 18+ pipelines
const sass = require('gulp-sass')(require('sass'));

/* ----------------------------------------- */
/* Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err) {
  console.error(err.toString());
  this.emit('end');
}

const SYSTEM_SCSS = ["scss/**/*.scss"];

function compileScss() {
  // Configure modern options for Dart Sass output layout.
  let options = {
    outputStyle: 'expanded'
  };

  return gulp.src(SYSTEM_SCSS)
    .pipe(sourcemaps.init()) // Added sourcemaps initialization to align with package.json dependencies
    .pipe(
      sass(options)
        .on('error', handleError)
    )
    .pipe(prefix({
      cascade: false
    }))
    .pipe(sourcemaps.write('.')) // Writes external .css.map files to make debugging character sheet styles easier in the F12 console
    .pipe(gulp.dest("./css"));
}

const css = gulp.series(compileScss);

/* ----------------------------------------- */
/* Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(SYSTEM_SCSS, css);
}

/* ----------------------------------------- */
/* Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
  compileScss,
  watchUpdates
);
exports.css = css;
