'use strict';
/**
 * @ngdoc overview
 * @name pdConfirm
 * @module pdConfirm
 * @description
 *
 *  # The pdConfirm module
 *  The `pdConfirm` module serves as the modal (dialog) rendering service. It consists
 *  of a service that handles the creation/removal of the modals as well as a directive
 *  that is used internally by `pdConfirmFactory` and should not be used directly in
 *  view templates themselves.
 *
 * The pdConfirm module of the following components:
 *
 * - {@link pdConfirm.directive:pdConfirmModal pdConfirmModal directive}
 *
 * - {@link pdConfirm.service:pdConfirmFactory pdConfirmFactory service}
 *
 * @example
    <example module="pdConfirm">

        <file name="pd-confirm-example.html">
            <div class="text-center" ng-controller="pdConfirmDemoCtrl">
                <div id="confirm-container"></div>
                <button class="btn btn-primary btn-lg" ng-click="showConfirm()">
                    Create confirm
                </button>
            </div>
        </file>

        <file name="pdConfirmDemoCtrl.js">
            angular.module('pdConfirm')
                .controller('pdConfirmDemoCtrl', function($scope, pdConfirmFactory){
                    $scope.showConfirm = function() {
                        pdConfirmFactory.createConfirm({
                            title: 'Confirm me!',
                            content: 'You know you wanna confirm this',
                            type: 'confirm',
                            dismissOverlay: false,
                            closeButton: true,
                            onCancel: function() {
                                console.log('on cancel fired');
                            },
                            onConfirm: function() {
                                console.log('on confirm fired');
                            }
                        });
                    };
            });
        </file>

    </example>
 */
angular.module('pdConfirm', [])
    /**
     * @ngdoc service
     * @module pdConfirm
     * @name pdConfirm.service:pdConfirmFactory
     * @description
     *
     * The `pdConfirmFactory` is the service that makes up the meat of the `pdConfirm` module.
     * This service is injectable in to any controller to allow triggering of confirm modals programmatically.
     *
     * Currently, the `pdConfirmFactory` exposes two public API methods, `createConfirm` and `destroyConfirm`.
     *
     * @requires $q
     * @requires $animate
     * @requires $rootScope
     * @requires $compile
     */
    .service('pdConfirmFactory', function($q, $rootScope, $animate, $compile) {

        var $confirmContainer,
            $appContainer = angular.element(document.querySelector('#app-container')),
            $body = angular.element(document).find('body'),
            confirmsArr = [];

        /**
        * @ngdoc method
        * @name pdConfirmFactory#createConfirm
        * @methodOf pdConfirm.service:pdConfirmFactory
        * @description
        *
        * A public method that creates and renders a pdConfirm modal to the DOM.
        *
        * @param {object} options An object that contains a list of options and settings for the confirm modal that you want to create.
        *
        * @param {string} options.title The title for the confirm box.
        * @param {string} options.content The content of the message for the confirm box. Shows below the title. Should contain instructions for the user about what happens when they confirm or cancel.
        *
        * @param {function} options.onConfirm A callback function that fires when the user clicks on the confirm button in the modal.
        * @param {string} options.confirmBtnText Text to show on the button that confirms the user's action. Defaults to 'OK'.
        * @param {boolean} options.hideConfirmBtn Controls hiding/showing of confirm button inside modal. Defaults to false.
        *
        * @param {function} options.onCancel A callback function that fires when the user clicks on the cancel button. Defaults to just closing the modal.
        * @param {string} options.cancelBtnText Text to show on the button that cancels the user's action. Defaults to 'Cancel'.
        * @param {boolean} options.hideCancelBtn Controls hiding/showing of cancel button inside modal. Defaults to false.
        *
        * @param {boolean} options.closeButton Controls hiding/showing of the close button in the top right of the screen. Defaults to false (no close button shown).
        * @param {boolean} options.dismissOverlay Defaults to true. If true, modal will close if anywhere other than inside the modal is clicked.
        *
        * @param {string} options.templateUrl Allows setting of a custom template for the modal itself. Requires similar markup structure to the pd-confirm.html template.
        * @param {object} options.context A context object that should be used in your custom template if you need to hydrate the template with specific data.
        *
        * @param {string} options.type Specificies the type of confirm to render. There are two types, 'confirm' and 'input'. A 'confirm' type modal will render
                                       a standard pdConfirm modal with cancel and confirm buttons. An 'input' type confirm will render a confirm with a basic Text
                                       input that can be used to require additional user action, i.e. confirming their action by entering a certain text value.
        */
        function createConfirm (options) {
            var newConfirm = {};
            newConfirm.scope = $rootScope.$new();

            var d = new Date();
            var id = d.getTime();
            newConfirm.id = id;

            // a unique id to use for dismissal and queining
            newConfirm.scope.confirmId = newConfirm.id;
            // The title of the modal if not template is defined
            newConfirm.scope.title = options.title || 'Are you sure?';
            // The content of the modal if no template is defined
            newConfirm.scope.content = options.content || 'Click "OK" to confirm or "Cancel" to cancel this action';
            // function to fire onConfirm button click
            newConfirm.scope.onConfirm = options.onConfirm;
            // text to display on the confirm button
            newConfirm.scope.confirmBtnText = options.confirmBtnText || 'OK';
            // hide/show cancel button
            newConfirm.scope.hideConfirmBtn = options.hideConfirmBtn === undefined ? false : true;
            // function to fire onCancel button click
            newConfirm.scope.onCancel = options.onCancel;
            // text to display on the cancel button
            newConfirm.scope.cancelBtnText = options.cancelBtnText || 'Cancel';
            // hide/show cancel button
            newConfirm.scope.hideCancelBtn = options.hideCancelBtn === undefined ? false : options.hideCancelBtn;
            // determines whether or not to clodeModal() to overlay click
            if ( options.dismissOverlay === undefined ) {
                newConfirm.scope.dismissOverlay = true;
            } else {
                newConfirm.scope.dismissOverlay = options.dismissOverlay;
            }
            // templateUrl must be in string form 'path/to/some/template'
            newConfirm.scope.templateUrl = options.templateUrl;
            // context to be used in a custom modal templateUrl
            newConfirm.scope.context = options.context;

            newConfirm.scope.hideCloseBtn = options.hideCloseBtn === undefined ? false : options.hideCloseBtn;

            // valid types are: confirm or input
            newConfirm.scope.type = options.type || 'confirm';

            // renders the confirm by compiling the directive template w/ the scope created above
            newConfirm.el = _renderConfirm(newConfirm.scope);

            _renderContainer().then(function(container) {
                // use $animate to insert the element in the DOM
                $animate.enter(newConfirm.el, container).then(function(){
                    confirmsArr.push(newConfirm);
                    $body.addClass('no-scroll');
                });
            });
        }

        /**
        * @ngdoc method
        * @name pdConfirmFactory#destroyConfirm
        * @methodOf pdConfirm.service:pdConfirmFactory
        * @description
        *
        * A public method that removes a pdConfirm modal from the DOM and removes it from the list of queued up modals.
        * Called internally by the pdConfirm directive onCancel and onConfirm.
        *
        * @param {string} confirmId The unique ID of the confirm you wish to remove from the DOM.
        */
        function destroyConfirm (confirmId) {
            var dfd = $q.defer();

            // find the correct confirm to remove
            var confirmToRemove = _.find(confirmsArr,  { id: confirmId });
            // destroy the angular $scope
            confirmToRemove.scope.$destroy();
            // remove the element from the DOM
            confirmToRemove.el.remove();
            // remove the container from the page
            $confirmContainer.remove();
            // remove no scroll from <body>
            $body.removeClass('no-scroll');
            // return the removedConfirm
            dfd.resolve(confirmToRemove);

            return dfd.promise;
        }

        // private - renders modal via the directive
        // Returns the compiled template with its scope values
        function _renderConfirm (scope) {
            var confirmDomEl;
            // Allows setting of a custom template or default to standard template
            if ( scope.templateUrl ) {
                confirmDomEl = angular.element('<pd-confirm-modal template-url="' + scope.templateUrl + '"></pd-confirm-modal>');
            } else {
                confirmDomEl = angular.element('<pd-confirm-modal></pd-confirm-modal>');
            }
            return $compile(confirmDomEl)(scope);
        }

        // private - renders the container for the modal directive to sit in
        // Returns a promise so that we can insert the confirm inside its container after container
        // is inside the DOM
        function _renderContainer () {
            var dfd = $q.defer();
            // prepare a confirm container for DOM insertion
            $confirmContainer = angular.element('<div id="pd-confirm-container"></div>');
            // insert the confirm container in the body after the app container and then resolve the promise
            $animate.enter($confirmContainer, $body, $appContainer).then(function() {
                dfd.resolve($confirmContainer);
            });
            return dfd.promise;
        }

        // public methods to return
        return {
            createConfirm: createConfirm,
            destroyConfirm: destroyConfirm
        };

    })
    /**
     * @ngdoc directive
     * @name pdConfirm.directive:pdConfirmModal
     * @restrict 'E'
     * @description
     *
     * This directive is used internally by the pdConfirmFactory and should not be used
     * directly in any view. It is appended to the DOM using `ngAnimate` in the `pdConfirmFactory`.
     *
     * @requires $interval
     * @requires pdConfirmFactory
     *
     */
    .directive('pdConfirmModal', function(pdConfirmFactory, $timeout){
        return {
            restrict: 'E',
            replace: true,
            templateUrl: function(tElement, tAttrs) {
                return tAttrs.templateUrl || 'pd-confirm/pd-confirm.html';
            },
            link: function(scope, el) {
                var confirmCallback = scope.onConfirm || null,
                    cancelCallback = scope.onCancel || scope.closeModal,
                    KEY_ESC = 27,
                    KEY_ENTER = 13,
                    $overlay = angular.element(document.getElementById('pd-confirm-overlay'));

                // Animated argument sets whether the modal should animate out
                //// We do not animate onConfirm callback due to other animations
                //// firing that may cause unwanted jank
                scope.closeModal = function (animated) {
                    document.removeEventListener('keyup', handleKeyEvent);
                    if ( animated ) {
                        el.children().removeClass('pd-confirm--animate-in');
                        el.children().addClass('pd-confirm--animate-out');
                        $timeout(function() {
                            pdConfirmFactory.destroyConfirm(scope.confirmId);
                        }, 450);
                    } else {
                        pdConfirmFactory.destroyConfirm(scope.confirmId);
                    }
                };

                // Focus input inside confirm is type is inputValue
                if ( scope.type === 'input' ) {
                    var inputEl = angular.element(el.find('input'));
                    inputEl[0].focus();
                }

                if ( scope.dismissOverlay ) {
                    $overlay.on('click', function() {
                        scope.closeModal(true);
                    });
                }

                // Event listeners
                //// Close on ESC key press
                //// Confirm on ENTER key press when type === 'input'
                document.addEventListener('keyup', handleKeyEvent);

                function handleKeyEvent(e) {
                    e.preventDefault();
                    if ( e.keyCode === KEY_ESC ) {
                        cancelCallback && cancelCallback();
                        return scope.closeModal(true);
                    }
                    if ( e.keyCode === KEY_ENTER && scope.type === 'input' ) {
                        confirmCallback(scope.inputValue);
                        scope.inputValue === null;
                        return scope.closeModal(true);
                    }
                    if ( e.keyCode === KEY_ENTER ) {
                        return scope.confirmClicked();
                    }
                }

                scope.cancelClicked = function() {
                    if ( cancelCallback ) {
                        cancelCallback();
                        scope.closeModal(true);
                    }
                    scope.closeModal(true);
                };

                scope.confirmClicked = function() {
                    if ( confirmCallback && scope.type === 'input' ) {
                        confirmCallback(scope.inputValue);
                        scope.closeModal(true);
                    } else if ( confirmCallback && scope.type === 'confirm' ) {
                        confirmCallback();
                        scope.closeModal(true);
                    } else {
                        scope.closeModal(true);
                    }
                };

                scope.closeButtonClicked = function() {
                    scope.closeModal(true);
                };

            }
        };
    });
