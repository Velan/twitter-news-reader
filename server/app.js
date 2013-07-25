
/**
 * Module dependencies.
 */

'use strict';

var express = require('express'),
  http = require( 'http' ),
  util = require( 'util' ),
  // routes = require('./routes'),
  news = require('./routes/news'),
  http = require('http'),
  path = require('path'),

  twitter = require( './twitter/twitter' );

var app = express();
// all environments

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



// development only
if ( 'development' === app.get('env') ) {

  app.use( express.errorHandler() );

}

require( __dirname + '/routes/index.js' )( app );

app.get( '/api/news', news.list );
// app.get( '/api/news/:id', news.one );


require( __dirname + '/routes/index.js' );

var server = http.createServer(app).listen(app.get('port'), function(){

  util.log('Express server listening on port ' + app.get('port'));
  util.log( app.get('env') + ' environment' );

});

require( './realtime/realtime' )( server ); // Start realtime

twitter.init(); // Check all tweets received since the server was down
twitter.stream(); // Init twitter stream API
