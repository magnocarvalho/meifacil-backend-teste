var gulp = require('gulp');
var ts = require('gulp-typescript');
var nodemon = require('gulp-nodemon');
var merge = require('merge2');
var tsConfig = require('./tsconfig.json');
var del = require('del');

function clean() {
    // You can use multiple globbing patterns as you would with `gulp.src`,
    // for example if you are using del 2.0 or above, return its promise
    return del([ 'bin' ]);
  }

function construir() {
    // var stream = tsProject.src('src')
    var stream = gulp.src(['src/**/*.ts'])
        .pipe(ts(tsConfig.compilerOptions)); // your ES2015 code 
    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations are done.
        stream.dts.pipe(gulp.dest('bin')),
        stream.js.pipe(gulp.dest('bin'))
    ]);
};
function watch(done) {
    var stream = nodemon({
        ext: 'ts',
        script: 'bin/index.js' // run ES5 code 
        , watch: 'src' // watch ES2015 code 
        , tasks: ['compile'] // compile synchronously onChange 
        ,done: done
    }); 
    return stream.on('restart', function () {
        console.log('restarted!');
      })
      .on('crash', function() {
        console.error('Application has crashed!\n')
         stream.emit('restart', 10);  // restart the server in 10 seconds
      });
};
/*
default task
*/
// exports.default = gulp.task('default',gulp.series(['watch']), function(){
//     gulp.watch(gulp.series(['watch']))
// });
var build = gulp.series(clean, gulp.parallel(construir));

exports.clean = clean;
exports.watch = watch;
exports.build = build;

exports.default = watch;