angular.module('infiniteScroll', [])
    .directive('infiniteScroll', function ( $window ) {
        return {
            link:function (scope, element, attrs) {
                var offset = parseInt(attrs.threshold) || 0;
                // var e = element[0];

                angular.element( window ).bind('scroll', function () {

                    if (scope.canLoad && document.documentElement.offsetHeight <= window.innerHeight + window.scrollY + offset) {
                        scope.$apply(attrs.infiniteScroll);
                    }
                });
            }
        }
    })