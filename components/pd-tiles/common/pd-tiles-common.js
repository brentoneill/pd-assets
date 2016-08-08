'use strict'

angular.module('pdTiles')
    .directive('pdAddress', function($timeout) {
        return {
            templateUrl: 'pd-tiles/common/pd-address.html',
            restrict: 'EA',
            priority: 2,
            scope: {
                // string - a space separated list of classes to apply to the <address> element
                addressClasses: '@',
                // object - the location you want to display
                location: '=',
                // string - uuid of the business to generate business link
                businessUuid: '=',
                // boolean - hhides the phone number link
                hidePhoneNumber: '=',
                // boolean - hides location name
                hideName: '=',
                // boolean - hides the google maps link
                hideGoogleMapsLink: '='
            },
            link: function(scope) {

                if (!scope.hideGoogleMapsLink) {
                    try {
                        _buildGoogleMapsUrl()
                    } catch (e) {
                        console.error(e);
                        if ( !scope.location.googleMapsUrl ) {
                            $timeout(function() {
                                _buildGoogleMapsUrl();
                            }, 500)
                        }
                    }
                }

                function _buildGoogleMapsUrl () {
                    scope.location.googleMapsUrl = 'http://maps.google.com/?q=' +
                                              scope.location.address_ln1 + ',' +
                                              scope.location.city + ',' +
                                              scope.location.state + ',' +
                                              scope.location.zipcode;
                }
            }
        };
    })
    .directive('pdSocialLinks', function() {
        return {
            templateUrl: 'pd-tiles/common/pd-social-links.html',
            restrict: 'EA',
            link: function(scope) {
                if ( scope.provider ) {
                    scope.entity = angular.copy(scope.provider);
                } else if ( scope.business ) {
                    scope.entity = angular.copy(scope.business);
                }
            }
        };
    })
    .directive('pdProfileImg', function($timeout) {
        return {
            templateUrl: 'pd-tiles/common/pd-profile-img.html',
            restrict: 'EA',
            scope: {
                // object - the entity that that you want a profile image for - consumer, provider, business, location
                entity: '=',
                // string - a space serapated list of classes to apply to the profile image
                imageClasses: '@',
                // boolean - whether or not the entity is a location
                location: '='
            },
            link: function(scope) {


            },
            controller: function($scope) {

                var maxAttempts = 5;
                var attempt = 0;

                if ( $scope.location ) {
                    _buildGoogleMapsImageUrl();
                }

                // Builds the large map img url w/ a marker
                function _buildGoogleMapsImageUrl () {
                    attempt++;
                    try {
                        $scope.entity.googleMapsImageUrl = 'https://maps.googleapis.com/maps/api/staticmap?center=' +
                                                    $scope.entity.geo_location[1] + ',' + $scope.entity.geo_location[0] +
                                                    '&zoom=15&size=100x100&maptype=roadmap' + '&markers=color:purple%7Clabel:' +
                                                    '%7C' + $scope.entity.geo_location[1] + ',' + $scope.entity.geo_location[0];
                    } catch(e) {
                        if ( attempt <= maxAttempts ) {
                            $timeout(function() {
                                _buildGoogleMapsImageUrl();
                            }, 500);
                        }
                    }
                };
            }
        };
    })
    .directive('pdSpecialtyList', function() {
        return {
            templateUrl: 'pd-tiles/common/pd-specialty-list.html',
            restrict: 'EA',
            link: function(scope) {
                if ( scope.provider ) {
                    scope.entity = angular.copy(scope.provider);
                } else if ( scope.business ) {
                    scope.entity = angular.copy(scope.business);
                }
            }
        };
    })
    .directive('pdDescriptionTile', function () {
        return {
            restrict: 'EA',
            templateUrl: 'pd-tiles/common/pd-description-tile.html'
        };
    });
