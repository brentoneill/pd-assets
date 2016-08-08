'use strict';

angular.module('pdAdminApp', [
        'ui.router',
        'templates.admin',
        'templates.pdassets',
        'pdApp',
        'pdColorPicker',
        'pdForm',
        'pdDrawerNav',
        'pdHeaderNav',
        'pdToast',
        'pdLoader',
        'pdSpinner',
        'pdUtils',
        'pdSelect',
        'pdFacebook',
        'pdConfirm',
        'pdWorkflow',
        'pdTiles',
        'pdPokit',
        'pdInterface',
        'pdResourceGrid',
        'pdImageCrop',
        'pdActivityCard'
    ])
    // set defaults for the toast service
    .value('pdToastDefaults', {
        container: '#admin-app-canvas',
        timeout: 5000,
        tapToDismiss: true
    })
    // add lodash
    .constant('_', window._)
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/404');
        // add an http interceptor to handle $api requests
        window.PD_BASE_PATH = '/marketplace/api/v4';

        $stateProvider
            .state('app.admin', {
                abstract: true,
                templateUrl: 'pd-admin-app/views/index.html',
                controller: 'pdAdminAppCtrl'
            });
    });
