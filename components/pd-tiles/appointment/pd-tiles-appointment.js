'use strict';

angular.module('pdTiles')
    .directive('pdAppointmentTile', function ($filter, $state, $http, $q, pdConfirmFactory, pdToastFactory, Session) {
        return {
            restrict: 'E',
            priority: 0,
            templateUrl: 'pd-tiles/appointment/pd-appointment-tile.html',
            scope: {
                // Instance of an appointment to populate template
                appointment: '=',
                // Controls hiding and showing of certain elements when in detail view
                detailView: '=',
                // Controls hiding and showing of certain elements when in list view
                listView: '='
            },
            link: function (scope, el) {
                scope.formatted = {
                    start: scope.appointment.platform_appointment.start_date,
                    end: scope.appointment.platform_appointment.end_date,
                    title: $filter('convertAppointmentType')(scope.appointment.platform_appointment.appointment_type) + ' at '+ scope.appointment.business.name,
                    location: scope.appointment.business.name,
                    description: $filter('convertAppointmentType')(scope.appointment.platform_appointment.appointment_type) + ' with ' +
                        scope.appointment.provider.first_name + ' ' +
                        scope.appointment.provider.last_name
                };
                // remap to another variable to make templating easier
                scope.platform_appointment = scope.appointment.platform_appointment;
                scope.provider = scope.appointment.provider;

                // TODO: get this location from the include that comes back dereferenced
                scope.location = scope.appointment.business.locations[0];
                scope.business = scope.appointment.business;

                // set the patient and insurance whether or not dependent is attached to appointment
                if (scope.appointment.dependent) {
                    scope.patient = _.find(Session.currentUser.dependents, {
                        _uuid: scope.appointment.dependent
                    });
                    if (scope.patient) {
                        scope.insurance = scope.patient.insurance;
                    }
                } else {
                    // scope.patient = scope.appointment.user;
                    scope.patient = Session.currentUser;
                    // scope.insurance = scope.appointment.user.insurance;
                    scope.insurance = Session.currentUser.insurance;
                }

                _generateDirectionsUrl(scope.location);
                _filterData();
                if (scope.provider.specialties && typeof scope.provider.specialties[0] === 'string') {
                    _mapSpecialties();
                }

                // generates the google maps directions URL for the appointment location
                function _generateDirectionsUrl(location) {
                    scope.apptDirectionsUrl = 'https://www.google.com/maps/dir//' +
                        location.address_ln1 + ',' +
                        location.city + ',' +
                        location.state + ',' +
                        location.zipcode;
                }

                function _mapSpecialties() {
                    _.each(scope.provider.specialties, function (specialty, idx) {
                        var mappedSpecialty = _.find(scope.$parent.specialties, {_uuid: specialty});
                        if (mappedSpecialty) {
                            scope.provider.specialties[idx] = mappedSpecialty.name;
                        }
                    });
                }

                function _filterData() {
                    scope.appointment.appointmentTypeDisplay = $filter('convertAppointmentType')(scope.platform_appointment.appointment_type);
                    scope.appointment.startDateDisplay = $filter('date')(scope.platform_appointment.start_date, 'EEE M/d/yyyy');
                    scope.appointment.startTimeDisplay = $filter('date')(scope.platform_appointment.start_date, 'hh:mma', '-0800');
                }

                scope.openCancelModal = function (appointment) {
                    pdConfirmFactory.createConfirm({
                        context: appointment,
                        dismissOverlay: false,
                        templateUrl: 'consumer/appointments/views/_cancel-modal.html',
                        onConfirm: function () {
                            _cancelAppointment(appointment)
                                .then(function () {
                                    if ($state.current.name === 'app.consumer.settings.appointments.detail') {
                                        $state.go('app.consumer.settings.appointments.list');
                                    }
                                });
                        }
                    });
                };

                function _cancelAppointment(appointment) {
                    var dfd = $q.defer();
                    scope.appointmentLoaderPromise = $http.delete('$api/users/' + Session.currentUser._uuid + '/appointments/' + appointment._uuid)
                        .then(function () {
                            Session.reload().then(function () {
                                pdToastFactory.createToast({
                                    message: 'The appointment has been cancelled.',
                                    type: 'success'
                                });
                                dfd.resolve('appointment cancelled');
                            });
                        });

                    return dfd.promise;
                }

            },
            controller: function ($scope, $state) {
                $scope.rescheduleAppointment = function (appointment) {
                    $state.go('app.consumer.reschedule.find', {
                        uuid: appointment._uuid
                    });
                };
            }
        };
    })

    .directive('pdScheduleControlTile', function($filter, $rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'pd-tiles/appointment/pd-schedule-control-tile.html',
            scope: {
                standAlone: '='
            },
            link: function(scope) {
                scope.dateOffset = 0;

                scope.getWeek = function (offset) {
                    // update schedule date offset in scope (no past dates available in search)
                    if (offset !== undefined && scope.dateOffset + offset >= 0) {
                        scope.dateOffset = scope.dateOffset + offset;
                    }
                    // get week in order starting with start date (today plus offset)
                    var startDate = moment().add(scope.dateOffset, 'days'),
                        weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                        weekdays = [];
                    // remove other date information (hours, minutes, etc.) to have general day
                    startDate.hours(0).minutes(0).seconds(0).milliseconds(0);
                    // get next five weekdays
                    for (var i = 0; i < 5; i++) {
                        weekdays.push(moment(startDate).add(i, 'days'));
                    }
                    return _.map(weekdays, function (date) {
                        return {
                            name: weekdayNames[date.weekday()],
                            date: date.toJSON(),
                            displayDay: $filter('date')(date.toJSON(), 'EEE'),
                            displayDate: $filter('date')(date.toJSON(), 'M/d')
                        };
                    });
                };
                scope.weekdays = scope.getWeek(0);
                if ( !scope.standAlone ) {
                    $rootScope.$broadcast('Appointments:reload', scope.weekdays, false);
                }
            },
            controller: function($scope, $rootScope) {

                $scope.previousWeek = function () {
                    $scope.weekdays = $scope.getWeek(-5);
                };

                $scope.nextWeek = function () {
                    $scope.weekdays = $scope.getWeek(5);
                };

                $scope.nextWeekClicked = function () {
                    $scope.nextWeek();
                    $rootScope.$broadcast('Appointments:reload', $scope.weekdays, true);
                };

                $scope.previousWeekClicked = function () {
                    $scope.previousWeek();
                    $rootScope.$broadcast('Appointments:reload', $scope.weekdays, true);
                };
            }
        };
    })

    .directive('pdAppointmentSlotsTile', function ($filter) {
        return {
            restrict: 'E',
            templateUrl: 'pd-tiles/appointment/pd-appointment-slots-tile.html',
            scope: {
                // current appointment to highlight date and time
                currentAppointment: '=',
                // a provider uuid that loads the template
                providerUuid: '=',
                // Boolean that hides/shows arrow controls and dates at text-top
                hideControls: '=',
                // Boolean that hides/shows the 'Show more times' button
                hideShowMoreBtn: '=',
                // Text for the 'Show more times button', defaults to 'shows more times'
                showMoreTimesBtnText: '=?bind',
                // A header or for the appt times widget
                header: '=?bind',
                // Boolean that allows hiding of the header if set to true
                hideHeader: '=',
                // max number of time slots to show
                rowsToShow: '=?bind',
                // search Params to watch
                searchParams: '=',
                // whether clicking on the schedule times opens the appointment workflow
                disableApptLinks: '=',
                // watch model
                watchModel: '=',
                onSelect: '='
            },
            link: function (scope) {

                if (!scope.showMoreTimesBtnText) {
                    scope.showMoreTimesBtnText = 'Show more times';
                }

                if (!scope.rowsToShow) {
                    scope.rowsToShow = 4;
                }

                scope.showMoreTimesBtn = false;

                scope.mapAppointments = function (appointments) {
                    var mappedAppointments = {};
                    _.each(scope.weekdays, function (day) {
                        mappedAppointments[day.date] = [];
                        _.each(appointments, function (appointment) {
                            var apptDate = moment(appointment.start_date).hours(0).minutes(0).seconds(0).milliseconds(0).toJSON();
                            if (apptDate === day.date) {
                                appointment.startDateDisplay = $filter('formatDate')(appointment.start_date, 'h:mma');
                                mappedAppointments[day.date].push(appointment);
                            }
                        });
                        mappedAppointments[day.date] = _.sortBy(mappedAppointments[day.date], 'start_date');
                    });
                    return mappedAppointments;
                };
            },
            controller: function ($scope, $state, $http) {

                // listening for change events
                // this event is fired by the schedule control
                $scope.$on('Appointments:reload', function (e, days, reload) {
                    $scope.weekdays = days;
                    if ( reload ) {
                        $scope.getAppointments();
                    }
                });

                if ( $scope.watchModel ) {
                    $scope.$watchCollection('searchParams', function(newVals, oldVals) {
                        if ( newVals !== oldVals && $scope.appointments) {
                            $scope.getAppointments();
                        }
                    });
                }

                $scope.dateOffset = 0;

                $scope.getWeek = function (offset) {
                    // update schedule date offset in scope (no past dates available in search)
                    if (offset !== undefined && $scope.dateOffset + offset >= 0) {
                        $scope.dateOffset = $scope.dateOffset + offset;
                    }
                    // get week in order starting with start date (today plus offset)
                    var startDate = moment().add($scope.dateOffset, 'days'),
                        weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                        weekdays = [];
                    // remove other date information (hours, minutes, etc.) to have general day
                    startDate.hours(0).minutes(0).seconds(0).milliseconds(0);
                    // get next five weekdays
                    for (var i = 0; i < 5; i++) {
                        weekdays.push(moment(startDate).add(i, 'days'));
                    }
                    return _.map(weekdays, function (date) {
                        return {
                            name: weekdayNames[date.weekday()],
                            date: date.toJSON(),
                            displayDay: $filter('date')(date.toJSON(), 'EEE'),
                            displayDate: $filter('date')(date.toJSON(), 'M/d')
                        };
                    });
                };

                $scope.weekdays = $scope.getWeek(0);

                // send the user on their scheduling journey when they click a time slot
                $scope.scheduleAppointment = function (appointment) {
                    $scope.onSelect && $scope.onSelect(appointment);
                };

                $scope.toggleMoreTimes = function () {
                    $scope.moreTimesShown = !$scope.moreTimesShown;
                };

                // debounce the appointment gets
                $scope.getAppointments = _.debounce(loadAppointments, 400, true);

                // load initial appointment data
                loadAppointments();

                function loadAppointments() {
                    $scope.showMoreTimesBtn = false;
                    if ( $scope.providerUuid && $scope.searchParams.appointment_type.platform_id && $scope.searchParams.location.geo_location && $scope.weekdays ) {
                        $scope.apptPromise = $http.post('$api/search/appointments', {
                            provider_uuid: $scope.providerUuid,
                            appointment_type: $scope.searchParams.appointment_type.platform_id,
                            geolocation: $scope.searchParams.location.geo_location,
                            start_dt: $scope.weekdays[0].date,
                            end_dt: $scope.weekdays[$scope.weekdays.length - 1].date
                        }).then(function (res) {
                            $scope.appointments = $scope.mapAppointments(res.data.data);
                            if ($scope.appointments) {
                                $scope.showGrid = true;
                                $scope.showMoreTimesBtn = true;
                            }
                        });
                    }
                }
            }
        };
    })
    .directive('pdAppointmentInfo', function() {
        return {
            restrict: 'EA',
            templateUrl: 'pd-tiles/appointment/pd-appointment-info.html',
            scope: {
                // { object } - the appointment object with the info you want to display
                appointment: '=',
                // { boolean } - hides the appointment type
                hideAppointmentType: '=',
                // { boolean } - hides the returning patient field
                hideReturningPatient: '=',
                // { boolean } - hides the patient name
                hidePatientName: '=',
                // { boolean } - hides the appointment comments
                hideComments: '=',
                // { boolean } - hides the insurance information
                hideInsurance: '=',
                // { boolean } - limits the comments length and show ellipsis
                limitComments: '='
            }
        };
    })
