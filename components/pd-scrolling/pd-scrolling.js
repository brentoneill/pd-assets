'use strict';

angular.module('pdScrolling', [])
    .factory('pdScrollFactory', function($rootScope, $timeout, $window) {

        // create a new scope to listen for state change events on
        var scope = $rootScope.$new();
        var $navbar = angular.element(document.querySelector('.navbar-fixed-top'))[0];

        var factory = {
            scrollToPosition: {},
            scrollToState: '',
            offset: 0,
            resetCount: 0,
            // resets the pdScrollFactory state - called on user logout
            reset: function() {
                var self = this;
                self.scrollToPosition = {};
                self.scrollToState = {};
                self.scrollToStateParams = {};
                self.resetCount = 0;
            },
            // sets the scroll to position - called by pdSavePosition directive
            setScrollToPosition: function(x, y) {
                var self = this;
                self.scrollToPosition.x = x;
                self.scrollToPosition.y = y;
            },
            // sets the state where we should be scrolling on - called by pdSavePosition directive
            setScrollToState: function(state) {
                var self = this;
                self.scrollToState = state;
            },
            // sets the offset based off the argument or finds the height of the navbar and multiplies by 3
            setOffset: function(offset) {
                if ( $navbar ) {
                    return $navbar.clientHeight * 3;
                } else if ( offset ) {
                    return offset;
                } else {
                    return 150;
                }
            },
            // defacto scroll to top function
            scrollTo: function(x, y) {
                $window.scrollTo(x,y);
            }
        };

        factory.offset = factory.setOffset();

        // custom for search
        scope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
            if ( fromState.name.indexOf('search') > -1 ) {
                factory.scrollToStateParams = fromParams;
            }
        });

        scope.$on('$stateChangeSuccess', function(e, toState) {
            if ( toState.name.indexOf(factory.scrollToState.name) < 0 && factory.resetCount > 4 ) {
                console.log('reseting cause of count too high');
                factory.reset();
            }
            if ( toState.name === factory.scrollToState.name ) {
                return $timeout(function(){
                    factory.scrollTo(0, factory.scrollToPosition.y - factory.offset);
                    factory.reset();
                }, 1000);
            } else {
                return;
            }

        });

        scope.$on('Session:logout', function() {
            factory.reset();
        });

        return factory;
    })
    .directive('pdSavePosition', function(pdScrollFactory, $state) {
        return {
            restrict: 'A',
            link: function(scope, element) {
                element.on('click', function(e) {
                    pdScrollFactory.setScrollToPosition(e.pageX, e.pageY);
                    pdScrollFactory.setScrollToState($state.$current);
                });
            }
        };
    });
