
/**
 * Module dependencies.
 */

var express = require('express')
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
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index );
// app.get('/users', user.list );

app.get( '/news', news.list );
app.get( '/news/:id', news.one );

twitter.setAuth(

  'TaNO1ODTu6WSwVHIjPJnNA',
  '8DK15D6Rc5pzI6sl5QawEnCLpKuUMTj4iAONOXfsUc',
  '1411838910-aL06r16fA3AuIuwl1SDXONID1ATeUYORo9V6Axw',
  'MyI3v6vdXkwwM8KAin5D65ZXvOFWu0XqlM0DRXDrHfA'

);

twitter.get( 'application/rate_limit_status', { ressource : 'statuses' }, function( data, error, status ) {

  if( error ) {

    console.error( 'Status '+status+', failed to fetch application rate limit status' );
    return;

  }

});

twitter.stream( 'user', { 'with' : 'followings' }, function( stream ) {

  console.log( 'tweet' );

  var tweet = JSON.parse( stream ),
    urls = tweet.entities ? tweet.entities.urls : [];

  if( urls.length ) {

    urls.forEach(function( url ) {

      readability.getConfidence( url.expanded_url, function( response ) {

        if( response.confidence > .5 ) {

          readability.getParsedUrl( url.expanded_url, function( response ) {

            var key = crypto.createHmac( 'sha1', 'zizito el bandito' )
              .update( response.url )
              .digest( 'hex' );

            client.multi([

              [ 'set', key, JSON.stringify( response ) ],
              [ 'zadd', 'articles', Date.now(), key ]

            ]).exec(function( err, replies ) {

              console.log( 'Added: ' + response.title );

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


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
