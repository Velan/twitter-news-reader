
define([ 
  'angular'
  , 'socket'
  , 'angular.socket'
  , 'angular.sanitize'
  , 'angular.scroll' 
  ], function( angular, socket ) {
	
'use strict';

return angular.module('nunc.controllers', [ 'ngSanitize', 'infiniteScroll', 'btford.socket-io' ])
  .controller('ArticlesCtrl', function ( $scope, socket, $templateCache, $http ) {

    socket.forward( 'article', $scope );

    $scope.$on( 'socket:article', function( ev, article ) {

      $scope.articles.unshift( article );
      $scope.total += 1;
      $scope.offset += 1;

    });

    $scope.offset = 0;
    $scope.limit = 20;

    $scope.canLoad = true;

    $scope.method = 'GET';
    $scope.url = '/api/news';

    $scope.articles = [];

    $scope.fetch = function() {

      if( $scope.http ) {
        return;
      }

      // $scope.code = null;
      // $scope.response = null;

      $scope.http = $http({

        method: $scope.method,
        url: $scope.url + '?offset=' + $scope.offset + '&limit=' + $scope.limit,
        cache: $templateCache

      })
      .success(function( data, status ) {

        $scope.offset += $scope.limit;
        delete $scope.http;

        $scope.articles = $scope.articles.concat( data.articles );
        $scope.total = data.total;

        if( $scope.total < $scope.offset ) {

          $scope.canLoad = false;

        }
        // $scope.status = status;

      })
      .error(function() {

        delete $scope.http;

      });

    };

  });


});
