'use strict';
/**
 * @ngdoc overview
 * @name pdFacebook
 * @module pdConfirm
 * @description
 *
 *  ## The pdFacebook module
 * The `pdFacebook` directive module allows users to sign up or log in using Facebook by
 * inserting a Facebook style button on login/signup forms and handling the request to
 * login/singup using Facebook's API.
 *
 * The pdFacebook module of the following components:
 *
 * {@link pdFacebook.directive:fbButton fbButton directive}
 *
 */
angular.module('pdFacebook', [])
    /**
     * @ngdoc directive
     * @module pdFacebook
     * @name pdFacebook.directive:fbButton
     * @scope
     * @restrict 'A'
     * @description
     *
     * This directive places a 'Sign in with Facebook' or 'Log in with Facebook' button on the
     * the desired view based on the `type` attribute. The directive also exposes the ability
     * to fire some function, `afterSave`, upon successful completion of the Facebook API login.
     *
     * @param {string} type Specifies the beginning of the title of the Facebook button. Typically
     *                      'Log in' or 'Sign up'.
     * @param {function} afterSave Function to run after successful post to `/facebook-login`. Not required.
     *
     * @example
        <example module="pdFacebook">
             <file name="pd-fbbutton-example.html">
                 <div class="row" ng-controller="pdFacebookDemoCtrl">
                    <div class="col-xs-8 col-xs-offset-2">
                        <div fb-button type="type" after-save="afterSubmit"></div>
                    </div>
                 </div>
             </file>
             <file name="pdFacebookDemoCtrl.js">
                 angular.module('pdFacebook')
                     .controller('pdFacebookDemoCtrl', function($scope) {
                         $scope.type = "Sign Up";
                         $scope.afterSubmit = function () {
                             alert('You have successfully signed up with Facebook!');
                         };
                     });
             </file>
        </example>
     *
     */
    .directive('fbButton', function ($http) {
        return {
            templateUrl: 'pd-facebook/pd-fb-button.html',
            restrict: 'A',
            replace: false,
            scope: {
                type: '=type',
                afterSave: '=afterSave'
            },
            link: function ($scope, $element, $attrs) {
                var statusElement = $element.find('.fb-status');
                $scope.doFBLogin = function () {
                    FB.login(function (res) {
                        statusChangeCallback(res);
                    });
                };
                function statusChangeCallback(res) {
                    // The response object is returned with a status field that lets the
                    // app know the current login status of the person.
                    // Full docs on the response object can be found in the documentation
                    // for FB.getLoginStatus().
                    if (res.status === 'connected') {
                        // Logged into your app and Facebook.
                        $http.post('/facebook-login', {'access_token': res.authResponse.accessToken})
                            .success(function (res) {
                                if ($attrs.redirect) {
                                    window.location = $attrs.redirect;
                                    return;
                                }
                                if ($scope.afterSave) {
                                    return $scope.afterSave(res);
                                }
                            })
                            .error(function () {
                                statusElement.html('There was an error logging into Facebook');
                            });
                    } else if (res.status === 'not_authorized') {
                        // The person is logged into Facebook, but not your app.
                        statusElement.html('Please authorize this app.');
                    } else {
                        // The person is not logged into Facebook, so we're not sure if
                        // they are logged into this app or not.
                        statusElement.html('Please log into Facebook.');
                    }
                }

                window.fbAsyncInit = function () {
                    FB.init({
                        appId: '228081093886224',
                        cookie: true,  // enable cookies to allow the server to access the session
                        xfbml: true,  // parse social plugins on this page
                        version: 'v2.0' // use version 2.0
                    });
                };
                // Load the SDK asynchronously
                (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {
                        return;
                    }
                    js = d.createElement(s);
                    js.id = id;
                    js.src = '//connect.facebook.net/en_US/sdk.js';
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));
            }
        };
    });
