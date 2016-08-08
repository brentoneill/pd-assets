angular.module('pdOverlay', [])
    .directive('pdOverlayer', function() {
        return {
            priority: 1,
            restrict: 'E',
            template: '<pd-overlayer class="pd-overlayer"></pd-overlayer>'
        }
    })
    .factory('pdOverlay', function($animate) {

        var $body = angular.element(document).find('body'),
            $overlay = angular.element('<pd-overlayer class="pd-overlayer"></pd-overlayer>'),
            hasContainer;

        var hide = function() {
            return $animate.leave($overlay).then(function() {
                if ( hasContainer ) {
                    $container.removeAttr('style');
                } else {
                    $body.removeAttr('style');
                }
            });
        };

        var show = function(container) {
            if ( container ) {
                hasContainer = true;
                var $container = angular.element(document.querySelector(container))
                $container.css('position', 'relative');
                return $animate.enter($overlay, $container)
            } else {
                $body.css('position', 'relative');
                return $animate.enter($overlay, $body);
            }
        };

        return {
            show: show,
            hide: hide
        }

    });
