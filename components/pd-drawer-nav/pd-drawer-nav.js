'use strict';

angular.module('pdDrawerNav', [])
    .directive('pdDrawerNavMenu', function ($timeout, $rootScope, $state, $document, $window) {
        return {
            restrict: 'EA',
            templateUrl: 'pd-drawer-nav/pd-drawer-nav-menu.html',
            scope: {
                // boolean - determines whether or not drawer should be animated
                animation: '=animation',
                // boolean - the config that sets the context for the menu
                drawerConfig: '=drawerConfig',
                // boolean - config that sets the context for the footer of the menu
                footerConfig: '=footerConfig',
                // boolean - should the footer collapse into the drawer
                collapseFooter: '=collapseFooter',
                // DOM selector - DOM selector that the footer insides if the collapseFooter === true
                footerContainer: '=footerContainer',
                // object - user that hydrates the template
                user: '=user',
                // object - app othat hydrates the template
                app: '=app'
            },
            link: function (scope, el) {

                var menuOpen = false;

                // cache some variables for later...
                var $drawerWrapperEl = el.parent(),
                    $siteWrapperEl = angular.element('.site-wrapper'),
                    $bodyEl = angular.element(document).find('body');

                // toggles the drawer by toggling class on the .drawer-wrapper
                // and the .site-wrapper
                scope.toggleDrawer = function() {
                    menuOpen = !menuOpen;
                    $drawerWrapperEl.toggleClass('drawer-open');
                    $siteWrapperEl.toggleClass('drawer-open');
                    // $bodyEl.toggleClass('no-scroll');
                };

                scope.closeDrawer = function () {
                    menuOpen = false;
                    $drawerWrapperEl.removeClass('drawer-open');
                    $siteWrapperEl.removeClass('drawer-open');
                    // $bodyEl.removeClass('no-scroll');
                };

                scope.openDrawer = function () {
                    menuOpen = true;
                    $drawerWrapperEl.addClass('drawer-open');
                    $siteWrapperEl.addClass('drawer-open');
                    // $bodyEl.addClass('no-scroll');
                };

                // triggered on logout button click
                scope.logout = function() {
                    scope.closeDrawer();
                    $state.transitionTo('app.consumer.auth.logout');
                };

                // triggered by clicking on nav toggle
                scope.$on('DrawerNav:toggle', function () {
                    scope.toggleDrawer();
                });

                scope.$on('DrawerNav:close', function () {
                    scope.closeDrawer();
                });

                scope.$on('DrawerNav:open', function() {
                    scope.openDrawer();
                });

                window.onresize = function() {
                    if ( window.innerWidth >= 768 && menuOpen ) {
                        scope.closeDrawer();
                    }
                };
            }
        };
    })
    .directive('pdDrawerNavToggle', function ($rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'pd-drawer-nav/pd-drawer-nav-toggle.html',
            scope: {
                user: '='
            },
            link: function (scope, el) {

                // handles the toggle button click
                el.on('click', function (e) {
                    e.preventDefault();
                    $rootScope.$broadcast('DrawerNav:toggle');
                });

            }
        };
    });
