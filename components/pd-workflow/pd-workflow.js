'use strict';

angular.module('pdWorkflow', [
        'ui.router',
        'pdConfirm'
    ])
    .directive('pdWorkflowNavSteps', function () {
        return {
            restrict: 'EA',
            templateUrl: 'pd-workflow/pd-workflow-nav-steps.html',
            scope: {
                // an array of steps included in the workflow
                steps: '=',
                // a reference to the current step
                step: '=',
                // boolean - true to hide numbers on steps
                hideNumbers: '=',
                // boolean - true to hide step name
                hideStepNames: '='
            }
        };
    })
    .directive('pdWorkflowHud', function ($rootScope, $state) {
        return {
            restrict: 'EA',
            templateUrl: 'pd-workflow/pd-workflow-hud.html',
            scope: {
                // data needed for HUD template
                hudData: '=',
                // an array of steps included in the workflow
                steps: '=',
                step: '=',
                // the container that will be the parent of the wokrflow HUD
                //// on smaller screen sizes (less than 992px, Bootstrap medium)
                slideOutContainerId: '='
            },
            link: function (scope, el) {
                var workflowEl = angular.element(document.querySelector('#pd-workflow-hud')),
                    slideOutTarget = angular.element(document.querySelector('#' + scope.slideOutContainerId)),
                    smallScreenSize = 992,
                    browserWidth = _getBrowserWidth(),
                    // watches for state changes and sets the index
                    stateChangeListener = $rootScope.$on('$stateChangeSuccess', function () {
                        scope.state = $state.current;
                    });

                _checkForSlideOut(browserWidth);

                // store initial state in scope
                scope.state = $state.current;

                // returns the browser width
                function _getBrowserWidth() {
                    // Fallbacks for different browsers
                    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                    return w;
                }

                // checks width to see if we need to update hud
                function _checkForSlideOut(browserWidth) {
                    if (browserWidth >= smallScreenSize) {
                        _removeSlideOut();
                    } else if (browserWidth < smallScreenSize) {
                        _convertToSlideOut();
                    }
                }

                // Moves the wf hud to a slide out component
                function _convertToSlideOut() {
                    slideOutTarget.addClass('relative');
                    workflowEl.addClass('slide-out');
                    slideOutTarget.append(workflowEl);
                }

                // Moves the wf hud back to its original column
                function _removeSlideOut() {
                    el.append(workflowEl);
                    workflowEl.removeClass('active');
                    workflowEl.removeClass('slide-out');
                }

                // watches resize events to see whether it should be slide out
                window.onresize = function () {
                    var browserWidth = _getBrowserWidth();
                    _checkForSlideOut(browserWidth);
                };

                // called by the close button
                scope.closeSlideOut = function () {
                    workflowEl.removeClass('active');
                };

                // called by edit links in workflow hud
                scope.toggleSlideOut = function () {
                    workflowEl.toggleClass('active');
                };

                // listen for a toggle event
                scope.$on('toggleWFHud', function () {
                    workflowEl.toggleClass('active');
                });

                // destroy the window on this scope destroy
                scope.$on('$destroy', function() {
                    window.onresize = null;
                    stateChangeListener();
                });

            } // end link function
        };
    })

    .directive('pdWorkflowButtons', function () {
        return {
            restrict: 'EA',
            scope: {
                // {function} - Fires on previous button click
                prevClick: '=',
                // String - Text to be shown on previous button
                prevButtonText: '=?',
                // Boolean - Should the prev button be disabled
                prevButtonDisabled: '=',
                // Boolean - Should the prev button be hidden
                hidePrevButton: '=',
                // {function} - Fires on next button click
                nextClick: '=',
                // String - text to be shown on the previous button
                nextButtonText: '=?',
                // Boolean - should the next button be disable
                nextButtonDisabled: '=',
                // Boolean - Should the next button be hidden
                hideNextButton: '='
            },
            templateUrl: 'pd-workflow/pd-workflow-buttons.html',
            link: function(scope) {
                if (!scope.nextButtonText) {
                    scope.nextButtonText = 'Next';
                }
                if (!scope.prevButtonText) {
                    scope.prevButtonText = 'Previous';
                }
            }
        };
    })

    .directive('pdWizardTracking', function () {
        return {
            restrict: 'EA',
            scope: {
                // Boolean - should be attached to $scope variable to determine if user
                //// can navigate away from that workflow
                flag: '=',
                // String - parent state that user should not be able to navigate away from
                root: '@',
                // Array - a list of exempt states
                exemptStates: '=',
                // boolean - true if workflow is in progress
                workflowStarted: '=',
                // { function } - a function to be fired on exiting the workflow
                onExit: '='
            },
            controller: function ($scope, $element, $attrs, $rootScope, $state, pdConfirmFactory) {

                if ($scope.$parent.currentUser && !$scope.$parent.currentUser._uuid) {
                    return false;
                }

                var stateChangeInProgress = false;

                window.onbeforeunload = function (event) {
                    event.preventDefault();
                    if (!$scope.flag) {
                        return 'You have unsaved changes. Are you sure you want to leave this page?';
                    }
                };

                // Support for ui-router
                //// * will run if changing state in app, otherwise onbeforeunload fires *
                var stateChangeListener = $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {

                    if ($scope.flag) {
                        return true;
                    }

                    if ( !$scope.workflowStarted && $scope.exemptStates && $scope.exemptStates.indexOf(toState.name) > -1 ) {
                        // allows user to navigate away if the state is found in the array of exempt states
                        return true;
                    }

                    var oldState = fromState.name.split('.'),
                        idx = oldState.indexOf($scope.root),
                        newState = toState.name.split('.');

                    if (oldState[idx] !== newState[idx] && !stateChangeInProgress) {
                        if (!event.defaultPrevented) {
                            event.preventDefault();
                            // show a custom alert
                            pdConfirmFactory.createConfirm({
                                title: 'You have unsaved changes',
                                dismissOverlay: true,
                                content: 'If you navigate away from this page, you will lose your progress. Click Cancel to continue with the current workflow or click OK to navigate away',
                                onConfirm: function () {
                                    // prevents an unintentional loop of popups opening
                                    stateChangeInProgress = true;
                                    // if its exists, fires some function defined in the controller
                                    $scope.onExit && $scope.onExit();
                                    // go to the intended state, with params if there are some
                                    if ( toParams ) {
                                        $state.go(toState.name, toParams);
                                    } else {
                                        $state.go(toState.name);
                                    }
                                }
                            });
                        }
                    }
                });

                // remove window.onbeforeunload and stateChange event listeners
                $scope.$on('$destroy', function() {
                    window.onbeforeunload = null;
                    stateChangeListener();
                });
            }
        };
    });
