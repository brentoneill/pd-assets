'use strict';

angular.module('pdServices')
    .factory('GeoLocation', function ($http, $q, $log) {
        var location = {},
            navigatorTimeout = { timeout: 30000 };

        var navigatorError = function (e) {
            $log.warn('Unable to retrieve geolocation from navigator. Getting default locations.');
        };

        location.getLocation = function (coords) {
            // url for geoloc request
            var url = '$api/geolocations';

            // use coordinates if provided, otherwise get user coordinates from navigator
            if (coords) {
                url += '?lat=' + coords[1] + '&lon=' + coords[0];
            } else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (e) {
                    // get browser's location information from navigator
                    url += '?lat=' + e.coords.latitude + '&lon=' + e.coords.longitude;
                }, navigatorError, navigatorTimeout);
            }

            // send promise back
            return $http.get(url);
        };

        location.sortDocumentLocations = function (providers, fromLat, fromLon) {
            var ilen = providers.length;
            for (var i = 0; i < ilen; i++) {
                var jlen = providers[i].locations.length;
                for (var j = 0; j < jlen; j++) {
                    if (providers[i].locations[j].geo_location) {
                        providers[i].locations[j].distance = location.distanceInMiles(
                            fromLat,
                            fromLon,
                            providers[i].locations[j].geo_location[1],
                            providers[i].locations[j].geo_location[0]
                        );
                    }
                }
                providers[i].locations = _.sortBy(providers[i].locations, function (item) {
                    return parseFloat(item.distance);
                });
            }
            return providers;
        };

        location.distanceInMiles = function distanceInMiles(lat1, lng1, lat2, lng2) {
            var R = 6371;
            var dLat = (lat2 - lat1).toRad();
            var dLon = (lng2 - lng1).toRad();
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return (d / 1.609344).toFixed(2);
        };

        return location;
    });
