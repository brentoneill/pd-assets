'use strict';

angular.module('pdApp')
    .controller('AppCtrl', function (session, $rootScope, $scope, $http, $log, pdConfirmFactory) {

        // handle session reloading
        var sessionReloaded = function (event, s) {
            $log.debug('AppCtrl:session reloaded, updating scope, session:', s);
            $scope.currentUser = s.currentUser;
            $scope.currentApp = s.currentApp;

            // set page title for app
            $rootScope.pageTitle = $scope.currentApp.name;
            $rootScope.favicon = $scope.currentApp.theme.favicon || 'assets/images/favicon.ico';
        };

        // listen for the session:reloaded event
        $rootScope.$on('Session:reloaded', sessionReloaded);

        // manually reload session
        sessionReloaded(null, session);
    });
