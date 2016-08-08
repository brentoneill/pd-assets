'use strict';

angular.module('pdResourceGrid', [
    'pdSelect',
    'pdUtils',
    'pdLoader',
    'pdScrolling'
    ])
    .directive('pdResourceGrid', function ($http, pdScrollFactory) {
        return {
            restrict: 'E',
            templateUrl: 'pd-resource-grid/pd-resource-grid.html',
            scope: {
                // object - where the key is the field to sort by and the value is the label
                sorts: '=',
                // string - the default sorting option
                defaultSort: '=',
                // hides the sort controls
                hideSortControls: '=',
                // string - the base api URL that you are trying to search/paginate
                apiUrl: '=',
                // string - ui-sref for the state for the detail view
                detailViewState: '=',
                // string - the template for an individul row
                rowTemplateUrl: '=',
                // string - the template for an individul grid item
                gridTemplateUrl: '=',
                // string - the default query to run on load
                defaultQuery: '@',
                // boolean - controls hiding/showing of query box and buttons
                hideQuery: '=',
                // boolean - controls hiding/showing of grid controls
                hideGridControls: '=',
                // array - an array of possible page sizes
                pageSizes: '=?bind',
                // string - the resource type you are trying to display
                resourceType: '=?bind',
                // string - path to the loader gif
                // boolean - whether or not to show results in a panel view
                panelView: '=',
                // boolean - whether or not to show paging controls at the bototm of the results area
                topPaging: '=',
                // function - to fire after successful search
                afterSearch: '=',
                // function - to fire after an erroneous search
                onError: '=',
                // function - fire after search to massage data. must return some data
                massageData: '='
            },
            link: function(scope) {

                // show the list view by default
                scope.showList = true;

                // switches to a grid view
                //// hides paging controls, infinite scroll?
                scope.switchToGrid = function () {
                    scope.showList = false;
                    scope.showGrid = true;
                };

                // switches to a list view
                //// show paging controls, remove infinite scroll?
                scope.switchToList = function () {
                    scope.showList = true;
                    scope.showGrid = false;
                };

                if ( !scope.pageSizes ) {
                    scope.pageSizes = [ 5, 10, 20 ];
                }

                if ( !scope.resourceType ) {
                    scope.resourceType = 'Items';
                }

                // if ( scope.sorts ) {
                //     for ( var key in scope.sorts ) {
                //         console.log(scope.sorts[key]);
                //     }
                // }
            },
            controller: function ($scope, $element, $attrs, $location) {

                $scope.items = [];

                $scope.query = $location.search().q;

                $scope.$on('RescourceGrid:reload', function() {
                    $scope.load();
                });

                $scope.$on('$locationChangeSuccess', function () {
                    $scope.query = $location.search().q;
                });

                $scope.params = {
                    offset: parseInt($location.search().offset) || 0,
                    limit: parseInt($location.search().limit) || 5
                };

                if ( $scope.defaultSort ) {
                    $scope.params.sort = $scope.defaultSort;
                }

                $scope.sort = function (sortKey) {
                    if ( $scope.items.length > 0 ) {
                        if ($scope.params.sort === sortKey) {
                            $scope.params.dir = $scope.params.dir === 'asc' ? 'desc' : 'asc';
                        } else {
                            $scope.params.sort = sortKey;
                            $scope.params.dir = 'asc';
                        }
                        $scope.load();
                    }
                };

                $scope.page = function (dir) {
                    var res = $scope.params.offset + (parseInt(dir) * $scope.params.limit);
                    if (res < 0 && res !== $scope.params.limit * -1) {
                        res = 0;
                    }
                    if (0 <= res && res < $scope.total) {
                        $scope.params.offset = res;
                        $scope.load();
                    }
                };


                $scope.updateUrl = function() {
                    if ( $scope.query ) {
                        $location.search('q', $scope.query);
                    } else {
                        $scope.query = '';
                        $location.search('q', $scope.query);
                    }
                    if ( $scope.params ) {
                        for ( var param in $scope.params ) {
                            if ( param ) {
                                $location.search(param, $scope.params[param]);
                            }
                        }
                    }
                };

                $scope.reset = function() {
                    $scope.query = '';
                    $scope.params.offset = 0;
                    $scope.load();
                };

                $scope.load = function () {
                    $scope.searchInProgress = true;

                    var defaultQuery = '',
                        queryPrefix = '?';

                    if($scope.apiUrl.indexOf('?') !== -1) {
                        queryPrefix = '&';
                    }

                    if ( $scope.defaultQuery ) {
                        defaultQuery = ' AND ' + $scope.defaultQuery;
                    }

                    $scope.updateUrl();
                    $scope.loaderPromise = $http.get($scope.apiUrl + queryPrefix + 'q=' + $scope.query, {
                            params: $scope.params
                        }).success(function (res) {
                            $scope.items = res.data;
                            if ( $scope.massageData ) {
                                $scope.items = $scope.massageData($scope.items);
                            }
                            $scope.total = res.meta.result_count;
                            $scope.pageLimit = getPageLimit();
                            $scope.searchInProgress = false;
                            $scope.afterSearch && $scope.afterSearch(res);
                            pdScrollFactory.scrollTo(0, 0);
                            // $scope.itemsJSON = JSON.stringify($scope.items, null, 4);
                        }).error(function (res) {
                            $scope.error = res;
                            $scope.onError && $scope.onError(res);
                        });


                };

                function getPageLimit() {
                    var pageLimit = parseInt($scope.params.offset) + parseInt($scope.params.limit);
                    if ($scope.total < pageLimit) {
                        return $scope.total;
                    }
                    return pageLimit;
                }

                $scope.pageLimit = getPageLimit();

                $scope.load();
            }
        };
    });
