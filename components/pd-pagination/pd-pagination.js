'use strict';

angular.module('pdPagination', [])
    .directive('pdPagination', function() {
        return {
            restrict: 'EA',
            templateUrl: 'pd-pagination/pd-pagination.html',
            scope: {
                // { object } - paging configs containing: currentPage, limit (per page), from (start page), pages (an array),
                paging: '=',
                // { function } - fires on page change - either number,
                onPageChange: '='
            },
            link: function (scope, element, attrs) {
            },
            controller: function($rootScope, $scope) {
                $scope.changePage = function(page) {
                    page = page || this.page || 0;
                    if ( page && !$scope.paging.pages[page] ) {
                        return false;
                    }
                    $scope.paging.from = page * $scope.paging.limit;
                    $scope.paging.currentPage = page;
                    $scope.onPageChange && $scope.onPageChange($scope.paging);
                }
            }
        };
    });
