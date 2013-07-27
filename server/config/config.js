
'use strict';

var _ = require( 'lodash' ),
  environment = require( './environment.json' ).environment,
  serverConfig = require( './' + environment + '.config.json' );

exports.config = function() {

  var config = {

    redis : '/etc/redis.conf',

    environment : 'default',

    twitter : [

      'Consumer key',
      'Consumer secret', // Consumer secret
      'Access token', // Access Token
      'Access token secret' // Access Token Secret

    ],

    readability : {

      parserToken : 'parserToken'

    }

  };

  _.extend( config, serverConfig );

  return config;

}.call();
