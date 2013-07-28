
var domain = require( 'domain' ),
  express = require('express'),
  http = require( 'http' ),
  news = require('./routes/news'),
  http = require('http'),
  path = require('path'),

  realtime = require( './realtime/realtime' );

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

  var d = domain.create();

  d.on( 'error', function( err ) {

    util.log( util.inspect( err.stack ) );
    util.log( 'Unexpected error on server request' );

    try {

      var shutdownTime = setTimeout(function() {

        process.exit( 1 );

      }, 30000);

      shutdownTime.unref();

      // Stop accepting connections
      server.close();

      // Tell the master we're dead and pop another cluster
      cluster.worker.disconnect();

      res.statusCode = 500;
      res.setHeader('content-type', 'text/plain');

      res.end( 'An unexpected error happened!\n' );


    }
    catch( err ) {

      util.log( 'Everything went wrong' );
      util.log( util.inspect( err.stack ) );

    }


  });

});

// Start socket.io
realtime( server );
