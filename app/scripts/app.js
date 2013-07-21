/*global define */
define([
  'angular',
  'controllers/articles.controller',
  'controllers/article.controller'

], function (
    angular,
    articlesController,
    articleController
  ) {

  'use strict';

  return angular.module( 'nunc', [ articlesController.name, articleController.name ] )
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