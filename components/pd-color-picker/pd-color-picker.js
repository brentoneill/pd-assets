'use strict';

/**
 * @ngdoc overview
 * @name pdColorPicker
 *
 * @description
 * Directives for cropping and uploading image files.
 */

angular.module('pdColorPicker', [
        'ngFileUpload'
    ])
    /**
     * @ngdoc directive
     * @name pdColorPicker
     *
     * @description
     * Adds an image uploader and cropper, and allows upload after image has been prepared.
     * Attributes/scope variables:
     *   model: ___
     *
     * @example
     * <div pd-color-picker colorChoices="['#f00', '#0f0', '#00f', '#ff0', '#0ff']"></div>
     */
    .directive('pdColorPicker', function () {
        return {
            templateUrl: 'pd-color-picker/pd-color-picker.html',
            scope: {
                colorChoices: '=',
                currentColor: '='
            },
            controller: function ($scope) {
                // change text color so color selection is always visible
                $scope.textColor = '#000000';

                var getTextColor = function (color) {
                    var r = parseInt(color.substr(1, 2), 16);
                    var g = parseInt(color.substr(3, 2), 16);
                    var b = parseInt(color.substr(5, 2), 16);
                    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                    return yiq >= 128 ? '#000000' : '#ffffff';
                };

                $scope.selectColor = function (color) {
                    $scope.currentColor = color;
                    $scope.textColor = getTextColor(color);
                };

                $scope.$on('colorpicker-selected', function (e, args) {
                    $scope.textColor = getTextColor(args.value);
                });
            }
        }
    })
    .directive('pdLogoColors', function () {
        return {
            templateUrl: 'pd-color-picker/pd-logo-colors.html',
            scope: {
                logoColors: '='
            },
            controller: function ($scope) {

            }
        }
    });
