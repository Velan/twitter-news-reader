
// Camelcase disabled as twitter uses underscore cased 
/*jshint camelcase:false */

'use strict';

var util      = require( 'util' ),
  twitter     = require( 'twitter-api' ).createClient(),
  redis       = require( 'redis' ),
  Readability = require( 'readability-api' ),
  crypto      = require( 'crypto' ),
  unshorten   = require( 'unshorten' ),
  bigint      = require( 'bigint' ),

  client    = redis.createClient(),
  clientPub = redis.createClient(),

  readability = new Readability({

    parserToken : '9758b3e80135a64c816df2cf2efa6e91bf77d22e'

  });

twitter.setAuth(

  'TaNO1ODTu6WSwVHIjPJnNA',
  '8DK15D6Rc5pzI6sl5QawEnCLpKuUMTj4iAONOXfsUc',
  '1411838910-aL06r16fA3AuIuwl1SDXONID1ATeUYORo9V6Axw',
  'MyI3v6vdXkwwM8KAin5D65ZXvOFWu0XqlM0DRXDrHfA'

);

// twitter.setAuth(

//   'HnfXXxqSDCdpVAROFs3A',
//   '9V2j3jDkMf7YQs6MUEXV1ms394zE22sdlKo7TYwOHyI',
//   '43489522-3tKruO5UyLuL07cw1T1H3kRgyRMMqrYC9icnSDb95',
//   'LaqohKbNIhLM908xRy7ZTH9wvvYIFO3OATqNwlJtIg'

// );


var saveArticle = function( article, tweet ) {

  var key = crypto.createHmac( 'sha1', 'zizito el bandito' )
    .update( article.url )
    .digest( 'hex' );

  var stringResponse = JSON.stringify( article );

  client.set( key, stringResponse, function( err, result ) {

    if( err ) {

      util.log( err, result );

    }

    client.zadd(
      'articles',
      new Date( tweet.created_at ).getTime(),
      key,
      function( err, result ) {

        if( err ) {

          util.log( err, result );

        }

        util.log( 'Added new article: ' + article.title );
        clientPub.publish( 'article', stringResponse );

        client.get( 'lastTweet', function( err, lastTweet ) {

          console.log( parseInt( lastTweet, 10 ) < parseInt( tweet.id_str, 10 ) );

          if( parseInt( lastTweet, 10 ) < parseInt( tweet.id_str, 10 ) ) {

            client.set( 'lastTweet', tweet.id_str );

          }

        });

      }

    );

  });

  client.set( key, JSON.stringify( article ) );

};

var confidenceCallback = function( url, callback ) {

  readability.getParsedUrl(

    url,
    function( article ) {

      // Check for at least a title and an excerpt
      if( ! article.title || ! article.excerpt) {

        return;

      }

      callback( article );

    },
    function( err, response ) {

      util.log( err, response, url );

    }
  );

};

var parseUrl = function( url, callback ) {

  readability.getConfidence(

    url,
    function( response ) {

      if( response.confidence > 0.5 ) {

        confidenceCallback( url, callback );

      }
      else {

        util.log( 'Low confidence' );

      }

    },
    function( err, data ) {

      util.inspect( data );
      util.inspect( err );

    }
  );

};

var unshortenUrl = function( originalUrl, callback ) {

  unshorten( originalUrl, function( url ) {

    parseUrl( url, callback );

  });

};


var tweetCallback = function( tweet ) {

  if( 'string' === typeof tweet ) {

    tweet = JSON.stringify( tweet );

  }

  var urls = tweet && tweet.entities ? tweet.entities.urls : [];

  if( ! urls.length ) {

    util.log( 'No urls in tweet' );

  }

  urls.forEach(function( url ) {

    unshortenUrl( url.expanded_url, function( article ) {

      saveArticle( article, tweet );

    });

  });

};

var getTweets = function( since, max ) {

  var params = {

    count       : 200,
    since_id    : since,
    trim_user   : true

  };

  if( max ) {

    params.max_id = max;

  }

  util.log( util.inspect( params ));

  twitter.get(
    'statuses/home_timeline',
    params,
    function( tweets ) {

      util.log( tweets.length );

      util.log( util.inspect( tweets ));

      tweets.forEach( tweetCallback );

      if( 200 > tweets.length ) {

        return;

      }
      else {

        max = bigint( tweets[ 199 ].id_str ).sub( 1 ).toString();
        getTweets( since, max );

      }

    }
  );

};

exports.stream = function() {

  util.log( 'Listening to twitter stream!' );

  twitter.stream( 'user', { 'with' : 'followings' }, tweetCallback );

};

exports.init = function() {

  client.get( 'lastTweet', function( err, lastTweet ) {
    // if redis sends nill, means the value has not been set yet

    if( ! lastTweet ) {

      return;

    }

    getTweets( lastTweet, '' );


  });

};

