
define([
  'angular',
  'hammer'
], function( angular, hammer ) {

  'use strict';

  var controller = angular.module( 'article.controller', [])
  .controller('articleCtrl', [ '$scope', '$element', function ( $scope, $element ) {

    if( ! Modernizr.touch ) {

      return;

    }

    var articleContent = $element[ 0 ].querySelector( '.ar-main' );

    hammer( articleContent, {

      'swipe_velocity': 0.5

    }).on( 'swipeleft swiperight dragleft dragright', function( event ) {

      var style = 'swipeleft' === event.type ? -60 : 0;

      articleContent.style[ Modernizr.prefixed( 'transform' ) ] = 'translate( '+ style +'px )';

      event.gesture.preventDefault();

    });

  }]);

  return controller;

});
