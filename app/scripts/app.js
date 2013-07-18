'use strict';

angular.module('nunc.webApp', [ 'btford.socket-io' ])
  .run(function () {
    socket.forward('error');
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
