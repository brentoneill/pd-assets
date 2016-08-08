'use strict';

/**
 * @ngdoc overview
 * @name pdSpinner
 * @module pdSpinner
 * @description
 *
 *  # The pdSpinner module
 *  The `pdSpinner` is a directive that can be used to insert a variety of spinner-like
 *  animations that are aninmated via css. Acceptable values for class are: `pd-spinner`,
 *  `pd-dots`, `pd-spinner-dots`. Defaults to `pd-spinner` if `spinnerClass` is not defined.
 *
 *  The directive is used across many of the modules in pdAssets including:
 *  - {@link pdLoader pdLoader}
 *  - {@link pdForm.directive:pdSubmitButton pdSubmitButton}
 *
 * @example
      <example module="pdSpinner">

        <file name="pd-spinner-example.html">
            <div class="row" ng-controller="pdSpinnerDemoCtrl">
                <div class="col-xs-6 col-xs-offset-3">
                    <div class="form-group">
                        <label>Choose spinner class</label>
                        <select class="form-control" ng-model="class">
                            <option ng-repeat="c in classes" value="{{c}}">{{c}}</option>
                        </select>
                    </div>
                    <div class="panel relative" style="min-height: 100px">
                        <pd-spinner spinner-class="class"></pd-spinner>
                    </div>
                </div>
            </div>
        </file>

        <file name="pdSpinnerDemoCtrl.js">
            angular.module('pdSpinner')
                .controller('pdSpinnerDemoCtrl', function($scope) {

                    $scope.classes = [
                        'pd-spinner',
                        'pd-dots',
                        'pd-spinner-dots',
                    ];

                    $scope.class = $scope.classes[0];
                });
        </file>

      </example>
 */

angular.module('pdSpinner', [])
    .directive('pdSpinner', function() {
        return {
            restrict: 'EA',
            replace: false,
            templateUrl: 'pd-spinner/pd-spinner.html',
            scope: {
                spinnerClass: '=?'
            },
            link: function(scope, el, attrs) {
                if ( !scope.spinnerClass ) {
                    scope.spinnerClass = 'pd-spinner';
                }
            }
        }
    })
    .directive('pdSpinnerButton', function() {
        return {
            restrict: 'A',
            replace: false,
            link: function(scope, el, attrs) {
                var spinnerMarkup = '<div class="pd-spinner"></div>',
                    spinnerEl = angular.element(spinnerMarkup),
                    text = el.context.innerHTML,
                    buttonHeight, buttonWidth;

                el.addClass('pd-spinner-button');
                
                el.on('click', function() {
                    buttonHeight = el[0].offsetHeight;
                    buttonWidth = el[0].offsetWidth;
                    el.css('width', buttonWidth);
                    el.css('height', buttonHeight);
                    el.text('');
                    el.attr('disabled', true);
                    el.append(spinnerEl);
                })
            }
        }
    })
