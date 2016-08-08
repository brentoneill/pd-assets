'use strict';

angular.module('pdBusinessApp')
    .controller('pdBusinessAppCtrl', function (business, providers, specialties, session, NavBuilder, pdToastFactory, $scope, $rootScope, $stateParams, $location, $http, $state) {
        $scope.currentBusiness = business.data.data;
        $scope.currentBusiness.providers = providers.data.data;
        $scope.specialties = specialties.data.data;

        // handle redirects if user needs to login after page change
        var authExemptStates = [
            'app.consumer.home', 'app.404', 'app.consumer.auth.signup.profile', 'app.consumer.auth.login', 'app.consumer.auth.logout',
            'app.consumer.providers.directory', 'app.consumer.contact', 'app.consumer.support.articles'
        ];

        // handle session reloading
        var sessionReloaded = function (event, s) {
            var loggedIn = s.currentUser ? true : false;
            $scope.footerConfig = NavBuilder.getFooterNav(s.currentApp);
            $scope.headerConfig = NavBuilder.getHeaderNav('business', s.currentApp, loggedIn);
            $scope.headerConfig.dropdownItems = NavBuilder.getDropdownNav();
            $scope.drawerConfig = NavBuilder.getDrawerNav(s.currentApp, loggedIn);
        };

        // listen for the session:reloaded event
        var sessionReloadListener = $rootScope.$on('Session:reloaded', sessionReloaded);

        // reload session by default and force login check
        sessionReloaded(null, session);

        // destroy the Session reload and state change listeners on $scope.$destroy
        $scope.$on('$destroy', function() {
            sessionReloadListener();
        });
    });
