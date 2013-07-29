
'use strict';

var socketio  = require( 'socket.io' ),
  redis     = require('redis'),
  clientSub = redis.createClient(),
  client    = redis.createClient();


module.exports = function( server ) {

  console.log( 'Init socket ' + process.pid );

  var io = socketio.listen( server ),
    RedisStore = socketio.RedisStore;

  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('log level', 0);                    // reduce logging
  io.set(
    'store',
    new RedisStore({

      redisClient : client,

      nodeId : function() {

        return process.pid;

      }
    })
  );

  // enable all transports (optional if you want flashsocket support, please note that some hosting
  // providers do not allow you to create servers that listen on a port different than 80 or their
  // default port)
  io.set('transports', [
    'websocket',
    'flashsocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling'
  ]);

  clientSub.subscribe( 'article' );

  io.sockets.on( 'connection', function( socket ) {

    clientSub.on( 'message', function( channel, message ) {

      socket.emit( 'nunc:article', JSON.parse( message ) );

    });

    socket.on( 'disconnect', function() {

      clientSub.unsubscribe( 'article' );

    });

  });

};
