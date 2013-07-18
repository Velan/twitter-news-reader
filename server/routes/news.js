
/*
 * GET users listing.
 */

// var twitter = require( '../twitter/twitter' );


var util    = require( 'util' )
  , redis = require('redis')
  , client = redis.createClient();


exports.list = function( req, res ) {

  var articles = [],

    offset = parseInt( req.query.offset, 10 ) || 0,
    limit = Math.min( 100, parseInt( req.query.offset, 10 ) || 20 );

  client.multi([

    [ 'SORT', 'articles', 'BY', 'nosort', 'GET', '*', 'LIMIT', offset, limit, 'DESC' ],
    [ 'ZCOUNT', 'articles', '-inf', '+inf' ]

  ]).exec(function( err, results ) {

    results[0].forEach(function( article ) {

      articles.push( JSON.parse( article ) );

    });


    res.json({

      articles: articles,
      total: results[1],
      offset: offset,
      limit: limit

    });

  });

};

exports.one = function() {



}