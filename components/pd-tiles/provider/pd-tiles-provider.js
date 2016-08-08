'use strict';

angular.module('pdTiles')
    .directive('pdProviderTile', function ($state, Session) {
        return {
            restrict: 'EA',
            templateUrl: 'pd-tiles/provider/pd-provider-tile.html',
            scope: {
                // provider that hydrates the template
                provider: '=',
                // hides address
                hideAddress: '=',
                // hides the buttons on the right side of the tile, 'Schedule Appointment' & 'Get a Quote'
                hideButtons: '=',
                // hides provider's profile image
                hideProfileImage: '=',
                // hides the social links below the provider image
                hideSocialLinks: '=',
                // hides the list of specialities above the provider image
                hideSpecialties: '=',
                // hides the gender
                hideGender: '=',
                // hides the phone number in the pd-address
                hidePhone: '=',
                // hides the google maps link in the pd-address
                hideGoogleMapsLink:'=',
                // hides shows things based on view
                completeView: '=',
                // hides appointment links when disabled
                hideApptLinks: '=',
                // toggle whether or not to show pokit button
                showPokit: '='
            },
            compile: function() {
                return {
                    pre: function(scope) {
                        if ($state.current.name === 'app.consumer.providers.detail') {
                            scope.hideViewDetailsBtn = true;
                        }

                        if (scope.provider.affiliations) {
                            scope.location = scope.provider.affiliations[0].locations[0];
                        } else {
                            scope.location = scope.provider.locations[0];
                        }

                        if (Session.currentUser && Session.currentUser.pokits && _.find(Session.currentUser.pokits, {
                                _uuid: scope.provider._uuid
                            })) {
                            scope.provider.pokited = true;
                        } else {
                            scope.provider.pokited = false;
                        }

                        if (scope.provider.specialties && typeof scope.provider.specialties[0] === 'string') {
                            mapSpecialties();
                        }

                        if (  !scope.provider.specialties || !scope.provider.specialties.length ) {
                            scope.provider.specialties = [
                                {
                                    name: 'Pediatrics'
                                },
                                {
                                    name: 'General Practice'
                                }
                            ];
                        }

                        mapSpecialties();

                        function mapSpecialties() {
                            _.each(scope.provider.specialties, function (specialty, idx) {
                                var mappedSpecialty = _.find(scope.$parent.specialties, {_uuid: specialty});
                                if (mappedSpecialty) {
                                    scope.provider.specialties[idx] = mappedSpecialty.name;
                                }
                            });
                        }
                    }
                }
            },
            link: function (scope) {
                console.log(scope);
            },
            controller: function ($scope, $state) {

                $scope.scheduleAppointment = function () {
                    $state.go('app.consumer.schedule.find');
                };
            }
        };
    })
    .directive('pdMiniProviderTile', function () {
        return {
            restrict: 'EA',
            templateUrl: 'pd-tiles/provider/pd-mini-provider-tile.html',
            scope: {
                // the provider that populates the temmplate
                provider: '=',
                // List of possible providers to choose from for popout
                availableProviders: '=',
                // decide whether or not we have an action btn-block
                showToggle: '=',
                // set some text for the action button
                togglePopupText: '=',
                // boolean - toggles hiding and showing specialities
                showSpecialties: '@',
                // boolean - toggles whether or not provider name is a link
                providerDetailLink: '='
            },
            link: function (scope) {
                if (scope.availableProviders) {
                    console.log(scope.availableProviders);
                }
                if (scope.provider && !scope.provider.specialties ) {
                    scope.provider.specialties = [
                        {
                            name: 'Pediatrics'
                        },
                        {
                            name: 'General Practice'
                        }
                    ];
                }
            },
            controller: function ($scope) {
                $scope.setProvider = function (idx) {
                    $scope.provider = $scope.availableProviders[idx];
                    $scope.$emit('MiniProviderTile:changed', $scope.provider);
                };
            }
        };
    })
    .directive('pdProviderName', function() {
        return {
            templateUrl: 'pd-tiles/provider/pd-provider-name.html',
            restrict: 'EA',
            replace: true
        };
    })
    .directive('pdProviderNameLink', function($rootScope) {
        return {
            templateUrl: 'pd-tiles/provider/pd-provider-name-link.html',
            restrict: 'EA'
        }
    });
