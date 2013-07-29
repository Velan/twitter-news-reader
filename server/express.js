
'use strict';

var cluster = require( 'cluster' ),
  domain = require( 'domain' ),
  util = require( 'util' ),
  express = require('express'),
  http = require( 'http' ),
  news = require('./routes/news'),
  http = require('http'),
  path = require('path'),

  realtime = require( './realtime/realtime' );

var app = express(),
  req,
  res;

var requestDomain = domain.create();

requestDomain.on( 'error', function( err ) {

  util.log( 'Unexpected error when accessing ' + req.url );
  util.log( util.inspect( err.stack ) );

  try {

    // Tell the master we're dead and pop another cluster
    cluster.worker.disconnect();

    var shutdownTime = setTimeout(function() {

      process.exit( 1 );

    }, 30000);

    shutdownTime.unref();

    res.writeHead( 500 );
    res.end('An unexpected error occured, please refresh your page.');

  }
  catch( err ) {

    util.log( 'Error sending HTTP 500' );
    util.log( util.inspect( err.stack ) );

  }

});


app.use(function( req, res, next ) {

  requestDomain.add( req );
  requestDomain.add( res );

  requestDomain.run( next );

});


app.set( 'port', process.env.PORT || 3000 );

// set the path to the static ressources
app.set( 'static', process.env.static || '../dist' );
app.set( 'path_static', path.normalize( path.join( __dirname, app.get( 'static' ) ) ) );
app.use( express.favicon() );
app.use( express.logger('dev') );
app.use( express.compress() );
app.use( express.bodyParser() );
app.use( express.methodOverride() );
app.use( app.router );

app.use( '/images', express.static( app.get( 'path_static' ) + '/images' ) );
app.use( '/scripts', express.static( app.get( 'path_static' ) + '/scripts' ) );
app.use( '/styles', express.static( app.get( 'path_static' ) + '/styles' ) );
app.use( '/bower_components', express.static( app.get( 'path_static' ) + '/bower_components' ) );
app.use( '/robots.txt', express.static( app.get( 'path_static' ) + '/robots.txt' ) );

require( __dirname + '/routes/index.js' )( app );

app.get( '/api/news', news.list );
// app.get( '/api/news/:id', news.one );


require( __dirname + '/routes/index.js' );

var server = http.createServer(app).listen(app.get('port'), function() {

});

// Start socket.io
realtime( server );
