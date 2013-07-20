/*global define */
define([
  'angular',
  'socket',
  // 'angular.socket',
  'controllers/articles.controller'

], function (
    angular,
    socket,
    // angularSocket,
    articlesController
  ) {

  'use strict';

  return angular.module( 'nunc', [ articlesController.name ] )
  .config([ '$routeProvider', function ( $routeProvider ) {

    $routeProvider
      .when('/', {

        // templateUrl: 'views/main.html',
        controller: articlesController.name

      })
      .otherwise({

        redirectTo: '/'

      });

  }]);

});