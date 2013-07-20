
require.config({

  paths: {
    // jquery: '../bower_components/jquery/jquery'
    angular: '../bower_components/angular/angular',
    io: '../lib/socket.io-client/socket.io',
    'angular.sanitize': '../bower_components/angular-sanitize/angular-sanitize',
    'angular.scroll': '../lib/angular-infinite-scroll/src/infinite-scroll',
    'angular.socket': '../bower_components/angular-socket-io/socket'

  },
  shim: {

    'angular': {
      exports: 'angular'
    },
    'angular.sanitize': {
      deps: [ 'angular' ]
    },
    'angular.scroll': {
      deps: [ 'angular' ]
    },
    'angular.socket': {
      deps: [ 'angular', 'socket' ]
    }

  },
  priority: [

    'angular'

  ]

});

require([
  'angular',
  'app'

], function ( angular, app ) {

  'use strict';

  angular.bootstrap( document.body, [ app.name ] );

});
