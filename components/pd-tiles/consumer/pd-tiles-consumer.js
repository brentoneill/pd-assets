'use strict';

angular.module('pdTiles')
    .directive('pdConsumerTile', function() {
        return {
            restrict: 'E',
            priority: 2,
            templateUrl: 'pd-tiles/consumer/pd-consumer-tile.html',
            scope: {
                // object - the user you want to display
                consumer: '=',
                // boolean - whether this is a complete view or not - complete means all fields shown
                completeView: '=',
                // boolean - if true, HIDE profile image
                hideProfileImg: '=',
                // string - side of the card to proifle image on - left or right. defaults to left
                profileImgPlacement: '=',
                // boolean - if true, HIDE number of dependents
                hideDependents: '=',
                // boolean - if true, HIDE insurance info
                hideInsurance: '=',
                // boolean - if true, HIDE phone number
                hidePhoneNumber: '=',
                // boolean - if true, HIDE date of birth
                hideDob: '=',
                // boolean - if true, HIDE gender
                hideGender: '=',
                // boolean - if true, HIDE email link
                hideEmail: '=',
                // boolean - if true, SHOW the dependents table
                showDependentsTable: '=',
                // string - space separated list of classes to apply
                consumerTileClasses: '@'
            }
        }
    })
    .directive('pdInsuranceInfo', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'pd-tiles/consumer/pd-insurance-info.html',
            scope: {
                // object - the insurance information from a consumer
                insurance: '=',
                // boolean - hide member ID
                hideMemberId: '=',
                // string - space separated list of classes to apply to the pd-insurance-tile
                insuranceTileClasses: '@'
            }
        }
    })
    .directive('pdDependentsList', function() {
        return {
            restrict: 'E',
            templateUrl: 'pd-tiles/consumer/pd-dependents-list.html',
            scope: {
                // array - a list of dependents to display
                dependents: '='
            }
        }
    })
