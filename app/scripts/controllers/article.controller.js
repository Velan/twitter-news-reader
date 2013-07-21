
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

    hammer( articleContent ).on( 'drag', function( event ) {

      articleContent.style.webkitTransform = 'translate( '+ Math.max( -60, Math.min( event.gesture.deltaX, 0 ) ) +'px )';

    });


  }]);

  return controller;

});
