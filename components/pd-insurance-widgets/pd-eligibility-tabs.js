'use strict';


angular.module('pdInsuranceWidgets', [
    'pdServices',
    'ui.bootstrap.tabs'
])
    .service('pdEligibilityService', function($http) {
        var s = {
            eligibilityResponse: null,
            reload: function(user) {
                var self = this;
                return $http.get('$api/users/' + user._uuid + '/eligibility').then(function(res){
                    self.eligibilityResponse = res.data.data.result;
                });
            }
        };
        return s;
    })
    .directive('pdEligibilityPanel', function($rootScope) {
        return {
            restrict: 'EA',
            templateUrl: 'pd-insurance-widgets/views/pd-eligibility-panel.html',
            scope: {
                // object - a user object
                user: '=',
                // function - fires on remove button click
                onRemoveClick: '=',
                // function - fires on the edit button click
                onEditClick: '='
            },
            link: function(scope, el, attrs) {
                scope.data = {};

                scope.reloadEligibility = function() {
                    $rootScope.$broadcast('pdEligibilityTabs:reload');
                }

                $rootScope.$on('pdEligibility:reloaded', function(e, data){
                    scope.data = data;
                });
            }
        };
    })
    .directive('pdEligibilityTabs', function($http, $rootScope, $timeout, pdToastFactory, BenefitsFormatter, pdEligibilityService) {
        return {
            restrict: 'EA',
            templateUrl: 'pd-insurance-widgets/views/pd-eligibility-tabs.html',
            scope: {
                user: '='
            },
            link: function(scope, el, attrs) {

                scope.data = {};
                scope.data.insurance = {};
                scope.failedToLoad = false;

                scope.$on('pdEligibilityTabs:reload', function() {
                    scope.reloadEligibility();
                });

                var maxAttempts = 5;
                var attempts = 0;

                scope.reloadEligibility = function() {
                    scope.loadingEligibility = true;
                    attempts++;
                    try {
                        scope.eligibilityLoaderPromise = $http.get('$api/users/' + scope.user._uuid + '/eligibility')
                            .then(function (res) {
                                updateInsurance(res.data.data.result);
                                scope.loadingEligibility = false;
                                $rootScope.$broadcast('pdEligibility:reloaded', scope.data);
                            }, function(err) {
                                scope.loadingEligibility = false;
                                pdToastFactory.createToast({
                                    type: 'warning',
                                    title: 'Request failed',
                                    message: 'Your eligibility reload request could not complete successfully.'
                                });
                            });
                    } catch (e) {
                        if ( _.isEmpty( scope.data.insurance ) && attempts <= maxAttempts ) {
                            $timeout(function() {
                                scope.reloadEligibility();
                            }, 500);
                        } else if ( attempts >= maxAttempts) {
                            scope.failedToLoad = true;
                        }
                    }
                };

                scope.reloadEligibility();

                function updateInsurance (eligibilityResponse) {
                    scope.eligibilityErrors = null;
                    scope.copay = {};
                    scope.coinsurance = {};
                    scope.limitations = {};
                    if (!eligibilityResponse.valid_request) {
                        scope.eligibilityErrors = {
                            errors: [
                                "We couldn't get any eligibility information. Please check your insurance information."
                            ]
                        }
                    } else {
                        scope.data.insurance.coverage = eligibilityResponse.coverage;
                        scope.data.insurance.payer = eligibilityResponse.payer;
                        scope.data.insurance.provider = eligibilityResponse.provider;
                        scope.data.insurance.service_types = eligibilityResponse.service_types;
                        scope.data.insurance.subscriber = eligibilityResponse.subscriber;
                        scope.data.insurance.summary = eligibilityResponse.summary;
                        scope.data.insurance.valid_request = eligibilityResponse.valid_request;
                        if (scope.data.insurance && scope.data.insurance.coverage) {
                            if (scope.data.insurance.coverage.copay && scope.data.insurance.coverage.copay.length > 0) {
                                scope.copay = BenefitsFormatter.organizeCopay(scope.data.insurance.coverage.copay);
                            }
                            if (scope.data.insurance.coverage.coinsurance && scope.data.insurance.coverage.coinsurance && scope.data.insurance.coverage.coinsurance.length > 0) {
                                scope.coinsurance = BenefitsFormatter.organizeCoinsurance(scope.data.insurance.coverage.coinsurance);
                            }
                            if (scope.data.insurance.coverage.limitations && scope.data.insurance.coverage.limitations.length > 0) {
                                scope.limitations = BenefitsFormatter.organizeLimitations(scope.data.insurance.coverage.limitations);
                            }
                        }
                    }
                    if ( eligibilityResponse.errors ) {
                        scope.eligibilityErrors = BenefitsErrorMessages.getErrorMessage(eligibilityResponse.errors);
                    }
                    scope.pending = !( eligibilityResponse.valid_request );
                };
            },
            controller: function($scope) {
            }
        };
    });
