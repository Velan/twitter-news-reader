
/**
 * Module dependencies.
 */

'use strict';


var cluster = require( 'cluster' ),
  domain = require( 'domain' ),
  util = require( 'util' ),
  cpus = require( 'os' ).cpus().length;

// Creating child processes
// The master's will only consist in creating child processes

var bindDisconnect = function( worker, env ) {

  worker.on( 'disconnect', function() {

    var newWorker = cluster.fork( env );

    bindDisconnect( newWorker, env );

  });

};

if( cluster.isMaster ) {

  util.log( 'Node started' );

  var workers = [],
    workersCount = Math.max( cpus, 2 ),

    // specific modules to start
    modules = [ 'twitter' ];

  for (var i = 0; i < workersCount; i++) {

    var env = { module : modules[ i ] };

    workers.push( cluster.fork( env ) );

    bindDisconnect( workers[ i ], env );

  }

  util.log( workersCount + ' child processes' );

  return;

}

var workerDomain = domain.create();

workerDomain.on( 'error', function( err ) {

  util.log( 'Application unexpected error' );
  console.log( err );

  try {

    // Tell the master we're dead and pop another cluster
    cluster.worker.disconnect();

    var shutdownTime = setTimeout(function() {

      process.exit( 1 );

    }, 30000);

    shutdownTime.unref();

  }
  catch( err ) {

    util.log( 'Everything went wrong' );
    util.log( util.inspect( err ) );

  }

});

workerDomain.run(function() {

  switch( process.env.module ) {

  case 'twitter':

    var twitter = require( './twitter/twitter' );

    twitter.init(); // Check all tweets received since the server was down
    twitter.stream(); // Init twitter stream API
    break;
  default:
    require( './express' );

  }

});
