'use strict';
/**
 * @ngdoc overview
 * @name pdCheckboxesToList
 * @module pdCheckboxesToList
 * @description
 *
 *  # The pdCheckboxesToList module
 *  The `pdCheckboxesToList` module allows data to be presented in the UI as checkboxes
 *  but formatted in data as a list. It consists of a directive that handles adding and
 *  removing items from that list.
 *
 * The pdCheckboxesToList module of the following components:
 *
 * - {@link pdCheckboxesToList.directive:pdCheckboxesToList pdCheckboxesToList directive}
 *
 * @example
    <example module="pdCheckboxesToList">

        <file name="pd-checkboxes-to-list-example.html">
            <div pd-checkboxes-to-list
                 ng-model="users[$index].acl"
                 base-options="permissionsList"
                 name-suffix="{{user.first_name.toLowerCase() + '_' + user.last_name.toLowerCase() }}">
            </div>
        </file>

    </example>
 */
angular.module('pdCheckboxesToList', [])
    /**
     * @ngdoc service
     * @module pdCheckboxesToList
     * @name pdCheckboxesToList.directive:pdCheckboxesToList
     * @description
     *
     * The `pdCheckboxesToList` directive handles the transformation of data from booleans/checkboxes to
     * values stored in a list, as well as holding data for displaying more human-readable text in its template
     * for each of the values.
     *
     * The values required by the directive are as follows:
     *
     * ngModel: The model that holds the list to be changed
     * baseOptions: The list of default options available in the form of checkboxes (structure below)
     * nameSuffix: Should the directive be contained in an ng-repeat, each form element needs a unique
     * way to identify it in its name and ID. The name suffix is appended to the end of the name and ID
     * to accomplish this.
     *
     * An "option" contains the following:
     * option.id: the actual value stored to the list
     * option.val: whether the value is present in the list
     * option.title: user-friendly wording of the option
     * option.description: more detail about what the option is
     *
     *
     */
    .directive('pdCheckboxesToList', function(){
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'pd-checkboxes-to-list/pd-checkboxes-to-list.html',
            scope: {
                // a list of values built from values of selected checkboxes
                ngModel: '=',
                // list of data to build checkboxes
                baseOptions: '=',
                // because this directive contains form elements, the group needs a unique name
                // if it'll be in an ng-repeat
                nameSuffix: '@'
            },
            controller: function ($scope) {
                // options are updated specific to directive to reflect whether they've been selected
                $scope.options = angular.copy($scope.baseOptions);

                // adds an item to a list if it doesn't exist already
                // param {any} the value to be added to the list
                var addItem = function (item) {
                    if ($scope.ngModel.indexOf(item) !== -1) return;
                    $scope.ngModel.push(item);
                };

                // removes item from list if exists within the list
                // param {any} the value to be removed from the list
                var removeItem = function (item) {
                    if ($scope.ngModel.indexOf(item) === -1) return;
                    var idx = $scope.ngModel.indexOf(item);
                    $scope.ngModel.splice(idx);
                };

                // chooses the appropriate method depending on whether the checkbox has been
                // selected (on checked should be added, on unchecked should be removed)
                // param {boolean} whether the checkbox has been checked
                // param {any} the value to be manipulated in the list
                $scope.editItem = function (checkboxVal, item) {
                    if (checkboxVal) {
                        addItem(item);
                    } else {
                        removeItem(item);
                    }
                };
            }
        }
    });
