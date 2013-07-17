'use strict';

angular.module('nunc.webApp', [ 'ngSanitize' ])
  .controller('MainCtrl', function ( $scope, $http, $templateCache ) {

    console.log( $scope );

    $scope.method = 'GET';
    $scope.url = '/api/news';

    $scope.fetch = function() {

      $scope.code = null;
      $scope.response = null;

      $http({

        method: $scope.method,
        url: $scope.url,
        cache: $templateCache

      })
      .success(function( data, status ) {

        $scope.articles = data;
        $scope.status = status;

      })
      .error();

    };

  });
