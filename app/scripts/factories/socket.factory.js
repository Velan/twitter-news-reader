
define([
  'angular',
  'io'
], function( angular ) {

  'use strict';

  var factory = angular.module( 'nunc.factories', [])
  .factory( 'socket', [ '$rootScope', function( $rootScope ) {

    var socket = io.connect();

    return {
      on: function( eventName, callback ) {

        socket.on( eventName, function() {

          var args = arguments;
          $rootScope.$apply(function() {

            callback.apply( socket, args );

          });

        });

      },

      emit: function() {

        socket.emit( eventName, data, function() {

          var args = arguments;
          $rootScope.$apply(function() {

            if( callback ) {

              callback.apply( socket, args );

            }
          });
        });
      }
    }

  }]);

  return factory;

});
