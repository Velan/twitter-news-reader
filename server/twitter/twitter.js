
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
  urlParser   = require( 'url' ).parse,

  config      = require( '../config/config' ).config,

  client    = redis.createClient(),
  clientPub = redis.createClient(),

  readability = new Readability({

    parserToken : config.readability.parserToken

  });

twitter.setAuth.apply( twitter, config.twitter );

var saveArticle = function( article, tweet ) {

  var key = crypto.createHmac( 'sha1', 'zizito el bandito' )
    .update( article.url )
    .digest( 'hex' ),

    print = ( undefined !== print ) ? print : true;

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

        clientPub.publish( 'article', stringResponse );

        client.get( 'lastTweet', function( err, lastTweet ) {

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

      // Replace Redability's default url
      article.url = url;
      article.domain = urlParser( url ).hostname;

      callback( article );

    },
    function( err, response ) {

      util.log( err, response, url );

    }
  );

};

var parseUrl = function( url, callback ) {

  util.log( 'parsing' );

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

  var parsedOriginalUrl = urlParser( originalUrl );

  unshorten( originalUrl, function( unshortenedUrl ) {

    var parsedUnshortenedUrl = urlParser( unshortenedUrl );

    /* 
      If the result is on the same domain, we keep the original url,
      Some websites ( such as the NYTimes ), apparently endlessly redirect until
      the index page
    */

    if( parsedOriginalUrl.hostname === parsedUnshortenedUrl.hostname ) {

      parseUrl( originalUrl, callback );
      return;

    }

    unshortenUrl( unshortenedUrl, callback );

  });

};


var tweetCallback = function( tweet ) {

  if( 'string' === typeof tweet ) {

    tweet = JSON.parse( tweet );

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

  twitter.get(
    'statuses/home_timeline',
    params,
    function( tweets ) {

      if ( ! tweets ) {

        return;
      }

      util.log( tweets.length + ' missed tweet(s), parsing now...' );

      tweets.forEach( tweetCallback );

      if( 200 > tweets.length ) {

        util.log( 'Finished retrieving missed tweets.' );
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

exports.saveArticle = saveArticle;
