'use strict';
/**
 * @ngdoc overview
 * @name pdForm
 * @module pdForm
 * @description
 *
 * PokitDok's form directive, gives access to the property attempted. ng-before-submit and ng-after-submit are available
 * for data processing, redirection, and post submit notifications. ng-action must be on the form element. This module
 * comes with some default error messages and they can be found at `pd-assets/modules/pd-form/default-error-messages.html`.
 *
 * Here are the current default error messages found in `default-error-messages.html`:
 *
 * <pre>
     <span ng-message="required">This field is required.</span>
     <span ng-message="minlength">Your entry is too short</span>
     <span ng-message="maxlength">Your entry is too long</span>
     <span ng-message="email">A valid email address is required</span>
     <span ng-message="pattern">Invalid entry</span>
     <span ng-message="url">Invalid URL</span>
     <span ng-message="pdAvailable">Value is not available for use</span>
     <span ng-message="pdPasswordMatch">Passwords must match</span>
     <span ng-message="pdPasswordRules">Invalid password</span>
     <span ng-message="pdInsurance">You must fill both insurance fields</span>
 * </pre>
 *
 */
angular.module('pdForm', [
    'ngMessages',
    'ngSanitize',
    'pdSelect',
    'pdSpinner'
])
    /**
    * @ngdoc directive
    * @name pdForm.directive:pdForm
    * @restrict 'A'
    * @element form
    * @description
    *
    * This is the main directive of the pdForm module and it is implemented as an attribute on a form element.
    * Other attribute directives like `pd-validate`, the validation directive, can also be placed on the form element.
    *
    * @example
        <example module="pdForm">
            <file name="pd-form-example.html">
                <div ng-controller="pdFormDemoCtrl">
                    <form pd-form
                      autocomplete="off"
                      novalidate
                      name="signupForm"
                      class="embed landingform container-div"
                      ng-after-submit="afterSubmit"
                      ng-action="/authorize/signup">


                        <div class="form-error" ng-show="signupForm.$serverError" ng-cloak>
                            There was an error submitting the form. Please try again or <a
                                href="https://pokitdok.com/contact?context=Platform Signup Form Error">contact
                            us</a>.
                        </div>

                        <div class="row">
                            <div class="col-lg-6">
                                <div class="form-group" pd-validate>
                                    <label>First Name</label>
                                    <input type="text"
                                           name="first_name"
                                           ng-model="data.first_name"
                                           class="form-control"
                                           ng-required="true"/>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="form-group" pd-validate>
                                    <label>Last Name</label>
                                    <input type="text"
                                           name="last_name"
                                           ng-model="data.last_name"
                                           class="form-control"
                                           ng-required="true"/>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="form-group" pd-validate>
                                    <label>Email Address</label>
                                    <input type="email"
                                           name="email"
                                           ng-model="data.email"
                                           class="form-control"
                                           ng-required="true"
                                           pd-available="/email-available"/>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="form-group" pd-validate>
                                    <label>Password</label>
                                    <input type="password"
                                           pd-password-rules
                                           name="password"
                                           ng-model="data.password"
                                           class="form-control"
                                           ng-required="true"/>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="form-group" pd-validate>
                                    <label>Confirm Password</label>
                                    <input type="password"
                                           pd-password-match="password"
                                           name="confirm_password"
                                           ng-model="data.confirm_password"
                                           class="form-control"
                                           ng-required="true"/>
                                </div>
                            </div>
                        </div>

                        <div class="form-group" pd-validate>
                            <p class="control-label"><br/>
                                <input type="checkbox" class="custom-checkbox"
                                       name="agree_tos" id="agree_tos"
                                       ng-model="data.agree_tos"
                                       ng-required="true"/>
                                <label class="custom-checkbox-label" for="agree_tos">
                                    I agree to <a class="link2" href="/terms" target="_blank">Terms</a>
                                    &amp;
                                    <a class="link2" href="/privacy" target="_blank">Privacy Policy</a></label>
                            </p>
                        </div>
                        <div class="form-actions text-center">
                            <br/>
                            <input type="hidden" ng-model="data.utm_source" name="utm_source"
                                   ng-init="data.utm_source='{{ session.utm_source }}'">
                            <input type="hidden" ng-model="data.utm_source" name="utm_source"
                                   ng-init="data.utm_keyword='{{ session.utm_keyword }}'">
                            <button type="submit"
                                    ng-disabled="signupForm.$submitting"
                                    class="btn btn-warning">
                                <i class="dark-loader-s"></i> SIGN UP
                            </button>
                        </div>
                    </form>
                </div>
            </file>
            <file name="pdFormCtrl.js">
                angular.module('pdForm')
                    .controller('pdFormDemoCtrl', function($scope) {
                        $scope.afterSubmit = function () {
                            alert('afterSubmit fired');
                        };
                    });
            </file>
        </example>
    *
    */
    .directive('pdForm', function ($http) {
        return {
            restrict: 'A',
            controller: function ($scope, $element, $attrs) {
                $element.bind('submit', function () {
                    var formCtrl = $scope[$attrs.name],
                        method = $attrs.method || 'POST';
                    method = method.toLowerCase();
                    formCtrl.$attempted = true;
                    if (formCtrl.$invalid) {
                        return false;
                    }
                    formCtrl.$serverError = false;
                    formCtrl.$serverSuccess = false;
                    formCtrl.$submitting = true;
                    function done() {
                        if ($attrs.noSubmit) {
                            formCtrl.$serverSuccess = true;
                            formCtrl.$submitting = false;
                            $attrs.ngAfterSubmit && $scope[$attrs.ngAfterSubmit]();
                            return true;
                        }
                        $http[method]($attrs.ngAction, $scope.data)
                            .then(function (res) {
                                formCtrl.$submitting = false;
                                formCtrl.$serverSuccess = true;
                                $attrs.ngAfterSubmit && $scope[$attrs.ngAfterSubmit](res);
                            }, function (res) {
                                console.error(res);
                                formCtrl.$submitting = false;
                                formCtrl.errors = res.errors;
                                formCtrl.$serverError = true;
                                $attrs.ngOnError && $scope[$attrs.ngOnError](res);
                            });
                    }

                    // If you need to do something async, add the done callback as an argument
                    // to your beforeSubmit function in your controller. You will need to
                    // return a truthy value from your beforeSubmit function and invoke your
                    // callback after your async action has complete, i.e. in inside a .then
                    // block
                    if ($attrs.ngBeforeSubmit) {
                        !$scope[$attrs.ngBeforeSubmit](done) && done();
                    } else {
                        done();
                    }

                });
            }
        };
    })

    /**
     * @ngdoc directive
     * @name pdForm.directive:pdValidate
     * @terminal
     * @restrict 'A'
     * @description
     *
     * pdValidate is used to trigger validation on an input. It should be implemented as an attribute
     * on an input elements parent or container element. It takes no parameters, but instead handles
     * hiding and showing error messages found in
     *
     * `pd-assets/pd-form/default-errors-messages.html`:
     *
     * <pre>
         <span ng-message="required">This field is required.</span>
         <span ng-message="minlength">Your entry is too short</span>
         <span ng-message="maxlength">Your entry is too long</span>
         <span ng-message="email">A valid email address is required</span>
         <span ng-message="pattern">Invalid entry</span>
         <span ng-message="url">Invalid URL</span>
         <span ng-message="pdAvailable">Value is not available for use</span>
         <span ng-message="pdPasswordMatch">Passwords must match</span>
         <span ng-message="pdPasswordRules">Invalid password</span>
         <span ng-message="pdInsurance">You must fill both insurance fields</span>
     * </pre>
     *
     * The validation messsage it triggers is based on the type of validation attribute placed on field itself,
     * i.e, the input field that is a child of the element that has the `pd-validate` directive as an attribute.
     * Requires a `<form>` element as its parent.
     *
     */
    .directive('pdValidate', function ($compile) {
        return {
            restrict: 'A',
            require: '^form',
            terminal: true,
            link: function (scope, element, attrs, fCtrl) {
                var attrName = fCtrl.$name + '.' + element.find('input,textarea,select,pd-select').attr('name'),
                    messages = element.find('[ng-message]').remove();

                if ( attrName.indexOf('undefined') > -1 ) {
                    attrName = fCtrl.$name + '.' + element.attr('field-name');
                }

                if ( _.has(attrs, 'pdShowValidIcon') && attrs.pdShowValidIcon !== 'false' ) {
                    element.css('position', 'relative');
                    element.append('<div class="input-valid-wrapper"><i class="fa fa-fw fa-check animate-show-fade" ng-show="' + attrName + '.$valid"></i></div>');
                }

                // if ( _.has(attrs, 'pdShowValidIcon') && attrs.pdShowInvalidIcon !== 'false' ) {
                //     element.css('position', 'relative');
                //     element.append('<div class="input-valid-wrapper"><i class="fa fa-fw fa-close animate-show-fade" ng-show="' + attrName + '.$invalid && ' + attrName + '.$dirty"></i></div>');
                // }

                element.removeAttr('pd-validate');
                element.attr('ng-class', '{\'has-error\':' + attrName + '.$invalid && (' + attrName + '.$touched || ' + fCtrl.$name + '.$attempted)}');
                element.append('<div class="help-block animate-show-fade" ng-messages="' + attrName + '.$error">' +
                    '<small ng-messages-include="pd-form/default-error-messages.html"></small>' +
                    '</div>');
                element.find('.help-block').append(messages);
                $compile(element)(scope);
            }
        };
    })

    /**
     * @ngdoc directive
     * @name pdForm.directive:pdAvailable
     * @restrict 'A'
     * @element input
     * @description
     *
     * pdAvailable is used to check whether a username/email is available for registration. This directive is
     * implemented as an attribute on an input field, most likely `<input type="email">`, though it will work
     * on any type of element or input type. Checks against our API/database to see if there's a user in our system
     * with that email already registered and displays a ng-message based on the result of the post to the db.
     * Requires the field to have an `ng-model`.
     *
     * @param {string} pd-available Should be a relative URL that points to something like `/accounts/email-available` or another API endpoint.
     *
     */
    .directive('pdAvailable', function ($http, $q, $timeout, $compile) {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, element, attrs, ngModel, fCtrl) {
                var url = attrs.pdAvailable,
                    currentValue = false,
                    loadingName = attrs.name + '_loading',
                    aborter = $q.defer(),
                    req = null,
                    reverse = _.has(attrs, 'reverse'),
                    xEl = angular.element('<div class="input-valid-wrapper"><i class="fa fa-fw fa-close"></i></div>'),
                    checkEl = angular.element('<div class="input-valid-wrapper"><i class="fa fa-fw fa-check"></i></div>'),
                    spinnerEl = angular.element('<div class="pd-spinner"></div>');

                var EMAIL_REGEXP = /(^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-\011\013\014\016-\177])*")@((?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?$)|\[(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\]$/i;

                $timeout(function () {
                    currentValue = ngModel.$modelValue;
                }, 0);

                var checkAvailable = function (value) {
                    ngModel.$setValidity('pdAvailableEmail', true);
                    ngModel.$setValidity('pdAvailable', true);
                    ngModel.$setValidity('required', false);

                    if ( reverse ) {
                        ngModel.$setValidity('pdEmailNotFound', true);
                    }

                    if (req) {
                        aborter.resolve();
                        aborter = $q.defer();
                    }
                    if ( currentValue === value || currentValue === false) {
                        return value;
                    }

                    ngModel.$setTouched(true);
                    scope[loadingName] = true;
                    var reqData = {};
                    reqData[attrs.name] = value;
                    if ( EMAIL_REGEXP.test(reqData.email) ) {
                        checkEl.detach();
                        xEl.detach();
                        element.parent().append(spinnerEl);
                        $http.post(url, reqData, {timeout: aborter.promise})
                            .success(function (res) {
                                spinnerEl.detach();
                                scope[loadingName] = false;
                                if ( res.data.available || ( res.data.data && res.data.data.available ) ) {
                                    ngModel.$setValidity('pdAvailableLoading', true);
                                    element.css('position', 'relative');
                                    if ( reverse ) {
                                        element.parent().append(xEl);
                                        ngModel.$setValidity('pdEmailNotFound', false);
                                    } else {
                                        element.parent().append(checkEl);
                                    }
                                } else {
                                    if ( reverse ) {
                                        element.parent().append(checkEl);
                                    } else {
                                        element.parent().append(xEl);
                                        ngModel.$setValidity('pdAvailableEmail', false);
                                    }
                                }
                            });
                        return value;
                    } else {
                        checkEl.detach();
                        element.parent().append(xEl);
                    }

                };
                ngModel.$parsers.push(checkAvailable);
                ngModel.$formatters.push(checkAvailable);
            }
        };
    })

    /**
    * @ngdoc directive
    * @name pdForm.directive:input
    * @restrict 'E'
    * @element input
    * @priority 1
    * @description
    *
    * This directive overwrites Angular's built-in input validators and sets up new Regex patterns
    * for URLs and Email fields. These validations are automatically triggered if the `<input>` has a
    * type attribute of `url` or `email`. Requires the field to have an `ng-model`.
    *
    */
    .directive('input', function () {
        var URL_REGEXP = /^(?:[a-z0-9\.\-]*):\/\/(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[?[A-F0-9]*:[A-F0-9:]+\]?)(?::\d+)?(?:\/?|[\/?]\S+)$/i;
        var EMAIL_REGEXP = /(^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-\011\013\014\016-\177])*")@((?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?$)|\[(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\]$/i;
        return {
            require: '?ngModel',
            restrict: 'E',
            priority: 1,
            link: function (scope, element, attrs, ngModel) {
                if (ngModel && attrs.type && attrs.type === 'url') {
                    ngModel.$validators.url = function (modelValue, viewValue) {
                        var value = modelValue || viewValue;
                        return (ngModel.$isEmpty(value) || URL_REGEXP.test(value));
                    };
                } else if (ngModel && attrs.type && attrs.type === 'email') {
                    ngModel.$validators.email = function (modelValue, viewValue) {
                        var value = modelValue || viewValue;
                        return (ngModel.$isEmpty(value) || EMAIL_REGEXP.test(value));
                    };
                }
            }
        };
    })

    /**
    * @ngdoc directive
    * @name pdForm.directive:pdPasswordStrength
    * @restrict 'A'
    * @element input
    * @description
    *
    * The `pd-password-strength` directive checks the strength of a user's password and displays a 'strength'
    * indicator on the password field to alert the user of the strength of their password. Requires the field to have an `ng-model`.
    *
    * @deprecated as of January 2015
    */
    .directive('pdPasswordStrength', function ($compile) {
        return {
            require: '?ngModel',
            restrict: 'A',
            link: function (scope, element, attrs, ngModel) {
                var strengthIndicator = angular.element('<small class="strength" ng-invisible=\'strength === undefined\'><span class="allface {{passwordface}}"></span>strength: {{strength}}</small>');
                element.before(strengthIndicator);
                $compile(strengthIndicator)(scope);
                var upperLowerNumberRegex = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z\d\s:])/;
                ngModel.$parsers.push(function (value) {
                    if (0 < value.length < 8) {
                        scope.strength = 'weak';
                        scope.passwordface = 'pd-face-sad';
                    }
                    if (value.length > 7) {
                        scope.strength = 'medium';
                        scope.passwordface = 'pd-face-neutral';
                    }
                    if (value.length > 7 && value.match(upperLowerNumberRegex)) {
                        scope.strength = 'strong';
                        scope.passwordface = 'pd-face-happy';
                    }

                    return value;
                });
            }
        };
    })


    /**
    * @ngdoc directive
    * @name pdForm.directive:pdPasswordRules
    * @restrict 'A'
    * @element input
    * @description
    *
    * The `pd-password-rules` directive checks the users password against the following rules during registration:
    *
    *   * must be between 8-128 characters
    *   * must contain 1 uppercase character, 1 lowercase character, 1 number, and 1 symbol or special character
    *
    * The directive also displays an error message that checks upon focus, blur, and change whether or not the password
    * has met the above rules. Should be placed on an `<input type="password">`. Requires the `<input>` field to have an `ng-model`.
    */
     .directive('pdPasswordRules', function($compile) {
        return {
            require: '?ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, ngModel) {
                var rulesMarkup =   '<div class="pd-password-rules-container">' +
                                        '<div ng-show="valid != true && valid != undefined" class="pd-password-rules animate-show-fade">' +
                                            '<span>8 or more characters, must contain one of each of the following</span>' +
                                            '<ul>' +
                                                '<li>Uppercase Letter <i ng-show="hasUppercase" class="fa fa-fw fa-check text-success animate-show-fade"></i></li>' +
                                                '<li>Lowercase Letter <i ng-show="hasLowercase" class="fa fa-fw fa-check text-success animate-show-fade"></i></li>' +
                                                '<li>Number <i ng-show="hasNumber" class="fa fa-fw fa-check text-success animate-show-fade"></i></li>' +
                                                '<li>Symbol <i ng-show="hasSymbol" class="fa fa-fw fa-check text-success animate-show-fade"></i></li>' +
                                            '</ul>' +
                                        '</div>' +
                                    '</div>';
                var rules = angular.element(rulesMarkup);
                element.after(rules);
                $compile(rules)(scope);
                var validRe = /^(?=.{8,128}$)(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z\d\s:])/;
                scope.hasNumber = false;
                scope.hasUppercase = false;
                scope.hasLowercase = false;
                scope.hasSymbol = false;

                function hasUppercase (value) {
                    var upperCase = /[A-Z]/;
                    return upperCase.test(value);
                }

                function hasLowercase (value) {
                    var lowerCase = /[a-z]/;
                    return lowerCase.test(value);
                }

                function hasNumber (value) {
                    var hasNum = /\d/;
                    return hasNum.test(value);
                }

                function hasSymbol (value) {
                    var hasSymbol = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
                    return hasSymbol.test(value);
                }

                function setValidityUI (value) {
                    scope.hasNumber = hasNumber(value);
                    scope.hasUppercase = hasUppercase(value);
                    scope.hasLowercase = hasLowercase(value);
                    scope.hasSymbol = hasSymbol(value);
                }

                element.on('focus', function() {
                    if ( scope.valid === undefined ) {
                        scope.valid = false;
                        scope.$digest();
                    }
                });

                element.on('blur', function() {
                    if ( !scope.valid ) {
                        scope.valid = undefined;
                        scope.$digest();
                    }
                });

                ngModel.$parsers.push(function (value) {
                    scope.valid = validRe.test(value);
                    ngModel.$setValidity('pdPasswordRules', scope.valid);
                    setValidityUI(value);
                    return value;
                });
            }
        };
     })

     /**
     * @ngdoc directive
     * @name pdForm.directive:pdPasswordMatch
     * @scope
     * @restrict 'A'
     * @element input
     * @description
     *
     * The `pd-password-rules` directive checks the users password against another password field to verify
     * that they contain the same password. Should be placed on an `<input type="password">`.
     * Requires a `<form>` element as a parent.
     *
     * @param {string} pd-password-match Should contain a string that references the input `name` attribute of the
     *                                   password field you are trying to check for a match.
     *
     */
    .directive('pdPasswordMatch', function () {
        return {
            require: '^form',
            restrict: 'A',
            link: function (scope, element, attrs, fCtrl) {
                var passwordField = fCtrl[attrs.pdPasswordMatch],
                    confirmField = fCtrl[attrs.name];

                function setMatchValidity(value) {
                    if (value !== passwordField.$modelValue) {
                        confirmField.$setValidity('pdPasswordMatch', false);
                    } else {
                        confirmField.$setValidity('pdPasswordMatch', true);
                    }
                }

                passwordField.$viewChangeListeners.push(function () {
                    setMatchValidity(confirmField.$modelValue);
                });
                confirmField.$parsers.push(function (value) {
                    setMatchValidity(value);
                    return value;
                });
            }
        };
    })

    /**
    * @ngdoc directive
    * @name pdForm.directive:pdInsurance
    * @restrict 'A'
    * @element input
    * @description
    *
    * The `pd-insurance` directive compares a `trading_partner_id` and a `memberId`
    * that they contain the same password. Should be placed on an `<input type="text">`.
    * This directive is currently only in use when adding/editing dependents in Consumer Marketplace
    * Requires a `<form>` element as a parent.
    *
    */
    .directive('pdInsurance', function () {
        return {
            require: '^form',
            restrict: 'A',
            link: function (scope, element, attrs, fCtrl) {
                var insuranceField = fCtrl.trading_partner_id,
                    memberIdField = fCtrl[attrs.name];

                function setInsuranceValidity(memberId, insuranceId) {
                    if (!memberId && insuranceId) {
                        memberIdField.$setValidity('pdInsurance', false);
                    }
                    else if (memberId && !insuranceId) {
                        insuranceField.$setValidity('pdInsurance', false);
                    }
                    else if (!memberId && !insuranceId) {
                        memberIdField.$setValidity('pdInsurance', true);
                        insuranceField.$setValidity('pdInsurance', true);
                        fCtrl.$serverError = false;
                    }
                    else if (memberId && insuranceId) {
                        memberIdField.$setValidity('pdInsurance', true);
                        insuranceField.$setValidity('pdInsurance', true);
                        fCtrl.$serverError = false;
                    }
                }

                insuranceField.$viewChangeListeners.push(function () {
                    setInsuranceValidity(memberIdField.$modelValue, insuranceField.$modelValue);
                });
                memberIdField.$viewChangeListeners.push(function () {
                    setInsuranceValidity(memberIdField.$modelValue, insuranceField.$modelValue);
                });
                memberIdField.$parsers.push(function (value) {
                    setInsuranceValidity(memberIdField.$modelValue, insuranceField.$modelValue);
                    return value;
                });
            }
        };
    })
    // Takes a form submit button and drops a spinner on it while the form is submitting
    .directive('pdSubmitButton', function ($timeout) {
        return {
            require: '^form',
            restrict: 'AE',
            replace: true,
            link: function(scope, el, attrs, fCtrl) {
                var spinnerMarkup = '<div class="pd-spinner"></div>',
                    spinnerEl = angular.element(spinnerMarkup),
                    text = el.context.innerHTML,
                    buttonHeight, buttonWidth,
                    hasAction;

                // check to see if formHasAction is present - prevents spinner from stopping
                // if form has an action that takes it to another state
                if ( attrs.hasOwnProperty('formHasAction') ) {
                    hasAction = true;
                } else {
                    hasAction = false;
                    // only hide when there is a serverSuccess
                    scope.$watch(fCtrl.$name + '.$serverSuccess', function(newVal) {
                        $timeout(function(){
                            if ( newVal ) {
                                hideSpinner();
                            }
                        }, 500);
                    });
                }

                el.parent().addClass('pd-spinner-button');

                // watch the form for a submission
                scope.$watch(fCtrl.$name + '.$submitting', function(newVal) {
                    if ( newVal ) {
                        // if submitting is set to true, then show spinner
                        showSpinner();
                    } else if ( !newVal && !hasAction ){
                        // if submitting is set to false, stop showing.
                        // if form-has-action present, then leave spinning since page
                        // hideSpinner();
                    }
                });

                // only hide when there is a serverError
                scope.$watch(fCtrl.$name + '.$serverError', function(newVal) {
                    $timeout(function(){
                        if ( newVal ) {
                            hideSpinner();
                        }
                    }, 100);
                });

                function showSpinner() {
                    buttonHeight = el[0].offsetHeight;
                    buttonWidth = el[0].offsetWidth;
                    el.css('width', buttonWidth);
                    el.css('height', buttonHeight);
                    el.text('');
                    el.attr('disabled', true);
                    el.append(spinnerEl);
                }

                function hideSpinner() {
                    $timeout(function() {
                        el.text(text);
                        el.attr('disabled', false);
                        el.removeAttr('style');
                        spinnerEl.detach();
                    }, 250);
                }
            }
        };
    })
    .directive('pdDobForm', function (months, monthDays) {
        return {
            restrict: 'A',
            templateUrl: 'pd-form/pd-dob-form.html',
            scope: {
                // angular model which holds date for form submission
                model: '=ngModel',
                // whether or not each of these fields is required
                dobRequired: '='
            },
            controller: function ($scope) {
                // populate dropdown options
                $scope.months = months;
                $scope.days = monthDays;
                $scope.years = [];
                var currentYear = moment().year();

                // generate valid years
                for (var i = 0; i < 110; i++) {
                    $scope.years.push(currentYear - i);
                }

                // convert date of birth to format to be submitted with the form
                var convertDOBForSubmit = function (year, month, day) {
                    var DOBtoRetrun = moment({years: year, months: month, days: day}).format('YYYY-MM-DD');
                    if (DOBtoRetrun === 'Invalid date') {
                        DOBtoRetrun = undefined;
                    }
                    return DOBtoRetrun;
                };

                // when model is updated, make sure year, month, and day inputs match
                $scope.$watch('model', function (newVal, oldVal) {
                    if ( oldVal !== newVal ) {
                        var newDate = moment(newVal);
                        if ($scope.year !== newDate.year()) {
                            $scope.year = newDate.year();
                        }
                        if ($scope.month !== newDate.month()) {
                            $scope.month = newDate.month();
                        }
                        if ($scope.day !== newDate.date()) {
                            $scope.day = newDate.date();
                        }
                    } else if ( $scope.model ) {
                        var oldDate = moment($scope.model);
                        $scope.year = oldDate.year();
                        $scope.month = oldDate.month();
                        $scope.day = oldDate.date();
                    }
                });

                // when inputs change, update model to hold updated date
                var updateModel = function () {
                    if ( $scope.year !== undefined && $scope.month !== undefined && $scope.day !== undefined ) {
                        var modelDate = moment($scope.model);
                        if (modelDate.year() !== $scope.year || modelDate.month() !== $scope.month || modelDate.date() !== $scope.day) {
                            $scope.model = convertDOBForSubmit($scope.year, $scope.month, $scope.day);
                        }
                    } else {
                        $scope.model = undefined;
                    }
                };

                // run update function when year, month, or day inputs change in scope
                $scope.$watch('year', updateModel);
                $scope.$watch('month', updateModel);
                $scope.$watch('day', updateModel);
            }
        };
    });
