
/*jshint latedef:false */

'use strict';

var util = require( 'util' ),
  fs = require( 'fs-extra' ),
  EventEmitter = require( 'events' ).EventEmitter;

var done = fs.existsSync( './.jobs.json' ) ? require( './.jobs.json' ) : {},
  jobs = fs.readdirSync( './jobs' ),
  i = 0,
  nojobs = true; // global i

var startJob = function( jobName ) {

  util.log( 'Starting job ' + jobName );

  var jobEvent = new EventEmitter();

  jobEvent.on( 'done', function() {

    done[ jobName ] = true;

    fs.writeJson( './.jobs.json', done, function( err ) {

      if( err ) {

        throw err;

      }

      nojobs = true;
      checkJobs();

    });

  });

  require( './jobs/' + jobName ).job( jobEvent );

};

var checkJobs = function() {

  util.log( 'Checking for jobs...' );

  for ( ; i < jobs.length; i++ ) {

    if( ! done[ jobs[ i ] ] ) {

      nojobs = false;
      startJob( jobs[ i ] );

      break;

    }

  }

  if( nojobs ) {

    util.log( 'Finished checking for jobs' );
    process.exit(0);

  }

};

checkJobs();
