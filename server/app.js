
/**
 * Module dependencies.
 */

'use strict';


var cluster = require( 'cluster' ),
  util = require( 'util' ),
  cpus = require( 'os' ).cpus().length;

// Creating child processes
// The master's will only consist in creating child processes

if( cluster.isMaster ) {

  util.log( 'Node started' );

  var workers = Math.max( cpus, 2 ),

    // specific modules to start
    modules = [ 'twitter' ];

  for (var i = 0; i < workers; i++) {

    cluster.fork({ module : modules[ i ] });

  };

  util.log( workers + ' child processes' )

  cluster.on( 'disconnect', function( worker, code, signal ) {

    util.log( 'Worker disconnected' );
    cluster.fork( worker.env );

  });

  return;

}

switch( process.env.module ) {

  case 'twitter':

    var twitter = require( './twitter/twitter' );

    twitter.init(); // Check all tweets received since the server was down
    twitter.stream(); // Init twitter stream API
    break;
  default:
    require( './express' );

}
