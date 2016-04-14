'use strict';
import path from 'path';
import yo from 'yeoman-test';
import assert from 'yeoman-assert';
import sinon from 'sinon';

describe( 'generator-espm-plugin', () => {
    let appPath = path.join( __dirname, '../generators/app' );
    let context = {
        appName: 'meuPlugin',
        githubUserName: 'hoisel'
    };
    let generator;
    var formats = [ 'es6', 'cjs' ];

    formats.forEach( function( format ) {

        describe( 'when generating plugin with format === ' + format, () => {
            describe( 'and skip-install === false and autoExec === true', () => {
                beforeEach( done => {
                    yo.run( appPath )
                      .withPrompts( { format: format } )
                      .withOptions( {
                          'skip-install': false
                      } )
                      .on( 'ready', gen => {
                          generator = gen;
                          generator.npmInstall = sinon.spy();
                          sinon.stub( generator, 'spawnCommand', () => {
                              return {
                                  on: function( evt, fn ) {
                                      fn( 0 );
                                  }
                              };
                          } );
                      } )
                      .on( 'end', done );
                } );

                it( 'then call npmInstall once', () => {
                    assert( generator.npmInstall.calledOnce );
                } );

                it( 'then call spawnCommand once to install jspm packages', () => {
                    assert( generator.spawnCommand.calledWith( 'jspm', [ 'install', '-y' ] ) );
                } );

                it( 'then call spawnCommand once to serve plugin', () => {
                    assert( generator.spawnCommand.calledWith( 'npm', [ 'start' ] ) );
                } );
            } );

            describe( 'and skip-install === false and autoExec === false', () => {
                beforeEach( done => {
                    yo.run( appPath )
                      .withPrompts( {
                          format: format,
                          autoExec: 'n'
                      } )
                      .withOptions( {
                          'skip-install': false
                      } )
                      .on( 'ready', gen => {
                          generator = gen;
                          generator.npmInstall = sinon.spy();
                          sinon.stub( generator, 'spawnCommand', () => {
                              return {
                                  on: function( evt, fn ) {
                                      fn( 0 );
                                  }
                              };
                          } );
                      } )
                      .on( 'end', done );
                } );

                it( 'then call npmInstall once', () => {
                    assert( generator.npmInstall.calledOnce );
                } );

                it( 'then call spawnCommand once to install jspm packages', () => {
                    assert( generator.spawnCommand.calledOnce );
                    assert( generator.spawnCommand.calledWith( 'jspm', [ 'install', '-y' ] ) );
                } );

                it( 'then not call spawnCommand once to serve plugin', () => {
                    assert( generator.spawnCommand.calledWith( 'npm', [
                        'run', 'serve'
                    ] ) === false );
                } );
            } );

            describe( 'and skip-install == false and jspm install fails', () => {
                beforeEach( done => {
                    yo.run( appPath )
                      .withPrompts( { format: format } )
                      .withOptions( {
                          'skip-install': false
                      } )
                      .on( 'ready', gen => {
                          generator = gen;
                          generator.npmInstall = sinon.spy();
                          sinon.stub( generator, 'spawnCommand', () => {
                              return {
                                  on: function( evt, fn ) {
                                      fn( 1 );
                                  }
                              };
                          } );
                      } )
                      .on( 'end', done );
                } );

                it( 'then call npmInstall once', () => {
                    assert( generator.npmInstall.calledOnce );
                } );

                it( 'then call spawnCommand once to install jspm packages', () => {
                    assert( generator.spawnCommand.calledOnce );
                    assert( generator.spawnCommand.calledWith( 'jspm', [ 'install', '-y' ] ) );
                } );

                it( 'then not call spawnCommand to serve plugin', () => {
                    assert( generator.spawnCommand.calledWith( 'npm', [
                        'run', 'serve'
                    ] ) === false );
                } );
            } );

            describe( 'and skip-install == true', () => {
                beforeEach( done => {
                    yo.run( appPath )
                      .withPrompts( { format: format } )
                      .withOptions( {
                          'skip-install': true
                      } )
                      .on( 'ready', gen => {
                          generator = gen;
                          generator.npmInstall = sinon.spy();
                          sinon.stub( generator, 'spawnCommand', () => {
                              return {
                                  on: function( evt, fn ) {
                                      fn( 0 );
                                  }
                              };
                          } );
                      } )
                      .on( 'end', done );
                } );

                it( 'then never call npmInstall', () => {
                    assert( generator.npmInstall.called === false );
                } );

                it( 'then never call spawnCommand', () => {
                    assert( generator.spawnCommand.called === false );
                } );
            } );

            describe( 'and createUnitTests === false', () => {
                beforeEach( done => {
                    yo.run( appPath )
                      .withPrompts( {
                          format: format,
                          createUnitTests: 'n'
                      } )
                      .withOptions( {
                          'skip-install': true
                      } )
                      .on( 'end', done );
                } );

                it( 'then no generates test files', () => {
                    assert.noFile( [
                        'karma.conf.js', `lib/plugin/${context.appName}.controller.specs.js`
                    ] );
                } );
            } );

            describe( 'and default settings', () => {
                beforeEach( done => {
                    yo.run( appPath )
                      .withPrompts( { format: format } )
                      .withOptions( {
                          'skip-install': true
                      } )
                      .on( 'end', done );
                } );

                it( 'then generates config files', () => {
                    assert.file( [
                        'package.json',
                        'README.md',
                        'gulpfile.js',
                        'config.js',
                        'karma.conf.js',
                        '.eslintrc.json',
                        '.gitignore',
                        'system.yuml.js'
                    ] );
                } );

                it( 'then plugin depends on eslint-config-prodest', () => {
                    assert.fileContent( 'package.json', '"eslint-config-idiomatic":' );
                    assert.fileContent( 'package.json', '"eslint-config-prodest":' );
                } );

                it( 'then plugin depends on eslint-config-prodest-angular', () => {
                    assert.fileContent( 'package.json', '"eslint-plugin-angular":' );
                    assert.fileContent( 'package.json', '"eslint-config-prodest-angular":' );
                } );
            } );

            describe( 'and using --pluginName argument', () => {
                beforeEach( done => {
                    yo.run( appPath )
                      .withPrompts( { format: format } )
                      .withOptions( {
                          'skip-install': true
                      } )
                      .withArguments( [ context.appName ] )
                      .on( 'end', done );
                } );

                it( 'then generates the same pluginName in every file', () => {
                    assert.fileContent( 'package.json', '"name": "meuPlugin"' );
                    assert.fileContent( 'README.md', 'meuPlugin' );
                    assert.fileContent( 'gulpfile.js', 'meuPlugin' );
                } );

                it( 'then generates plugin src files with plugin name', () => {
                    assert.file( [
                        'lib/plugin/index.js',
                        `lib/plugin/${context.appName}.controller.js`,
                        `lib/plugin/${context.appName}.controller.specs.js`,
                        `lib/plugin/${context.appName}.routes.js`,
                        `lib/plugin/${context.appName}.tpl.html`,
                        `lib/plugin/${context.appName}.css`
                    ] );
                } );

                it( 'then generates  espm (ES na palma da mão) emulator files', () => {

                    // js
                    assert.file( [
                        'lib/espmEmulator/espm.js',
                        'lib/espmEmulator/espm.controller.js',
                        'lib/espmEmulator/espm.routes.js',
                        'lib/espmEmulator/index.html'
                    ] );

                    //css
                    assert.file( [
                        'lib/espmEmulator/css/espm-bootstrap-override.css',
                        'lib/espmEmulator/css/espm.css'
                    ] );

                    //img
                    assert.file( [
                        'lib/espmEmulator/img/user.png',
                        'lib/espmEmulator/img/diamond-effect.png',
                        'lib/espmEmulator/img/brasao-governo-horizontal.png'
                    ] );
                } );
            } );

            describe( 'and prompting github user name', () => {
                beforeEach( done => {
                    yo.run( appPath )
                      .withOptions( {
                          'skip-install': true
                      } )
                      .withPrompts( {
                          githubUserName: context.githubUserName,
                          format: format
                      } )
                      .withArguments( [ context.appName ] )
                      .on( 'end', done );
                } );

                it( 'then generates the same github username in every file', () => {
                    assert.fileContent( 'package.json', `"format": "${format}"` );
                    assert.fileContent( 'package.json', `"repository": "http://github.com/${context.githubUserName}/${context.appName}"` );
                    assert.fileContent( 'gulpfile.js', `jspm link github:${context.githubUserName}/${context.appName}@dev -y` );
                } );
            } );
        } );
    } );
} );
