
/*jshint camelcase:false */

'use strict';

var util      = require( 'util' ),
  Url         = require( 'url' ),
  redis       = require( 'redis' ),
  fs          = require( 'fs-extra' ),
  crypto      = require( 'crypto' ),

  redisConf   = require( '../config/config' ).config.redis,

  client      = redis.createClient(),

  params      = {

    url     : 'url',
    domain  : 'domain'

  },

  wrongDomain = 'www-nc.nytimes.com',
  correctDomain = 'www.nytimes.com',

  count = 0,

  jobEvent;

var saveArticle = function( article, tweet, last ) {

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

      }

    );

    client.set( key, JSON.stringify( article ) );

  });


  if( last ) {

    util.log( 'Corrected ' + count + ' articles. Over and out!' );

    jobEvent.emit( 'done' );

  }


};


var parseArticle = function( key, creationTime, last ) {

  client.get( key, function( err, article ) {

    article = JSON.parse( article );

    if( article[ params.domain ] !== wrongDomain ) {

      if( last && ! count ) {

        jobEvent.emit( 'done' );

      }

      return;

    }

    console.log( 'Correcting: ' + article.title );

    var url = Url.parse( article[ params.url ] ),

      date = new Date();
    date.setTime( creationTime );

    article.domain = url.host = correctDomain;
    article.url = Url.format( url );

    client.zrem( 'articles', key );
    client.del( key );

    saveArticle( article, { created_at : date.toUTCString() }, last );

    count += 1;

  });


};

var getAllArticles = function() {

  client.zrange(
    'articles', 0, -1,
    'WITHSCORES',
    function( err, articles ) {

      util.log( 'There are ' + articles.length/2 + ' articles to check' );

      for (var i = 0; i < articles.length; i+=2) {

        var last = ( i === articles.length - 2);

        parseArticle( articles[ i ], articles[ i+1 ], last );

      }

    });

};

exports.job = function( job ) {

  jobEvent = job;

  // Shutdown redis, dump the database and save a copy of it

  util.log( 'Dumping redis database...' );

  client.save( function( err ) {

    util.log( 'Dumping done.' );

    if( err ) {

      throw err;

    }

    fs.readFile( redisConf, {

      encoding  : 'utf-8'

    }, function( err, data ) {

      if ( err ) {

        throw err;

      }

      var file = /dbfilename\s(.*)/.exec( data ),
        directory = /dir\s(.*)/.exec( data )[ 1 ],
        fullpath,
        savepath;

      file = file ? file[ 1 ] : 'dump.rdb';

      fullpath = directory + file;
      savepath = fullpath + '.nyt-url-backup';

      util.log( 'Backing ' + fullpath + ' as ' + savepath );

      fs.copy( fullpath, savepath, function( err ) {

        if( err ) {

          console.log( err );
          process.exit( 1 );

        }

        util.log( 'Done. Starting job...' );

        getAllArticles();

      });

    });

  });

};

