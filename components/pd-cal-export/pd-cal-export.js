 /**
  * @ngdoc overview
  * @name pdCalExport
  *
  * @description
  * Directive for exporting data to a calendar
  *
  * borrows heavily from https://github.com/jshor/angular-addtocalendar
  */

 'use strict';
 angular.module('pdCalExport', ['ui.bootstrap.dropdown']).config(['$compileProvider', function ($compileProvider) {
         $compileProvider.aHrefSanitizationWhitelist(/^\s*(http(s)?|data):/);
     }])
     /**
      * @ngdoc directive
      * @name pdCalExport
      *
      * @description
      * button to export calendar data to microsoft, google, yahoo, icalendar, and .ics file
      * .ics file export depends on downloadjs https://github.com/rndme/download
      *
      *
      * @example
      * <div pd-cal-export start-date="" end-date="" title="" description="" location=""
      *      btn-text="" class-name=""></div>
      */
     .directive('pdCalExport', function () {
         return {
             restrict: 'E',
             scope: {
                 startDate: '@',
                 endDate: '@',
                 title: '@',
                 description: '@',
                 location: '@',
                 className: '@',
                 btnText: '@'
             },
             controller: 'PDCalExportCtrl',
             templateUrl: 'pd-cal-export/pd-cal-export.html'
         };
     }).controller('PDCalExportCtrl', ['$scope', '$attrs', function ($scope, $attrs) {
         var dfmt = 'YYYYMMDDTHHmmss';
         $scope.description = $scope.description || '';
         var startDate = moment($scope.startDate).format(dfmt) + 'Z';
         var endDate = moment($scope.endDate).format(dfmt) + 'Z';
         var formatIcsText = function (s, maxLength) {
             function _wrap(s) {
                 if (s.length <= maxLength) {
                     return s;
                 }
                 return s.substring(0, maxLength).replace(/\n/g, '\\n') + '\r\n ' + _wrap(s.substring(maxLength), 75);
             }
             return _wrap(s.replace(/\n/g, '\\n'), maxLength);
         };
         buildUrl();
         forEachAttr($attrs, function (key) {
             $attrs.$observe(key, function () {
                 buildUrl();
             });
         });

         function getIcsCalendar() {
             return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', 'CLASS:PUBLIC',
                 'DESCRIPTION:' + formatIcsText($scope.description, 62),
                 'DTSTART:' + startDate,
                 'DTEND:' + endDate,
                 'LOCATION:' + formatIcsText($scope.location, 64),
                 'SUMMARY:' + formatIcsText($scope.title, 66),
                 'TRANSP:TRANSPARENT', 'END:VEVENT', 'END:VCALENDAR'
             ].join('\n');
         }

         function getYahooCalendarUrl() {
             var yahooCalendarUrl = 'http://calendar.yahoo.com/?v=60&view=d&type=20';
             yahooCalendarUrl += '&title=' + encodeURIComponent($scope.title);
             yahooCalendarUrl += '&st=' + encodeURIComponent(startDate) + '&et=' + encodeURIComponent(endDate);
             yahooCalendarUrl += '&desc=' + encodeURIComponent($scope.description);
             yahooCalendarUrl += '&in_loc=' + encodeURIComponent($scope.location);
             return yahooCalendarUrl;
         }

         function getGoogleCalendarUrl() {
             var googleCalendarUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
             googleCalendarUrl += '&text=' + encodeURIComponent($scope.title);
             googleCalendarUrl += '&dates=' + encodeURIComponent(startDate) + '/' + encodeURIComponent(endDate);
             googleCalendarUrl += '&details=' + encodeURIComponent($scope.description);
             googleCalendarUrl += '&location=' + encodeURIComponent($scope.location);
             return googleCalendarUrl;
         }

         function getMicrosoftCalendarUrl() {
             var microsoftCalendarUrl = 'http://calendar.live.com/calendar/calendar.aspx?rru=addevent';
             microsoftCalendarUrl += '&summary=' + encodeURIComponent($scope.title);
             microsoftCalendarUrl += '&dtstart=' + encodeURIComponent(startDate) + '&dtend=' + encodeURIComponent(endDate);
             microsoftCalendarUrl += '&description=' + encodeURIComponent($scope.description);
             microsoftCalendarUrl += '&location=' + encodeURIComponent($scope.location);
             return microsoftCalendarUrl;
         }

         function buildUrl() {
             $scope.calendarUrl = {
                 microsoft: getMicrosoftCalendarUrl(),
                 google: getGoogleCalendarUrl(),
                 yahoo: getYahooCalendarUrl(),
                 icalendar: getIcsCalendar(),
                 dlIcal: dlIcal
             };
         }

         function dlIcal() {
             var fileName = $scope.title.replace(/[^\w ]+/g, '') + '.ics';
             window.download(getIcsCalendar(), fileName, 'application/octet-stream');
         }

         function forEachAttr(attrs, cb) {
             for (var key in attrs) {
                 if (attrs.hasOwnProperty(key) && key.indexOf('$') === -1) {
                     cb(key, attrs[key]);
                 }
             }
         }
     }]);
