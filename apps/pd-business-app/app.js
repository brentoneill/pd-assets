'use strict';

angular.module('pdBusinessApp', [
        'ui.router',
        'templates.business',
        'templates.pdassets',
        'pdApp',
        'pdForm',
        'pdDrawerNav',
        'pdHeaderNav',
        'pdToast',
        'pdLoader',
        'pdSpinner',
        'pdUtils',
        'pdSelect',
        'pdConfirm',
        'pdTiles',
        'pdInterface',
        'pdResourceGrid',
        'pdImageCrop',
        'pdActivityCard'
    ])
    // set defaults for the toast service
    .value('pdToastDefaults', {
        container: '#plmp-app-canvas',
        timeout: 5000,
        tapToDismiss: true
    })
    // add lodash
    .constant('_', window._)
    .config(function ($stateProvider) {
        $stateProvider
            .state('app.business', {
                url: '/business/:slug',
                abstract: true,
                templateUrl: 'pd-business-app/views/layout.html',
                controller: 'pdBusinessAppCtrl',
                resolve: {
                    business: function ($stateParams, $http, $rootScope) {
                        $rootScope.mainLoaderPromise = $http.get('$api/businesses/' + $stateParams.slug);
                        return $rootScope.mainLoaderPromise;
                    },
                    specialties: function ($http, $rootScope) {
                        $rootScope.mainLoaderPromise = $http.get('$api/specialties/all');
                        return $rootScope.mainLoaderPromise;
                    },
                    providers: function($stateParams, $http, $rootScope) {
                        $rootScope.mainLoaderPromise = $http.get('$api/businesses/' + $stateParams.slug + '/providers');
                        return $rootScope.mainLoaderPromise;
                    }
                }
            });
    });
