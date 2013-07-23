
/*
 * GET home page.
 */

'use strict';

var fs = require( 'fs' );


module.exports = function( app ) {

  var index = fs.readFileSync( app.get( 'path_static' ) + '/index.html', 'utf8' );

  app.get( '/', function( req, res ) {

    res.send( index );

  });

};
