'use strict';

angular.module('pdServices')
    .factory('GeoLocation', function ($http) {
        var location = {
            lat: false,
            lon: false,
            cityState: ''
        };
        location.refreshLocation = function (callback) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (e) {
                    location.lat = e.coords.latitude;
                    location.lon = e.coords.longitude;
                    $http.get('$api/geolocations?lat=' + location.lat + '&lon=' + location.lon)
                        .success(function (res) {
                            console.log(res);
                            location.city = res.data.city;
                            location.state = res.data.state;
                            callback && callback();
                        });
                }, callback);
            }
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
