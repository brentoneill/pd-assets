'use strict';

/**
 * @ngdoc overview
 * @name pdLoader
 * @module pdLoader
 * @description
 *
 *  # The pdLoader module
 *  The `pdLoader` module serves as a loading indicator for any promisified thing.
 *  It can be used to wait on `$http` requests or other async operations that return a promise.
 *  The `pdLoader` directive is inserted in to the view template and given a promise to watch.
 *  While the promise is active, the loader is shown and it is hidden when the promise resolves.
 *
 *  The directive is used across many of the modules in pdAssets including:
 *  - {@link pdActivityCard pdActivityCard}
 *
 *  - {@link pdResourceGrid pdResourceGrid}
 *
 *  - {@link pdTiles pdTiles}
 *
 * The pdLoader module consists of the following components:
 *
 * - {@link pdLoader.directive:pdLoader pdLoader directive}
 *
 * - {@link pdLoader.factory:_pdLoaderTrackerFactory _pdLoaderTrackerFactory factory}
 *
 * @example
      <example module="pdLoader">

        <file name="pd-loader-example.html">
            <div class="row" ng-controller="pdLoaderDemoCtrl">
                <div class="col-xs-6 col-xs-offset-3 text-center">
                    <button class="btn btn-primary btn-lg mbl" ng-click="showLoader()">
                        Show loader!
                    </button>
                    <div class="panel panel-default">
                        <div class="panel-body relative">
                            <div pd-loader="{ promise: myPromise, minDuration: 100, delay: 100, message: 'Stop, collaborate, and listen!', templateUrl: 'pd-loader/pd-loader-spinner.html'}"></div>
                            <h1>Some text to cover...</h1>
                            <h4 ng-show="showText">Some results from your promise</h4>
                        </div>
                    </div>
                </div>
            </div>
        </file>

        <file name="pdLoaderDemoCtrl.js">
            angular.module('pdLoader')
                .controller('pdLoaderDemoCtrl', function($scope, $q, $timeout) {

                    $scope.showText = false;

                    $scope.showLoader = function() {
                        $scope.showText = false;
                        $scope.myPromise = $scope.promiseFunction();
                    };

                    $scope.promiseFunction = function () {
                        var dfd = $q.defer();

                        $timeout(function() {
                            $scope.showText = true;
                            dfd.resolve('done!');
                        }, 5000);

                        return dfd.promise;
                    };
                });
        </file>

      </example>
 */

angular.module('pdLoader', [
        'pdSpinner'
    ])
    .value('pdLoaderDefaults', {})
    /**
     * @ngdoc service
     * @module pdLoader
     * @name pdLoader.factory:_pdLoaderTrackerFactory
     * @description
     *
     * A factory service that is used inside the `pdLoader` directive to track options set on the directive
     * and handles hiding and showing of the loading indicator template.
     *
     * @requires $q
     * @requires $timeout
     */
    .factory('_pdLoaderTrackerFactory', function ($timeout, $q) {

        return function () {

            var tracker = {};
            tracker.promises = [];
            tracker.delayPromise = null;
            tracker.durationPromise = null;
            tracker.delayJustFinished = false;

            tracker.reset = function (options) {
                tracker.minDuration = options.minDuration;

                tracker.promises = [];
                angular.forEach(options.promises, function (p) {
                    if (!p || p.$pdLoaderFulfilled) {
                        return;
                    }
                    addPromiseLikeThing(p);
                });

                if (tracker.promises.length === 0) {
                    //if we have no promises then dont do the delay or duration stuff
                    return;
                }

                tracker.delayJustFinished = false;
                if (options.delay) {
                    tracker.delayPromise = $timeout(function () {
                        tracker.delayPromise = null;
                        tracker.delayJustFinished = true;
                    }, parseInt(options.delay, 10));
                }
                if (options.minDuration) {
                    tracker.durationPromise = $timeout(function () {
                        tracker.durationPromise = null;
                    }, parseInt(options.minDuration, 10) + (options.delay ? parseInt(options.delay, 10) : 0));
                }
            };

            tracker.isPromise = function (promiseThing) {
                var then = promiseThing && (promiseThing.then || promiseThing.$then ||
                    (promiseThing.$promise && promiseThing.$promise.then));

                return typeof then !== 'undefined';
            };

            tracker.callThen = function (promiseThing, success, error) {
                var promise;
                if (promiseThing.then || promiseThing.$then) {
                    promise = promiseThing;
                } else if (promiseThing.$promise) {
                    promise = promiseThing.$promise;
                } else if (promiseThing.denodeify) {
                    promise = $q.when(promiseThing);
                }

                var then = (promise.then || promise.$then);

                then.call(promise, success, error);
            };

            var addPromiseLikeThing = function (promise) {

                if (!tracker.isPromise(promise)) {
                    throw new Error('pdLoader expects a promise (or something that has a .promise or .$promise');
                }

                if (tracker.promises.indexOf(promise) !== -1) {
                    return;
                }
                tracker.promises.push(promise);

                tracker.callThen(promise, function () {
                    promise.$pdLoaderFulfilled = true;
                    if (tracker.promises.indexOf(promise) === -1) {
                        return;
                    }
                    tracker.promises.splice(tracker.promises.indexOf(promise), 1);
                }, function () {
                    promise.$pdLoaderFulfilled = true;
                    if (tracker.promises.indexOf(promise) === -1) {
                        return;
                    }
                    tracker.promises.splice(tracker.promises.indexOf(promise), 1);
                });
            };

            tracker.active = function () {
                if (tracker.delayPromise) {
                    return false;
                }

                if (!tracker.delayJustFinished) {
                    if (tracker.durationPromise) {
                        return true;
                    }
                    return tracker.promises.length > 0;
                } else {
                    //if both delay and min duration are set,
                    //we don't want to initiate the min duration if the
                    //promise finished before the delay was complete
                    tracker.delayJustFinished = false;
                    if (tracker.promises.length === 0) {
                        tracker.durationPromise = null;
                    }
                    return tracker.promises.length > 0;
                }
            };

            return tracker;

        };
    })
    /**
     * @ngdoc directive
     * @name pdLoader.directive:pdLoader
     * @restrict 'A'
     * @description
     *
     * This directive is used in a view or directive template to show a loading indicator While
     * waiting for a specified promise to resolve. When placing this directive in your markup,
     * it should be a sibling of the DOM element you want to show a loading indicator over.
     *
     * **Note:** These attributes should be defined as key/values in an object like so: `<div pd-loader="{ delay: 0, minDuration: 100, message: 'Please wait'}"></div>`
     *
     * @requires pdLoader.factory:_pdLoaderTrackerFactory
     *
     * @param {promise} promise A promise or array of promises that pdLoader watches. pdLoader shows when the promise begins and hides when it resolves/rejects.
     * @param {number} delay The amount of time, in milliseconds, that pdLoader waits before showing the indicator. Defaults to 0.
     * @param {number} minDuration The minimum amount of time, in milliseconds, that pdLoader shows on screen before disappeaering. Defaults to 0.
     * @param {boolean} backdrop Whether or not a backddrop should be rendered below the pdLoader template. Defaults to true.
     * @param {string} message A message that shows in the pdLoader template above the gif or spinner. Defaults to "Please Wait..."
     * @param {string} wrapperClass A list of classes that can be used to wrap the loader template. Defaults to 'cg-busy cg-busy-animation'. Classes should be space delimited
     */
    .directive('pdLoader', function ($compile, $templateCache, pdLoaderDefaults, $http, _pdLoaderTrackerFactory) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, fn) {

                var templateElement;
                var backdropElement;
                var currentTemplate;
                var templateScope;
                var backdrop;
                var tracker = _pdLoaderTrackerFactory();

                var defaults = {
                    templateUrl: 'pd-loader/pd-loader.html',
                    delay: 0,
                    minDuration: 0,
                    backdrop: true,
                    wrapperClass: 'cg-busy cg-busy-animation'
                };

                angular.extend(defaults, pdLoaderDefaults);

                scope.$watchCollection(attrs.pdLoader, function (options) {

                    if (!options) {
                        options = {
                            promise: null
                        };
                    }

                    if (angular.isString(options)) {
                        throw new Error('Invalid value for pd-loader. pdLoader no longer accepts string ids to represent promises/trackers.');
                    }

                    //is it an array (of promises) or one promise
                    if (angular.isArray(options) || tracker.isPromise(options)) {
                        options = {
                            promise: options
                        };
                    }

                    options = angular.extend(angular.copy(defaults), options);

                    if (!options.templateUrl) {
                        options.templateUrl = defaults.templateUrl;
                    }

                    if (!angular.isArray(options.promise)) {
                        options.promise = [options.promise];
                    }

                    if (!templateScope) {
                        templateScope = scope.$new();
                    }

                    templateScope.$message = options.message;

                    if (!angular.equals(tracker.promises, options.promise)) {
                        tracker.reset({
                            promises: options.promise,
                            delay: options.delay,
                            minDuration: options.minDuration
                        });
                    }

                    templateScope.$pdLoaderIsActive = function () {
                        return tracker.active();
                    };


                    if (!templateElement || currentTemplate !== options.templateUrl || backdrop !== options.backdrop) {

                        if (templateElement) {
                            templateElement.remove();
                        }
                        if (backdropElement) {
                            backdropElement.remove();
                        }

                        currentTemplate = options.templateUrl;
                        backdrop = options.backdrop;

                        $http.get(currentTemplate, {
                            cache: $templateCache
                        }).success(function (indicatorTemplate) {

                            options.backdrop = typeof options.backdrop === 'undefined' ? true : options.backdrop;

                            if (options.backdrop) {
                                var backdrop = '<div class="cg-busy cg-busy-backdrop cg-busy-backdrop-animation ng-hide" ng-show="$pdLoaderIsActive()"></div>';
                                backdropElement = $compile(backdrop)(templateScope);
                                element.append(backdropElement);
                            }

                            var template = '<div class="' + options.wrapperClass + ' ng-hide" ng-show="$pdLoaderIsActive()">' + indicatorTemplate + '</div>';
                            templateElement = $compile(template)(templateScope);

                            angular.element(templateElement.children()[0])
                                .css('position', 'absolute')
                                .css('top', 0)
                                .css('left', 0)
                                .css('right', 0)
                                .css('bottom', 0);
                            element.append(templateElement);

                        }).error(function (data) {
                            throw new Error('Template specified for pdLoader (' + options.templateUrl + ') could not be loaded. ' + data);
                        });
                    }

                }, true);
            }
        };
    });
