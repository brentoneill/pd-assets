'use strict';

angular.module('pdServices')
    .factory('Session', function ($q, $rootScope, $http, $timeout, $log, $interval, $location, $state) {
        var s = {
            // set the oauth2 entities
            currentApp: null,
            currentUser: null,
            lastAction: new Date().getTime(),
            actionInterval: null,
            // gets the session and returns the updated session object
            reload: function () {
                var self = this,
                    deferred = $q.defer();
                $log.debug('Session:reloading session');
                // get the current oauth token's context (currentApp, currentUser)
                $http.get('$api/oauth2/context')
                    .then(function (response) {
                        // get the api JSON response
                        var res = response.data;
                        self.currentUser = res.data.current_user;
                        if (self.currentUser) {
                            self.currentUser.current_session = res.data.current_session;
                        }
                        self.currentApp = res.data.current_app;
                        // fire a root level event to update the entities attached to $scope
                        $rootScope.$emit('Session:reloaded', self);
                        deferred.resolve(self);
                    }, deferred.reject);
                return deferred.promise;
            },
            checkAuthenticated: function() {
                var self = this,
                    deferred = $q.defer();
                $log.debug('Session:checking authenticated status');
                // get the current oauth token's context (currentApp, currentUser)
                $http.get('$api/oauth2/context')
                    .then(function (response) {
                        // get the api JSON response
                        var res = response.data;
                        self.currentUser = res.data.current_user;
                        if (self.currentUser) {
                            deferred.resolve(true);
                        } else {
                            deferred.reject(false);
                        }
                    }, deferred.reject);
                return deferred.promise;
            },
            // setup an interval that will log a user out if they are inactive
            startActionInterval: function () {
                // TODO: load from config, start w/ 10 min
                var self = this,
                    LAST_ACTION_INTERVAL = 10 * 60 * 100000;
                self.actionInterval = $interval(function () {
                    if (self.currentUser) {
                        var currentTime = new Date().getTime();
                        $log.debug('Session:checking user activity:' + currentTime + ':' + self.lastAction);
                        if (currentTime < self.lastAction + LAST_ACTION_INTERVAL) {
                            $log.debug('Session:user inactive, logging out');
                            $state.go('app.consumer.auth.logout');
                            $location.path('/logout');
                        }
                    }
                }, LAST_ACTION_INTERVAL);
            },
            // cancel the action interval
            stopActionInterval: function () {
                if (this.actionInterval) {
                    $log.debug('Session:cancelling the action interval');
                    $interval.cancel(this.actionInterval);
                }
            }
        };

        // watch state changes to update the lastAction property
        $rootScope.$on('$stateChangeStart', function () {
            $log.debug('Session:updating lastAction to:', new Date().getTime());
            s.lastAction = new Date().getTime();
        });
        // return the Session service
        return s;
    });
