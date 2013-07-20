
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require( 'http' )
  , socketio = require( 'socket.io' )
  , routes = require('./routes')
  , news = require('./routes/news')
  , http = require('http')
  , path = require('path')
  , twitter = require( 'twitter-api' ).createClient()
  , redis = require('redis')
  , client = redis.createClient()
  , crypto = require( 'crypto' )
  , shasum = crypto.createHash( 'sha1' )
  , Readability = require( 'readability-api' )

  , readability = new Readability({

    parserToken : '9758b3e80135a64c816df2cf2efa6e91bf77d22e'

  });


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


// development only
if ( 'development' == app.get('env') ) {

  app.use( express.errorHandler() );

}

require( __dirname + '/routes/index.js' )( app );

app.get( '/api/news', news.list );
app.get( 'api/news/:id', news.one );

twitter.setAuth(

  'TaNO1ODTu6WSwVHIjPJnNA',
  '8DK15D6Rc5pzI6sl5QawEnCLpKuUMTj4iAONOXfsUc',
  '1411838910-aL06r16fA3AuIuwl1SDXONID1ATeUYORo9V6Axw',
  'MyI3v6vdXkwwM8KAin5D65ZXvOFWu0XqlM0DRXDrHfA'

);

var server = http.createServer(app).listen(app.get('port'), function(){

  console.log('Express server listening on port ' + app.get('port'));

});


twitter.get( 'application/rate_limit_status', { ressource : 'statuses' }, function( data, error, status ) {

  if( error ) {

    console.error( 'Status '+status+', failed to fetch application rate limit status' );
    return;

  }

});

var io = socketio.listen( server );

if ( 'production' == app.get('env') ) {

  var clientPub = redis.createClient(),
    clientSub = redis.createClient();

  clientSub.psubscribe('article');



  io.sockets.on( 'connection', function( socket ) {

    var counter = 0;

    clientSub.on( 'pmessage', function( pattern, channel, message ) {

      socket.emit( 'nunc:article', message );

    });

  });

  twitter.stream( 'user', { 'with' : 'followings' }, function( stream ) {

    var tweet = JSON.parse( stream ),
      urls = tweet.entities ? tweet.entities.urls : [];

    if( urls.length ) {

      urls.forEach(function( url ) {

        readability.getConfidence( url.expanded_url, function( response ) {

          if( response.confidence > .5 ) {

            readability.getParsedUrl( url.expanded_url, function( response ) {

              // Check for at least a title and an excerpt
              if( ! response.title || ! respnse.excerpt) {

                return;

              }

              var key = crypto.createHmac( 'sha1', 'zizito el bandito' )
                .update( response.url )
                .digest( 'hex' );


              client.set( key, JSON.stringify( response ), function( err, result ) {

                client.zadd( 'articles', Date.now(), key, function( err, result ) {

                  clientPub.publish( 'article', response );
                  
                });

              });

              client.set( key, JSON.stringify( response ) );

            }, function( err, response ) {

              console.log( err, response, url );

            });

          }

        }, function( err, data ) {



        });

      });

    }


  });

}
else {

  io.sockets.on( 'connection', function( socket ) {

    var counter = 0;

    setInterval(function() {

      socket.emit( 'nunc:article', { title : 'Socket test ' + counter, excerpt : 'Something has been pushed from the server!' });
      counter++;

    }, 10000);

  });

}

