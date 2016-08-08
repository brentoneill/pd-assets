'use strict';

angular.module('pdAdminApp')
    .controller('pdAdminAppCtrl', function ($scope, $rootScope, $log, $state, session, $http, pdToastFactory) {

        // handle redirects if user needs to login after page change
        var authExemptStates = [
            'app.admin.login', 'app.404'
        ];

        // take user to login page if in an app/state that requires it
        var redirectToLogin = function (e, toState) {
            // if not currentUser and path is not in state exempt from auth
            if (!session.currentUser && (authExemptStates.indexOf(toState.name) === -1 && toState.name.indexOf('app.support') === -1)) {
                $state.go('app.admin.auth.login');
                pdToastFactory.createToast({
                    title: 'Login Required',
                    message: 'Login to access advanced features of this app.',
                    type: 'info'
                });
            }
        };

        // handle session reloading
        var sessionReloaded = function (event, s) {
            // setup app login config
            if ($scope.currentApp.require_login) {
                // add listener to redirect on state change
                $rootScope.$on('$stateChangeStart', function (e, toState) {
                    redirectToLogin(e, toState);
                });
            }
        };

        // listen for the session:reloaded event
        $rootScope.$on('Session:reloaded', sessionReloaded);

        // force session reload/auth check
        sessionReloaded(null, session);
        redirectToLogin(null, $state.$current);

        // get current user's ACL information, dereferenced
        if ($scope.currentUser) {
            $http.get('$api/users/' + $scope.currentUser._uuid + '/acl')
                .success(function (res) {
                    $scope.currentUser.acl = res.data;

                    // filter ACL for organizations
                    $scope.currentUser.organizations = _.filter(res.data, {'_type': 'Organization'});
                    // filter ACL for apps
                    $scope.currentUser.apps = _.filter(res.data, {'_type': 'App'});
                })
                .error(function (res) {
                    $log.debug('Could not populate user\'s ACL');
                });
        }
    });
