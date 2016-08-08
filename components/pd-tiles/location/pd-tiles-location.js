'use strict';

angular.module('pdTiles')
    .directive('pdLocationsTile', function () {
        return {
            priority: 5,
            restrict: 'E',
            replace: true,
            templateUrl: 'pd-tiles/location/pd-locations-tile.html',
            scope: {
                // the business related to these locations
                business: '=',
                // the provider that related to these locations
                provider: '=',
                // boolean whether or not map should be shown
                showMap: '='
            },
            link: function (scope) {

                scope.locations = [];

                // set up locations to be used
                if ( scope.business ) {
                    scope.locations = scope.business.locations;
                } else if (scope.provider) {
                    if (scope.provider.affiliations) {
                        _.each(scope.provider.affiliations, function (affiliate) {
                            _.each(affiliate.locations, function (location) {
                                location.businessUuid = affiliate._uuid;
                                scope.locations.push(location);
                            });
                        });
                    } else {
                        scope.locations = scope.provider.locations;
                    }
                }

                // Builds static map img urls
                _buildGoogleMapsImgUrl();

                // Builds links to google maps
                _buildGoogleMapsUrls();

                scope.largeMapImgUrl = _buildLargeMapImgUrl(scope.locations[0]);

                scope.$on('Location:reload', function (evt, location) {
                    scope.largeMapImgUrl = _buildLargeMapImgUrl(location);
                });

                function _buildGoogleMapsImgUrl() {
                    _.each(scope.locations, function (loc, idx) {
                        scope.mapImgUrl += '&markers=color:purple%7Clabel:' + (idx + 1) +
                            '%7C' + loc.geo_location[1] + ',' + loc.geo_location[0];
                    });
                }

                function _buildGoogleMapsUrls() {
                    _.each(scope.locations, function (loc, idx) {
                        scope.locations[idx].gmapUrl = 'http://maps.google.com/?q=' +
                            loc.address_ln1 + ',' +
                            loc.city + ',' +
                            loc.state + ',' +
                            loc.zipcode;
                    });
                }

                function _buildLargeMapImgUrl(location) {
                    return 'https://maps.googleapis.com/maps/api/staticmap?center=' +
                        location.geo_location[1] + ',' + location.geo_location[0] +
                        '&zoom=15&size=400x200&maptype=roadmap' + '&markers=color:purple%7Clabel:' +
                        '%7C' + location.geo_location[1] + ',' + location.geo_location[0];
                }
            }
        };
    })
    .directive('pdLocationTile', function ($timeout) {
        return {
            restrict: 'E',
            replace: true,
            priority: 2,
            templateUrl: 'pd-tiles/location/pd-location-tile.html',
            scope: {
                // {object} - the location you want to render
                location: '=',
                // {object} - a set of options to pass to the pd-address directive inside of the pd-location-tile directive
                addressOptions: '=',
                // boolean - hide the location image
                hideMapImage: '=',
                // boolean - hides the google maps link
                hideGoogleMapsLink: '=',
                // boolean - hides the directions link
                hideDirectionsLink: '=',
                // string - uuid of the business that this location belongs to
                businessUuid: '='
            },
            compile: function() {
                return{
                    pre: function(scope, el, attrs) {

                        var maxAttempts = 5;
                        var attempts = 0;

                        if ( !scope.hideGoogleMapsLink || !scope.hideMapImage ) {
                            _buildGoogleMapsUrl();
                        }

                        if ( !scope.hideDirectionsLink ) {
                            _generateDirectionsUrl();
                        }

                        function _generateDirectionsUrl() {
                            try {
                                scope.location.directionsUrl = 'https://www.google.com/maps/dir//' +
                                                                scope.location.address_ln1 + ',' +
                                                                scope.location.city + ',' +
                                                                scope.location.state + ',' +
                                                                scope.location.zipcode;
                            } catch (e) {
                                if ( !scope.directionsUrl ) {
                                    $timeout(function(){
                                        console.log('try again');
                                        _buildGoogleMapsUrl();
                                    }, 500);
                                }
                            }
                        }

                        function _buildGoogleMapsUrl () {
                            try {
                                scope.location.googleMapsUrl = 'http://maps.google.com/?q=' +
                                                          scope.location.address_ln1 + ',' +
                                                          scope.location.city + ',' +
                                                          scope.location.state + ',' +
                                                          scope.location.zipcode;
                            } catch (e) {
                                if ( !scope.googleMapsUrl ) {
                                    $timeout(function(){
                                        _buildGoogleMapsUrl();
                                    }, 500);
                                }
                            }
                        }
                    }
                }
            }
        };
    })
