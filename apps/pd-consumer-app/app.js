'use strict';

angular.module('pdConsumerApp', [
        'ui.router',
        'templates.consumer',
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
        'pdLoading',
        'pdFacebook',
        'pdConfirm',
        'pdWorkflow',
        'pdTiles',
        'pdPokit',
        'pdResourceGrid',
        'pdImageCrop',
        'pdActivityCard',
        'pdScrolling',
        'pdInsuranceWidgets'
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
            .state('app.consumer', {
                abstract: true,
                templateUrl: 'pd-consumer-app/views/layout.html',
                controller: 'pdConsumerAppCtrl',
                resolve: {
                    specialties: function($http) {
                        return $http.get('$api/specialties/all');
                    }
                }
            });
    });
