'use strict';
var path = require( 'path' );
var gulp = require( 'gulp' );
var eslint = require( 'gulp-eslint' );
var excludeGitignore = require( 'gulp-exclude-gitignore' );
var mocha = require( 'gulp-mocha' );
var istanbul = require( 'gulp-istanbul' );
var nsp = require( 'gulp-nsp' );
var plumber = require( 'gulp-plumber' );
var coveralls = require( 'gulp-coveralls' );
var runSequence = require( 'gulp-run-sequence' );
var babelCompiler = require( 'babel-core/register' );

gulp.task( 'lint', function() {
    return gulp.src( [ './**/*.js', '!./**/_*.js' ] )
               .pipe( excludeGitignore() )
               .pipe( eslint( { fix: true } ) )
               .pipe( eslint.format() )
               .pipe( gulp.dest( './' ) )
               .pipe( eslint.failAfterError() );
} );

gulp.task( 'nsp', function( cb ) {
    nsp( { package: path.resolve( 'package.json' ) }, cb );
} );


gulp.task( 'pre-test', function() {
    return gulp.src( [ 'generators/**/*.js', '!generators/**/templates/**' ] )
               .pipe( istanbul( {
                   includeUntested: true
               } ) )
               .pipe( istanbul.hookRequire() );
} );

gulp.task( 'test', [ 'pre-test' ], function( cb ) {
    gulp.src( 'test/**/*.js' )
        .pipe( plumber() )
        .pipe( mocha( {
            reporter: 'spec',
            compilers: {
                js: babelCompiler
            }
        } ) )
        .on( 'error', function( err ) {
            cb( err );
        } )
        .pipe( istanbul.writeReports() )
        .on( 'end', function() {
            cb();
        } );
} );


gulp.task( 'watch', function() {
    gulp.watch( [ 'generators/**/*.js', '!generators/**/templates/**', 'test/**' ], [ 'test' ] );
} );


gulp.task( 'coveralls', [ 'test' ], function() {
    if ( !process.env.CI ) {
        return;
    }

    return gulp.src( path.join( __dirname, 'coverage/lcov.info' ) )
               .pipe( coveralls() );
} );

gulp.task( 'prepublish', [ 'nsp' ] );
gulp.task( 'default', function( cb ) {
    runSequence( 'lint', [ 'test', 'coveralls' ], cb );
} );
