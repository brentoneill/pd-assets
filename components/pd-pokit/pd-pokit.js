'use strict';

angular.module('pdPokit', [
    'ui.bootstrap.popover',
    'pdToast',
    'pdServices'
])
    .factory('PokitService', function ($http, $rootScope, $q, pdToastFactory, Session) {
        var Pokit = {
            categories: [],
            // adds item to the pokit
            addItem: function (itemUUID, itemType, userUUID) {
                var newPokitItem = {
                    _uuid: itemUUID,
                    _type: itemType
                };
                if ( !_.find(Session.currentUser.pokits, { _uuid: itemUUID }) ) {
                    return $http.post('$api/users/' + userUUID + '/pokits', newPokitItem ).then(function(){
                        Session.reload();
                    })
                }
            },
            // removes an item from the pokit
            removeItem: function (itemUUID, userUUID) {
                $http.delete('$api/users/' + userUUID + '/pokits/' + itemUUID)
                    .then(function() {
                        Session.reload();
                        pdToastFactory.createToast({
                            message: 'The item has been removed.',
                            type: 'success'
                        });
                    });
            },
            // gets the whole pokit
            getPokit: function(userUUID) {
                return $http.get('$api/users/' + userUUID + '/pokits');
            },
            // checks to see if item is in pokit
            inPokit: function(userUUID, itemUUID) {
                var self = this,
                    dfd = $q.defer();

                self.getPokit(userUUID)
                    .then(function(res){
                        var pokit = res.data.data;
                        if ( _.find(pokit, { _uuid: itemUUID }) ) {
                            dfd.resolve(true);
                        } else {
                            dfd.resolve(false);
                        }

                    });

                return dfd.promise;
            },
            // maps the pokit to the providers and returns a promise
            mapPokit: function(userUUID) {
                var self = this,
                    dfd = $q.defer(),
                    pokit = [],
                    mappedPokit = [];

                self.getPokit(userUUID)
                    .then(function(res){
                        pokit = res.data.data;
                        if ( pokit.length <= 0 ) {
                            dfd.resolve([]);
                        } else {
                            mappedPokit = [];
                            _.each( pokit, function(item, idx) {
                                var type;

                                if ( item._type.toLowerCase() === 'provider' ) {
                                    type = 'providers';
                                } else if ( item._type.toLowerCase() === 'business' ) {
                                    type = 'providers';
                                }

                                $http.get('$api/' + type + '/' + item._uuid + '?include=specialties' ).then(function(res){
                                    var item = res.data.data;
                                    item.pokited = true;
                                    mappedPokit.push(res.data.data);
                                    if ( idx <= pokit.length - 1 ) {
                                        dfd.resolve(mappedPokit);
                                    }
                                });
                            });
                        }
                    });

                return dfd.promise;
            }
        };
        return Pokit;
    })
    .directive('pdPokitBtn', function ($compile, Session, PokitService) {
        return {
            templateUrl: 'pd-pokit/pd-pokit.html',
            restrict: 'E',
            link: function (scope, element, attrs) {
                var el = element.children().eq(0);

                scope.pokited = attrs.pokited;

                if ( Session.currentUser ) {
                } else {
                    el.attr('uib-popover', 'Please login to use the save feature');
                }

                if ( attrs.tooltipPlacement ) {
                    el.attr('popover-placement', attrs.tooltipPlacement);
                }

                if ( typeof scope.pokited === 'string' ) {
                    if ( scope.pokited === 'true' ) {
                        scope.pokited = true;
                    } else if ( scope.pokited === 'false' ) {
                        scope.pokited = false;
                    }
                }

                $compile(element.contents())(scope);

                // fires on click of the icon + text
                el.on('click', function() {
                    if ( !scope.pokited && Session.currentUser ) {
                        scope.pokited = true;
                        PokitService.addItem(attrs.uuid, attrs.type, Session.currentUser._uuid );
                    } else if ( scope.pokited && Session.currentUser ) {
                        scope.pokited = false;
                        PokitService.removeItem(attrs.uuid, Session.currentUser._uuid);
                    } else if ( !Session.currentUser ) {

                    }
                });

            }
        };
    });
