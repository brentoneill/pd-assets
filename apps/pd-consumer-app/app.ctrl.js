'use strict';

angular.module('pdConsumerApp')
    .controller('pdConsumerAppCtrl', function (specialties, $scope, $rootScope, $state, $timeout, NavBuilder, session, pdToastFactory, pdConfirmFactory) {
        $scope.specialties = specialties.data.data;

        // handle session reloading
        var sessionReloaded = function (event, s) {
            var loggedIn = s.currentUser ? true : false;
            $scope.headerConfig = NavBuilder.getHeaderNav('consumer', s.currentApp, loggedIn);
            $scope.headerConfig.dropdownItems = NavBuilder.getDropdownNav();
            $scope.drawerConfig = NavBuilder.getDrawerNav(s.currentApp, loggedIn);
            $scope.footerConfig = NavBuilder.getFooterNav(s.currentApp);
        };

        // listen for the session:reloaded event
        var sessionReloadListener = $rootScope.$on('Session:reloaded', sessionReloaded);

        // force session reload/auth check
        sessionReloaded(null, session);

        // destroy rootSCope listeners
        $scope.$on('$destroy', function() {
            sessionReloadListener();
        });

        // toggles the WFHud - triggered click 'info' icon in scheduling workflow
        $scope.toggleWFHud = function () {
            $scope.$broadcast('toggleWFHud');
        };

        if ( $scope.currentUser ) {

            if ( !$scope.currentUser.insurance && $scope.currentApp.features.user_signup.fields.insurance.required ) {
                pdConfirmFactory.createConfirm({
                    title: 'Sign Up process incomplete',
                    content: 'We have detected that you have an incomplete Sign Up in progress from a previous session. Click below to continue where you left off and complete the Sign Up process.',
                    hideCancelBtn: true,
                    hideCloseBtn: true,
                    confirmBtnText: 'Complete Sign Up',
                    onConfirm: function() {
                        $state.go('app.consumer.auth.signup.insurance');
                    }
                });
            } else if ( $scope.currentUser.insurance && $scope.currentApp.require_identity_verification && !$scope.currentUser.platform_identity_confirmed ) {
                pdConfirmFactory.createConfirm({
                    title: 'Sign Up process incomplete',
                    content: 'We have detected that you have an incomplete Sign Up in progress from a previous session. Click below to continue where you left off and complete the Sign Up process.',
                    hideCancelBtn: true,
                    hideCloseBtn: true,
                    confirmBtnText: 'Complete Sign Up',
                    onConfirm: function() {
                        $state.go('app.consumer.auth.signup.identity');
                    }
                });
            }
        }

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            if ( error.test === 'authenticated' && error.stateTo === 'app.consumer.auth.login' ) {
                pdToastFactory.createToast({
                    title: 'Login Required',
                    message: 'You must be logged in to use this feature.',
                    type: 'info'
                });
            }
        });

    });
