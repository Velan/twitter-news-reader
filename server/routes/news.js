
/*
 * GET users listing.
 */

// var twitter = require( '../twitter/twitter' );


var util    = require( 'util' )
  , redis = require('redis')
  , client = redis.createClient();


exports.list = function( req, res ) {

  var articles = [];

  client.sort( 'articles', 'BY', 'nosort', 'GET', '*', 'LIMIT', 0, 20, 'DESC', function( err, response ) {

    response.forEach(function( article ) {

      articles.push( JSON.parse( article ) );

    });

    res.json( articles );

  });

};

exports.one = function() {



}