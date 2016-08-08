angular.module('pdLoading', [
        'pdSpinner',
        'pdOverlay'
    ])
    .factory('pdLoading', function($animate, $compile, $rootScope, pdOverlay) {

        var $spinner = angular.element('<pd-spinner></pd-spinner>');

        var show = function() {
            pdOverlay.show().then(function(){
                var $overlay = angular.element(document.querySelector('pd-overlayer'));
                var scope = $rootScope.$new();
                var $spinnerEl = $compile($spinner)(scope);
                return $animate.enter($spinner, $overlay);
            });
        };

        var hide = function() {
            return pdOverlay.hide();
        };

        return {
            show: show,
            hide: hide
        }
    });
