angular.module('pdTiles')
    .directive('pdBusinessTile', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'pd-tiles/business/pd-business-tile.html',
            scope: {
                // business that hydrates the template
                business: '=',
                // boolean - hides/shows buttons
                hideButtons: '='
            },
            controller: function ($scope, $state) {

                // var $schedulingForm = angular.element(document.getElementById('schedulingForm'));

                $scope.scheduleAppointment = function () {
                    console.log('trying to schedule');
                };

                $scope.getAQuote = function () {
                    console.log('trying to get a quote for ' + $scope.business.name);
                };
            }
        };
    });
