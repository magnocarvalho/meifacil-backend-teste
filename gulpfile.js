var gulp = require('gulp');
var ts = require('gulp-typescript');
var nodemon = require('gulp-nodemon');
var merge = require('merge2');
var tsConfig = require('./tsconfig.json');
var del = require('del');

gulp.task('clean', function() {
    // You can use multiple globbing patterns as you would with `gulp.src`,
    // for example if you are using del 2.0 or above, return its promise
    return del([ 'bin' ]);
});

gulp.task('compile', function(){
    // var stream = tsProject.src('src')
    var stream = gulp.src(['src/**/*.ts'])
        .pipe(ts(tsConfig.compilerOptions)); // your ES2015 code 
    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations are done.
        stream.dts.pipe(gulp.dest('bin')),
        stream.js.pipe(gulp.dest('bin'))
    ]);
});
gulp.task('server', function(done) {
    var stream = nodemon({
        ext: 'ts',
        script: 'bin/index.js' // run ES5 code 
        , watch: 'src' // watch ES2015 code 
        , tasks: ['compile']// compile synchronously onChange 
        ,done: done
    }); 
    return stream.on('restart', function () {
        console.log('restarted!');
      })
      .on('crash', function() {
        console.error('Application has crashed!\n')
         stream.emit('restart', 10);  // restart the server in 10 seconds
      });
});
gulp.task('watch', gulp.parallel('compile'));
gulp.task('default', gulp.series('clean', 'watch', gulp.parallel('server')));


