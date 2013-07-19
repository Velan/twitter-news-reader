/*global define */
define([
	'angular'
  , 'socket'
  , 'angular.socket'
	, 'controllers/articles.controller'

	], function ( 
    angular
    , socket
    , angular_socket
    , articles_controller
  ) {
  'use strict';

  return angular.module( 'nunc.webApp', [ 'btford.socket-io', 'nunc.controllers' ] )
  .run(function ( socket ) {

    socket.forward( 'error' );

  })
  .config(function ( $routeProvider ) {

    $routeProvider
      .when('/', {

        // templateUrl: 'views/main.html',
        controller: 'ArticlesCtrl'

      })
      .otherwise({

        redirectTo: '/'

      });

  })

});