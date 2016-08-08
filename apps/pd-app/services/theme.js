'use strict';

angular.module('pdServices')
    .factory('pdThemeFactory', function (Session) {
        return {
            themeFromConfig: function () {
                return Session;
            }
        };
    });
