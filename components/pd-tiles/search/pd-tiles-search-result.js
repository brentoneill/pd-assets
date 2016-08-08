'use strict';

angular.module('pdTiles')
    .directive('pdSearchResultTile', function () {
        return {
            restrict: 'EA',
            templateUrl: 'pd-tiles/search/pd-search-result-tile.html',
            scope: {
                // Business or provider that owns these appointment slots
                provider: '=',
                // Pokit`
                pokits: '=',
                // whether provider profile images are shown in result
                hideProviderImages: '=',
                // whether provider's available appointment times are shown in result
                hideSchedules: '=',
                // whether clicking on the schedule times opens the appointment workflow
                disableApptLinks: '=',
                searchParams: '='
            },
            link: function (scope) {
                // format name
                if (scope.provider.name) {
                    scope.name = scope.provider.name;
                } else {
                    scope.name = scope.provider.first_name + ' ' + scope.provider.last_name;
                }

                //TODO: get the nearest affiliate location if we're working with a provider, otherwise get the nearest location
                if (scope.provider.affiliations) {
                    scope.location = scope.provider.affiliations[0].locations[0];
                } else {
                    scope.location = scope.provider.locations[0];
                }

                if (_.find(scope.pokits, {
                        _uuid: scope.provider._uuid
                    })) {
                    scope.pokited = true;
                } else {
                    scope.pokited = false;
                }

                if (!scope.provider.specialties.length ) {
                    scope.provider.specialties = [
                        {
                            name: 'Pediatrics'
                        },
                        {
                            name: 'General Practice'
                        }
                    ];
                }
            },
            controller: function ($scope, $state) {
                // schedules the appointment
                $scope.scheduleAppointmentSlot = function (appointmentSlot) {
                    $state.go('app.scheduling.find-appointment', {
                        uuid: appointmentSlot.pd_appointment_uuid
                    });
                };

                // when new appointment is selected from pd-appointment-slots-tile
                $scope.onAppointmentSelect = function (appointment) {
                    $state.go('app.consumer.schedule', {
                        uuid: appointment.pd_appointment_uuid,
                        // temporarily add additional params until platform is hooked up for reals
                        st: appointment.start_date,
                        en: appointment.end_date,
                        lon: appointment.location[0],
                        lat: appointment.location[1],
                        pid: appointment.pd_provider_uuid,
                        apt: appointment.appointment_type
                    });
                };
            }
        };
    });
