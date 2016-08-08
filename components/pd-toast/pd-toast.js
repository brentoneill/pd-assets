'use strict';

/**
 * @title pdToast
 * @name pdToast
 * @module pdToast
 * @description
 *
 * This module provides support for iOS toast-like notifications. The module consists of a directive,
 * `pdToast` and a factory `pdToastFactory`. Its plug and play natures means that you can simply
 * include the factory in your favorite controller and trigger `toasts` directly on the controller
 * to notify the user of success/error messages, confirmation messages, or other notification needs.
 *
 */

angular.module('pdToast', [])
    .value('pdToastDefaults', {})
    /**
     * @ngdoc directive
     * @name pdToast.directive:pdToast
     * @restrict 'A'
     * @description
     *
     * This directive is used internally by the pdToastFactory and is should not be used
     * directly in any view. It is appended to the DOM using ngAnimate in the pdToastFactory
     *
     * @requires $interval
     * @requires pdToastFactory
     * @event on#click fires the removes the notification from the DOM but only if the tapToDismiss option
     *                 is set to true when defining the options for the notification in your controller.
     */
    .directive('pdToastr', function($interval, pdToastFactory) {
        return {
            restrict: 'EA',
            templateUrl: 'pd-toast/pd-toastr.html',
            replace: true,
            link: function(scope, el) {

                var timeout;

                // runs once when the toast is created in the factory
                scope.init = function() {
                    timeout = createTimeout(scope.options.timeout);
                };

                // creates the timeout for the individual toast notification
                function createTimeout(time) {
                    return $interval(function(){
                        pdToastFactory.removeToast(scope.toastId);
                    }, time, 1);
                }

                // clears the notification when clicked, should be configurable!
                el.on('click', function(){
                    if ( scope.options.tapToDismiss ) {
                        $interval.cancel(timeout);
                        pdToastFactory.removeToast(scope.toastId);
                    } else {
                        return;
                    }
                });
            }
        };
    })
    /**
     * @ngdoc service
     * @module pdToast
     * @name pdToast.service:pdToastFactory
     * @description
     *
     * The `pdToastFactory` is the service that makes up the meat of the `pdToast` module.
     * This factory is injectable in to any controller and allows for easy creation of toast-like notifiactions
     * within the controller of your choice for better UI success/error handling. With a host of configurable
     * options, take the `pdToastFactory` for a spin and see what it can do for you!
     *
     * Currently, the `pdToastFactory` exposes two public API methods, `createToast` and `removeToast`.
     *
     * @requires $q
     * @requires $animate
     * @requires $timeout
     * @requires $rootScope
     * @requires $compile
     *
     * @example
          <example module="pdToast">
            <file name="pd-toast-example.html">
                <div ng-controller="pdToastDemoCtrl">
                    <label class="form-label" for="title">Title</label>
                    <input class="form-control" type="text" name="title"
                            ng-model="options.title" placeholder="Title">
                    <br>

                    <label class="form-label" for="message">Message</label>
                    <input class="form-control" type="text" name="message"
                            ng-model="options.message" placeholder="Message">
                    <br>

                    <label class="form-label" for="type">Type</label>
                    <select class="form-control" name="type"
                            ng-model="options.type">
                        <option value="success">Success</option>
                        <option value="danger">Danger</option>
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                    </select>
                    <br>

                    <label class="form-label" for="timeout">Timeout</label>
                    <input  class="form-control" type="number" name="timeout"
                            ng-model="options.timeout">
                    <br>

                    <button class="btn btn-block btn-primary"
                            ng-click="createToast(options)">Create toast!</button>
                </div>
            </file>
            <file name="pdToastDemoCtrl.js">
                angular.module('pdToast')
                    .controller('pdToastDemoCtrl', function($scope, pdToastFactory) {

                        $scope.options = {
                            title: 'Toast',
                            message: 'What a brave little toaster!',
                            type: 'success',
                            timeout: 5000
                        };

                        $scope.createToast = function() {
                            pdToastFactory.createToast({
                                title: $scope.options.title,
                                message: $scope.options.message,
                                type: $scope.options.type,
                                timeout: $scope.options.timeout
                            }).then(function(result){
                                console.log('You created this Toast!');
                                console.log(result);
                            });
                        };

                    });
            </file>
          </example>
     */
    .factory('pdToastFactory', function($q, $animate, $timeout, $rootScope, $compile, pdToastDefaults) {

        // So we can keep track of all toasts we have created in our app
        // toasts = all toasts from beginning of app.run
        var toastContainer,
            toasts = [],
            containerDefer = $q.defer();

        // Setting up some defaults
        var defaults = {
            tapToDismiss: true,
            timeout: 5000,
            toastClass: 'toast',
            titleClass: 'toast-notification-title',
            messageClass: 'toast-notification-message',
            container: 'body'
        };

        defaults = angular.extend(defaults, pdToastDefaults);

        /**
        * @ngdoc method
        * @name pdToastFactory#createToast
        * @methodOf pdToast.service:pdToastFactory
        * @description
        *
        * Creates a `toast` notification with the options passed in via an object with your desired settings.
        * Returns a promise so that you can chain.
        *
        * @param {object} options An object that contains a list of options and settings for the toast notification you are about to receive.
        * @param {string} options.title The title of the toast notification. If not provided, will default to an empty string.
        * @param {string} options.message The message of the toast notification. If not provided, will default to an empty string.
        * @param {string} options.type A decorator for the toast notification. Affects background and font colors.
        *                      Accepted values are bootstrap decorator classes: `primary`, `success`, `info`, `danger`, `warning`
        * @param {number} options.timeout The length of time the toast notification should be visible on screen.
        *
        * @returns {promise} Returns a chainable promise using `$q`
        */
        function createToast (options) {
            var dfd = $q.defer();

            // set up some configs for a new notification using the defaults
            var newToast = angular.copy(defaults);

            // create a new scope
            newToast.scope = $rootScope.$new();

            // create a unique ID using UTC time
            var d = new Date();
            var newToastId = d.getTime();
            newToast.toastId = newToastId;

            // set these scope variables for the directive
            newToast.scope.toastClass = newToast.toastClass;
            newToast.scope.titleClass = newToast.titleClass;
            newToast.scope.messageClass = newToast.messageClass;
            newToast.scope.toastId = newToast.toastId;

            // overwrite some of those defaults
            // create new properties from options passed through the ctrl
            newToast.scope.options = {
                message: options.message || '',
                title: options.title || '',
                type: options.type.toLowerCase() || 'success',
                timeout: options.timeout || defaults.timeout,
                tapToDismiss: options.tapToDismiss || true
            };

            // create a the toastElement and assign it to the new toast
            newToast.el = _renderToastEl(newToast.scope);

            // create a scope so that we can compile the directive and inject it
            _renderOrGetContainerEl().then(function(){
                // using $animate to manipulate the dom
                $animate.enter(newToast.el, toastContainer).then(function() {
                    newToast.scope.init();
                });
                toasts.push(newToast);
                // return the toast we created for debugging purposes
                dfd.resolve(newToast);
            });

            return dfd.promise;
        }

        /**
        * @ngdoc method
        * @name pdToastFactory#removeToast
        * @methodOf pdToast.service:pdToastFactory
        * @description
        *
        * Removes the specified toast notification from the DOM and removes it from the array of current toasts.
        * Called internally by the `pdToast` directive but can be used to programatically remove toasts from the DOM.
        * Returns a promise so that you can chain.
        *
        * @param {number} toastId Should be the ID of the toast you want to remove
        * @returns {promise} Returns a chainable promise using `$q` and resolves with the
        *                    Toast element that is removed from the DOM.
        */
        function removeToast (toastId) {
            var dfd = $q.defer();

            // find the correct toast to remove
            var toastToRemove = _.find(toasts,  { toastId: toastId });

            // using $animate to manipulate the dom
            $animate.leave(toastToRemove.el).then(function(){
                toastToRemove.scope.$destroy();
                var idx = toasts.indexOf(toastToRemove);
                toasts.splice(idx, 1);
                dfd.resolve(toastToRemove);
            });

            return dfd.promise;
        }

        // renders a container element for the toast directives to sit in
        // returns a promise
        function _renderOrGetContainerEl (containerTarget) {
            // toastContainer already exists, no need to make another
            if ( toastContainer ) {
                return containerDefer.promise;
            }

            if ( !containerTarget ) {
                containerTarget = angular.element(document).find(defaults.container);
                toastContainer = angular.element('<div class="pd-toast-container"></div>');
            } else {
                containerTarget = angular.element(document).find(containerTarget);
                containerTarget.addClass('relative');
                // define what the toast el is gonna be
                toastContainer = angular.element('<div class="pd-toast-container"></div>');
            }

            // using $animate to manipulate the dom
            $animate.enter(toastContainer, containerTarget).then(function(){
                // return the element for debugging
                containerDefer.resolve(containerTarget);
            });

            return containerDefer.promise;
        }

        // renders the individual toastElement
        function _renderToastEl (scope) {
            // create the dom element that houses the directive
            var toastDomEl = angular.element('<div pd-toastr></div>');
            // returns the $compile function with the el and scope as arguments
            return $compile(toastDomEl)(scope);
        }

        // Public API methods
        return {
            createToast: createToast,
            removeToast: removeToast
        };
    });
