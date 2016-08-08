'use strict';

angular.module('pdHeaderNav', [
    'ui.bootstrap.dropdown',
    'pdDrawerNav'
])
    .directive('pdHeaderNav', function($compile, $rootScope, Session) {
        return {
            restrict: 'EA',
            templateUrl: function (elem, attrs) {
                if (attrs.admin) {
                    return 'pd-header-nav/pd-admin-header-nav.html';
                }
                return 'pd-header-nav/pd-header-nav.html';
            },
            scope: {
                // object - the current user to populate nav items
                user: '=',
                // object - the config object that will build out links and labels
                config: '=',
                // object - the current app to compare feature flags against
                app: '='
            },
            link: function(scope) {
                if ( scope.user !== undefined ) {
                    scope.loggedIn = true;
                } else if ( scope.user === undefined ){
                    scope.loggedIn = false;
                } else if ( scope.user === null ) {
                    scope.loggedIn = false;
                }
                // Listen for a login event
                $rootScope.$on('Session:login', function(event, args) {
                    scope.loggedIn = true;
                    if ( args ) {
                        scope.user = args.currentUser;
                    }
                });

                // sets nav visibility based on app features and user logged in status
                setNavVisibility();

                function setNavVisibility () {
                    // different app configs during signup
                    if ( Session.currentUser ) {
                        scope.hideNav = false;
                        if ( Session.currentApp.features.user_signup.fields.insurance.required && !Session.currentUser.insurance ) {
                            scope.hideNav = true;
                        } else if ( Session.currentApp.require_identity_verification && !Session.currentUser.platform_identity_confirmed ) {
                            scope.hideNav = true;
                        }
                    }
                    // if there is no user, don't need to hide the nav
                    else {
                        scope.hideNav = false;
                    }
                }

                // listen for a logout event
                $rootScope.$on('Session:logout', function() {
                    scope.loggedIn = false;
                    scope.hideNav = false;
                });

                // listen for hide/show events for right side nav
                $rootScope.$on('pdHeaderNav:hideNav', function() {
                    scope.hideNav = true;
                });
                $rootScope.$on('pdHeaderNav:showNav', function() {
                    scope.hideNav = false;
                });
            },
            controller: function($scope) {
                // closes the drawer if its open
                $scope.closeDrawer = function() {
                    $scope.$broadcast('DrawerNav:close');
                };

                // closes the drawer if its open
                $scope.toggleDrawer = function() {
                    $scope.$broadcast('DrawerNav:toggle');
                };
            }
        };
    });
