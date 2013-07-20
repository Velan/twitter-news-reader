/*global define */
define([
  'angular',
  'controllers/articles.controller'

], function (
    angular,
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