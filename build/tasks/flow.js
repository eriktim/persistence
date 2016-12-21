var gulp = require('gulp');
var flow = require('gulp-flowtype');

var paths = require('../paths');

gulp.task('flow', function() {
  return gulp.src(paths.source)
    .pipe(flow({
      all: true,
      weak: false,
      killFlow: false,
      beep: true,
      abort: false
    }));
});
