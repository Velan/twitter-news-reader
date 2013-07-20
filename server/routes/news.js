
/*
 * GET users listing.
 */


var util    = require( 'util' )
  , redis = require('redis')
  , client = redis.createClient();

exports.list = function( req, res ) {

  var offset = parseInt( req.query.offset, 10 ) || 0,
    limit = Math.min( 100, parseInt( req.query.limit, 10 ) || 20 ),

    response = { articles: [], offset: offset, limit: limit };

  console.time( 'Retrieve articles' );

  client.sort(

    'articles', 'BY', 'nosort',
    'GET', '*',
    'LIMIT', offset, limit, 'DESC',
    function( err, articles ) {

      articles.forEach(function( article ) {

        article = JSON.parse( article );
        delete article.content;

        response.articles.push( article );

      });

      client.zcount( 'articles', '-inf', '+inf', function( err, articleCount ) {

        response.total = articleCount;

        res.json( response );
        console.timeEnd( 'Retrieve articles' );

      });

    }

  );


};

exports.one = function( id ) {



}