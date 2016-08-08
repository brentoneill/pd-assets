'use strict';

angular.module('pdActivityCard', [
        'pdConfirm',
        'pdToast',
        'pdLoader'
    ])
    .directive('pdActivityCard', function ($compile, $http, $q, $rootScope, $filter, $state, Session, pdConfirmFactory, pdToastFactory) {
        return {
            scope: {
                // object - the activity that will populate the template
                activity: '=',
                // something
                filter: '=',
                // boolean - whether or not this card is being viewed as businesss
                businessMode: '='
            },
            link: function (scope, element) {

                scope.patient = scope.activity.user;

                // if (scope.activity.dependent) {
                //     scope.activity.patient = _.find(Session.currentUser.dependents, {
                //         _uuid: scope.activity.dependent
                //     });
                //     if (scope.activity.patient) {
                //         scope.insurance = scope.activity.patient.insurance;
                //     }
                //     if (!scope.insurance) {
                //         scope.insurance = Session.currentUser.insurance;
                //     }
                // } else {
                //     scope.activity.patient = Session.currentUser;
                //     scope.insurance = Session.currentUser.insurance;
                // }

                scope.showDetails = false;

                if (scope.activity.provider.specialties && typeof scope.activity.provider.specialties[0] === 'string') {
                    mapSpecialties();
                }

                function mapSpecialties() {
                    _.each(scope.activity.provider.specialties, function (specialty, idx) {
                        var mappedSpecialty = _.find(scope.$parent.specialties, {_uuid: specialty});
                        if (mappedSpecialty) {
                            scope.activity.provider.specialties[idx] = mappedSpecialty.name;
                        }
                    });
                }

                // append the header based on activity type
                element.append('<ng-include src="\'pd-activity-card/pd-' + scope.activity._type.toLowerCase() + '-activity-card' + '.html\'"></ng-include>');

                if (scope.businessMode) {
                    scope.activity.businessMode = true;
                    scope.detailStateRef = 'app.business.dashboard.detail({ uuid: "' +  scope.activity._uuid + '"})';
                } else {
                    scope.formatted = {
                        start: scope.activity.platform_appointment.start_date,
                        end: scope.activity.platform_appointment.end_date,
                        title: $filter('convertAppointmentType')(scope.activity.platform_appointment.appointment_type) + ' at '+ scope.activity.business.name,
                        location: scope.activity.business.name,
                        description: $filter('convertAppointmentType')(scope.activity.platform_appointment.appointment_type) + ' with ' +
                            scope.activity.provider.first_name + ' ' +
                            scope.activity.provider.last_name
                    };
                    scope.detailStateRef = 'app.consumer.settings.appointments.detail({ uuid: "' + scope.activity._uuid + '"})';
                }


                // prefilter dates to reduce number of watchers
                function filterDates () {
                    if ( scope.businessMode ) {
                        scope.activity.startDateDisplay = $filter('formatDate')(scope.activity.platform_appointment.start_date, 'dddd, MMMM Do | h:mma');
                    } else if ( !scope.businessMode ) {
                        scope.activity.startDateDisplay = $filter('formatDate')(scope.activity.platform_appointment.start_date, 'dddd, MMMM Do | h:mma');
                    }
                }

                scope.openCancelModal = function (appointment) {
                    pdConfirmFactory.createConfirm({
                        context: appointment,
                        dismissOverlay: false,
                        templateUrl: 'consumer/appointments/views/_cancel-modal.html',
                        onConfirm: function () {
                            _cancelAppointment(appointment);
                        }
                    });
                };

                function _cancelAppointment(appointment) {
                    var dfd = $q.defer();

                    // blur the item
                    angular.element(element).addClass('blurred');

                    // remove it then show a toast!
                    scope.activityLoaderPromise = $http.delete('$api/appointments/' + appointment._uuid)
                        .then(function () {
                            scope.activityLoaderPromise = Session.reload().then(function () {
                                pdToastFactory.createToast({
                                    message: 'The appointment has been cancelled.',
                                    type: 'success'
                                });
                                dfd.resolve();
                            });
                        });

                    return dfd.promise;
                }

                // filter the dates here for performance gains
                filterDates();

                // recompile the template w/ the updated scope
                $compile(element.contents())(scope);
            }
        };
    })
    .directive('pdCardHeader', function ($filter) {
        return {
            templateUrl: 'pd-activity-card/pd-activity-card-header.html',
            scope: {
                status: '=',
                type: '@',
                // boolean - whether or not this card is being viewed as business
                businessMode: '='
            },
            link: function (scope) {
                scope.activity = scope.$parent.activity;

                _filterData();

                function _filterData () {
                    scope.activity.platform_appointment.appointmentTypeDisplay = $filter('convertAppointmentType')(scope.activity.platform_appointment.appointment_type);
                    scope.activity.startDateDisplay = $filter('formatDate')(scope.activity.platform_appointment.start_date, 'ddd M/D/YYYY');
                    scope.activity.startTimeDisplay = $filter('formatDate')(scope.activity.platform_appointment.start_date, 'hh:mma');
                }

                var updateTemplate = function () {
                    if (scope.type === 'purchase' || scope.type === 'appointment') {
                        scope.iconClass = 'pd-calendar';
                        switch (scope.status) {
                            case 'proposed':
                                scope.headerClass = '';
                                scope.headerMsg = 'Pending Provider Response';
                                break;
                            case 'submitted':
                                scope.headerClass = 'alert-warning';
                                scope.headerMsg = 'Awaiting Your Reply';
                                break;
                            case 'cancelled':
                                scope.headerClass = 'alert-danger';
                                scope.headerMsg = 'Cancelled Appointment';
                                break;
                            case 'requested':
                                scope.headerClass = '';
                                scope.headerMsg = 'Awaiting Confirmation';
                                break;
                            case 'confirmed':
                                scope.headerClass = 'alert-success';
                                scope.headerMsg = 'Upcoming Appointment';
                                break;
                            default:
                                scope.headerClass = '';
                                scope.headerMsg = 'Appointment';
                        }
                        if (scope.type === 'purchase') {
                            scope.headerMsg += ' (paid)';
                        }
                        if (scope.type === 'purchase' && scope.status === 'proposed') {
                            scope.iconClass = 'pd-dollar-inv';
                            scope.headerMsg = 'Pending Provider Response (paid)';
                        }
                    }
                };
                updateTemplate();
                scope.$watch('status', function (newValue) {
                    if (newValue) {
                        updateTemplate();
                    }
                }, true);
            }
        };
    });
