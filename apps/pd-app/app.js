'use strict';

angular.module('pdApp', [
        // 3rd party plugins
        'ngAnimate',
        'ngMessages',
        'ui.router',
        'ui.mask',
        'ui.router.grant',
        'ui.bootstrap',
        // 'angular-loading-bar',
        'sticky',
        // core services used in all pd apps
        'pdServices',
        // include some constants
        'pdValues'
    ])
    .config(function ($stateProvider, $urlRouterProvider, $logProvider, $httpProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/404');
        $stateProvider
            .state('app', {
                abstract: true,
                controller: 'AppCtrl',
                templateUrl: 'pd-app/views/index.html',
                resolve: {
                    session: function (Session) {
                        return Session.reload();
                    }
                }
            })
            .state('app.404', {
                url: '/404',
                templateUrl: 'pd-app/views/404.html'
            });

        // setup log level
        $logProvider.debugEnabled(true);

        // remove debugging on compiles for better performance
        // turns off angular adding ng-scope, ng-isolate-scope classes
        //// Explanation - https://medium.com/@hackupstate/improving-angular-performance-with-1-line-of-code-a1fb814a6476#.n9t5yuxwa
        $compileProvider.debugInfoEnabled(false);

        // batch XHR requests to prevent triggering new $digest on each
        $httpProvider.useApplyAsync(true);

        // setup the http provider to allow CORS requests
        $httpProvider.defaults.withCredentials = true;

        // add an http interceptor to force a logout on a 401 or 400
        $httpProvider.interceptors.push(function ($q, $location) {
            return {
                responseError: function (rejection) {
                    if (rejection.status === 401 || rejection.status === 400) {
                        $location.path('/logout');
                        return rejection;
                    }
                    return $q.reject(rejection);
                }
            };
        });
        // add an http interceptor to handle $api requests
        window.PD_BASE_PATH = '/marketplace/api/v4';
        // add an http interceptor to handle $api requests
        $httpProvider.interceptors.push(function ($q, $log) {
            var hostname = location.host.replace(/\:3000/, ':5001');

            var BASE_URL = location.protocol + '//' + hostname + window.PD_BASE_PATH;

            return {
                request: function (config) {
                    // intercept requests that begin with `$api`
                    if (config.url.indexOf('$api') === 0) {
                        // prepend the api base url
                        config.url = BASE_URL + config.url.replace('$api', '');
                        $log.debug('API:starting api request for ' + config.method + ':' + config.url);
                    }
                    return config;
                },
                response: function (response) {
                    if (response.config.url.indexOf(BASE_URL) === 0) {
                        // provide debugging on success
                        $log.debug('API:request successful for ' + response.config.method + ':' +
                            response.config.url + ' response:', response);
                    }
                    return response;
                },
                responseError: function (rejection) {
                    if (rejection.config.url.indexOf(BASE_URL) === 0) {
                        // provide debugging on error
                        $log.debug('API:request failed for ' + rejection.config.method + ':' +
                            rejection.config.url + ' rejection:', rejection);
                    }
                    return $q.reject(rejection);
                }
            };
        });
    })
    .run(function ($rootScope, $timeout, grant, Session) {
        $rootScope.$on('Session:reloaded', function(evt, s) {
            if ( !grant.hasTest('authenticated') ) {
                grant.addTest('authenticated', function() {
                    if ( s.currentApp.require_login ) {
                        return Session.checkAuthenticated();
                    } else {
                        return true;
                    }
                });
            }
        });

        // override ui-router scrolling
        // add google analytics tracking
        $rootScope.$on('$stateChangeSuccess', function () {
            window.scrollTo(0, 0);
            // log the google analytics event
            //   window.ga('send', 'pageview', {
            //     page: $location.url()
            //   });
        });

        // handles initial page loading animations
        $timeout(function () {
            $('#app-container').css('opacity', 1);
            $('#home-loading').css('opacity', 0);
        }, 1000);

        $timeout(function () {
            $('#home-loading').remove();
        }, 1100);
    });
