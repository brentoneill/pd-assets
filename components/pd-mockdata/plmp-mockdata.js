'use strict';

/**
 * Provides mockdata for the PLMP
 *
 * Configures a angularHTTPMock module to handle most resources with the `resources` list, also handles data
 * bootstrapping of resources. Custom url mappings are handled by the `mappings` list.
 */
angular.module('plmpMockData', ['angularHTTPMock', 'ngStorage'])
    .value('plmpDefaultApp', {
        _uuid: 'e0505945-c9f2-49ef-a410-9cea603b357a',

        // app config: general settings
        name: 'My Marketplace',
        slug: 'my-marketplace',
        urls: {
            live: 'https://my-marketplace.pdmarketplace.com/',
            staging: 'https://staging-my-marketplace.pdmarketplace.com/'
        },
        required_before_app_use: {
            login: false,
            identity_verification: true,
            email_verification: true,
            phone_verification: true
        },
        // app config: features
        features: {
            pokit: {
                title: 'My Pokit',
                enabled: true
            },
            activities: {
                title: 'My Activity'
            },
            dependents: {
                enabled: true
            },
            payment_methods: {
                enabled: true
            },
            scheduling: {
                title: 'My Appointments',
                required_before_submit: {
                    email_verification: true,
                    phone_verification: true
                },
                cancellation: {
                    enabled: true,
                    time_limit: 86400
                },
                fields: {
                    name: {
                        enabled: true,
                        required: true
                    },
                    patient_status: {
                        enabled: true,
                        required: true
                    },
                    phone: {
                        enabled: true,
                        required: true
                    },
                    insurance: {
                        enabled: true,
                        required: true
                    }
                }
            },
            signup: {
                fields: {
                    name: {
                        enabled: true,
                        required: true
                    },
                    email: {
                        enabled: true,
                        required: true
                    },
                    phone: {
                        enabled: true,
                        required: true
                    },
                    insurance: {
                        enabled: true,
                        required: true
                    }
                },
                facebook_signup: false,
                insurance_signup: true
            },
            security: {
                two_factor_auth: {
                    enabled: false,
                    required: false
                },
                device_monitoring: {
                    enabled: true,
                    unrecognized_device_notification: true,
                    unrecognized_device_confirmation: true
                },
                account_recovery: {
                    enabled: true
                }
            }
        },
        provider_signup: {
            enabled: false
        },
        // app config: theming
        theming: {
            full_logo: {
                thumbnail: 'http://s3.pokitdok.com/image_path.png',
                '70x70': 'http://s3.pokitdok.com/image_path.png',
                '120x120': 'http://s3.pokitdok.com/image_path.png',
                original_size: 'http://s3.pokitdok.com/image_path.png'
            },
            fonts: {
                primary: 'Muli',
                secondary: 'Montserrat'
            },
            colors: {
                primary: '#000',
                secondary: '#000',
                body: {
                    background: '#000',
                    text: '#000',
                    link: '#000'
                },
                panel: {
                    background: '#000',
                    text: '#000',
                    link: '#000'
                },
                header: {
                    background: '#000',
                    text: '#000',
                    link: '#000'
                },
                drawer: {
                    background: '#000',
                    text: '#000',
                    link: '#000'
                },
                footer: {
                    background: '#000',
                    text: '#000',
                    link: '#000'
                }
            },
            layouts: {
                header: {
                    items: []
                },
                footer: {
                    items: []
                },
                drawer: {
                    items: ['pokit', 'scheduling', 'activities'] // these should match keys in features
                },
                landing_page: {
                    type: 'search', // validate: one of 'search', 'login', 'search_results', 'business'
                    default_appointment_uuid: '15630eb2-7ff5-4dcb-be6f-301ecd37a72e', // if type is search_results
                    business_uuid: '', // if type is business
                    title: 'Welcome to My Marketplace',
                    text: 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit.',
                    hero_img: {
                        thumbnail: 'http://s3.pokitdok.com/image_path.png',
                        '70x70': 'http://s3.pokitdok.com/image_path.png',
                        '120x120': 'http://s3.pokitdok.com/image_path.png'
                    },
                    features: [{
                        title: 'Shop, Book, & Pay',
                        description: 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit.',
                        img: {
                            thumbnail: 'http://s3.pokitdok.com/image_path.png',
                            '70x70': 'http://s3.pokitdok.com/image_path.png',
                            '120x120': 'http://s3.pokitdok.com/image_path.png',
                            original_size: 'http://s3.pokitdok.com/image_path.png'
                        }
                    }, {
                        title: 'Shop, Book, & Pay',
                        description: 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit.',
                        img: {
                            thumbnail: 'http://s3.pokitdok.com/image_path.png',
                            '70x70': 'http://s3.pokitdok.com/image_path.png',
                            '120x120': 'http://s3.pokitdok.com/image_path.png',
                            original_size: 'http://s3.pokitdok.com/image_path.png'
                        }
                    }, {
                        title: 'Shop, Book, & Pay',
                        description: 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit.',
                        img: {
                            thumbnail: 'http://s3.pokitdok.com/image_path.png',
                            '70x70': 'http://s3.pokitdok.com/image_path.png',
                            '120x120': 'http://s3.pokitdok.com/image_path.png',
                            original_size: 'http://s3.pokitdok.com/image_path.png'
                        }
                    }]
                },
                search_results: {
                    providers: {
                        image: {
                            enabled: true
                        },
                        schedule: {
                            enabled: true
                        }
                    },
                    services: {
                        images: {
                            enabled: true
                        }
                    }
                },
                provider_detail: {
                    provider_image: {
                        enabled: true
                    },
                    biography: {
                        enabled: true
                    },
                    licenses: {
                        enabled: true
                    },
                    schedule: {
                        enabled: true
                    }
                }
            }
        },
        // app config: notifications
        notifications: {
            scheduling: {
                notify_via: ['email', 'phone'],
                before_appointment: {
                    time_in_advance: 86400,
                    subject: 'Reminder of Upcomming Appointment',
                    text: 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit.',
                }
            }
        },
        // app config: widgets
        widgets: {
            navigation: {
                enabled: true
            },
            footer: {
                enabled: true
            }
        },

        // appointment types
        appointment_types: [{
            type: 'OV1',
            appointment_type_uuid: faker.random.uuid(),
            description: 'Office Visit'
        }, {
            type: 'PC1',
            appointment_type_uuid: '15630eb2-7ff5-4dcb-be6f-301ecd37a72e',
            description: 'Routine Preventive Care'
        }, {
            type: 'OP1',
            appointment_type_uuid: faker.random.uuid(),
            description: 'Optometry'
        }, {
            type: 'OP2',
            appointment_type_uuid: faker.random.uuid(),
            description: 'Ophthalmology'
        }, {
            type: 'RI1',
            appointment_type_uuid: faker.random.uuid(),
            description: 'Retina Imaging'
        }]
    })
    .service('PLMPMockData', function ($localStorage, plmpDefaultApp) {
        var storageKey = 'plmp',
            apiPrefix = '/api/v4';

        var avatars = [
            '../../assets/images/doctor_1.jpg',
            '../../assets/images/doctor_2.jpg',
            '../../assets/images/doctor_3.jpg',
            '../../assets/images/doctor_4.jpg',
            '../../assets/images/doctor_5.jpg',
            '../../assets/images/doctor_6.jpg'
        ];

        var fixtures = {
            plmpDefaultApp: plmpDefaultApp,
            plmpDefaultUser: {
                _uuid: '45da76ae-a5e4-4c32-bafb-262f17f43d8b',
                email: 'Dale@dalesdeadbug.com',
                email_verified: false,
                email_confirmed: false,
                phone_verified: false,
                first_name: 'Dale',
                last_name: 'Gribble',
                avatar: {
                    url: '../../assets/images/dale_gribble.png'
                },
                city: 'Charleston',
                state: 'SC',
                zipcode: 29401,
                phone: faker.phone.phoneNumber(),
                providers: [
                    makeProvider()
                ],
                birth_date: '1984-02-20T05:00:00.000Z',
                gender: 'male',
                insurance: {
                    trading_partner_name: faker.company.companyName(),
                    member_id: 'JD376VB682201',
                    birth_date: '1984-02-20T05:00:00.000Z',
                    dependents: [
                        makeDependent(),
                        makeDependent()
                    ]
                },
                email_notifications: true,
                sms_notifications: true,
                two_factor_enabled: false,
                user_sessions: [{
                    location: {
                        city: 'Charleston',
                        ip: '12.123.123.123'
                    },
                    current_session: true
                }, {
                    location: {
                        city: 'Charlotte',
                        ip: '12.123.123.123'
                    }
                }],
                payments: [
                    {
                        card_type: 'Visa',
                        card_number: '411111******1111',
                        card_holder: 'Valerie J. Thompson'
                    },
                    {
                        card_type: 'Mastercard',
                        card_number: '411111******1111',
                        card_holder: 'David T. Herrington'
                    },
                    {
                        card_type: 'Visa',
                        card_number: '411111******1111',
                        card_holder: 'Ella K. Fields'
                    }
                ]
            }
        }; // end fixtures
        fixtures.plmpDefaultUser.appointments = [
            faker.random.uuid(),
            faker.random.uuid(),
            faker.random.uuid(),
            faker.random.uuid()
        ];

        function randomAvatar() {
            if (avatars.length === 0) {
                return faker.internet.avatar();
            }
            var ndex = Math.floor(Math.random() * avatars.length);
            var rando = avatars[ndex];
            avatars.splice(ndex, 1);
            return rando;
        }

        function makeProvider() {
            return {
                _uuid: faker.random.uuid(),
                name: faker.name.findName(),
                specialties: ['Opthamology', 'General Office Visit'],
                organization_name: faker.company.companyName(),
                medium_img_url: randomAvatar(),
                gender: Math.random() > 0.5 ? 'female' : 'male',
                saved: Math.random() > 0.5,
                locations: [{
                    address_ln1: faker.address.streetAddress(),
                    address_ln2: faker.address.secondaryAddress(),
                    city: faker.address.city(),
                    state: faker.address.stateAbbr(),
                    zipcode: faker.address.zipCode(),
                    phone: faker.phone.phoneNumber()
                }, {
                    address_ln1: faker.address.streetAddress(),
                    address_ln2: faker.address.secondaryAddress(),
                    city: faker.address.city(),
                    state: faker.address.stateAbbr(),
                    zipcode: faker.address.zipCode(),
                    phone: faker.phone.phoneNumber()
                }]
            };
        }

        function makeDependent() {
            return {
                _uuid: faker.random.uuid(),
                first_name: faker.name.firstName(),
                last_name: faker.name.lastName(),
                gender: Math.random() > 0.5 ? 'female' : 'male',
                birth_date: faker.date.past()
            };
        }

        function makeAppointment(future, booked, uuid, apptData, bookedData) {
            var provider = _.sample(fixtures.plmpDefaultUser.providers);
            var generatedUUID = faker.random.uuid();
            var start, end;

            if (future) {
                start = faker.date.future();
                end = faker.date.future();
            } else {
                start = faker.date.past();
                end = faker.date.past();
            }

            var appt = {
                _uuid: uuid ? uuid : generatedUUID,
                pd_appointment_uuid: uuid ? uuid : generatedUUID,
                pd_provider_uuid: provider._uuid,
                provider_scheduler_uuid: faker.random.uuid(),
                appointment_id: 'AYTJCMNKWUXT',
                appointment_type: _.sample(plmpDefaultApp.appointment_types),
                start_date: start,
                end_date: end,
                booked: booked || false,
                location: provider.locations[0],
                locations: provider.locations,
                provider: provider
            };

            if (apptData) {
                if (_.has(apptData, 'provider')) {
                    appt.pd_provider_uuid = apptData.provider._uuid;
                    appt.provider = apptData.provider;
                    appt.location = apptData.provider.locations[0];
                    appt.locations = apptData.provider.locations;
                }
                if (_.has(apptData, 'timeSlot')) {
                    appt.start_date = apptData.timeSlot.toISOString();
                    appt.end_date = moment({
                        date: apptData.timeSlot.date(),
                        hours: apptData.timeSlot.hours() + 1
                    }).toISOString();
                }
            }

            if (bookedData) {
                _.extend(appt, bookedData);
            }

            return appt;
        }

        function makeRandomAppointments(appointmentTypes, providers) {
            var appointments = [],
                validTimeSlots = generateValidTimes(),
                maxDateOfMonthToGenerate;

            function generateValidTimes() {
                var validHours = [10, 13, 15, 17],
                    daysToGenerateCount = 14,
                    startDay = moment().date(),
                    validTimes = [];

                function generateNewDate(hour, idx) {
                    var newDate = moment({
                        days: idx,
                        hours: hour,
                        minutes: 0,
                        milliseconds: 0
                    });

                    // skip saturday and sunday
                    if (newDate.weekday() === 6 || newDate.weekday() === 7) {
                        idx = idx + (7 - newDate.weekday() + 1);
                        daysToGenerateCount = daysToGenerateCount + (7 - newDate.weekday() + 1);
                        newDate.day(newDate.day() + (7 - newDate.weekday() + 1));
                    }

                    // if the timeslot generated for today has already passed, don't add it
                    if (idx === 0 && moment().isAfter(newDate) || !newDate._isValid) {
                        return;
                    }

                    // add time to end of list
                    validTimes.push(newDate);
                }

                // set the max date to look forward to
                if (startDay + daysToGenerateCount >= moment().daysInMonth()) {
                    maxDateOfMonthToGenerate = moment().daysInMonth();
                } else {
                    maxDateOfMonthToGenerate = startDay + daysToGenerateCount;
                }

                // generate valid timeslots
                for (var i = startDay; i < maxDateOfMonthToGenerate; i++) {
                    _.each(validHours, function (hour) {
                        generateNewDate(hour, i);
                    });
                }
                return validTimes;
            }

            // generate random appointments per time slot, appointment type, for every provider
            _.each(appointmentTypes, function (appointmentType) {
                _.each(providers, function (provider) {
                    _.each(validTimeSlots, function (timeSlot) {
                        var uuid = faker.random.uuid(),
                            appointmentData = {
                                appointmentType: appointmentType,
                                provider: provider,
                                timeSlot: timeSlot
                            },
                            appointment = makeAppointment(true, false, uuid, appointmentData);
                        appointments.push(appointment);
                    });
                });
            });
            // apply user's appointment uuids to random appointments
            _.each(fixtures.plmpDefaultUser.appointments, function (appt_uuid) {
                var randApptIdx = _.random(appointments.length);
                appointments[randApptIdx]._uuid = appt_uuid;
                appointments[randApptIdx].booked = true;
                appointments[randApptIdx].pd_appointment_uuid = appt_uuid;
                appointments[randApptIdx].patient = fixtures.plmpDefaultUser;
                appointments[randApptIdx].comments = faker.lorem.paragraph();
            });
            // add past appointments for user
            for (var i = 0; i < 5; i++) {
                var pastAppt = makeAppointment(false, true, faker.random.uuid(),
                    {provider: _.sample(fixtures.plmpDefaultUser.providers)},
                    {comments: faker.lorem.paragraph(), patient: fixtures.plmpDefaultUser});
                appointments.push(pastAppt);
            }

            return _.chain(appointments)
                .sortBy('start_date')
                .compact()
                .value();
        }

        function doSearch() {
            var providerResults = $localStorage[storageKey].providers;
            return providerResults;
        }

        var mappings = {
            'GET:/api/v4/oauth2/context': function () {
                console.log('something');
                var ctx = {
                    current_app: $localStorage[storageKey].apps[0]
                };
                if ($localStorage[storageKey].loggedIn) {
                    _.extend(ctx, {
                        current_user: $localStorage[storageKey].users[0]
                    });
                }
                return {
                    status: 200,
                    data: ctx
                };
            },
            'GET:/api/v4/oauth2/logout': function () {
                $localStorage[storageKey].loggedIn = false;
                return {
                    status: 200,
                    data: {}
                };
            },
            'GET:/api/v4/users/45da76ae-a5e4-4c32-bafb-262f17f43d8b/appointments/': function () {
                return {
                    status: 200,
                    data: _.filter($localStorage[storageKey].appointments, function (appointment) {
                        return appointment.patient && appointment.patient._uuid === '45da76ae-a5e4-4c32-bafb-262f17f43d8b';
                    })
                };
            },
            'POST:/api/v4/oauth2/login': function (data) {
                var user = _.find($localStorage[storageKey].users, 'email', data.email);
                $localStorage[storageKey].loggedIn = true;
                return {
                    status: (user) ? 200 : 404,
                    data: user
                };
            },
            'POST:/api/v4/users/signup': function (data) {
                var user = _.first($localStorage[storageKey].users);
                _.extend(user, data);
                $localStorage[storageKey].loggedIn = true;
                return {
                    status: (user) ? 200 : 404,
                    data: user
                };
            },
            'POST:/api/v4/update-user': function (data) {
                data = JSON.parse(data);
                var currentAccount = $localStorage[storageKey].users[0];
                _.extend(currentAccount, data);
                return {
                    status: (currentAccount) ? 200 : 404,
                    data: {
                        user: currentAccount
                    }
                };
            },
            'POST:/api/v4/search': function () {
                var results = doSearch();
                var providersWithAppts = mapProviderAppts(results);
                console.log(providersWithAppts);
                return {
                    status: 200,
                    data: providersWithAppts
                };
            },
            'POST:/api/v4/users/45da76ae-a5e4-4c32-bafb-262f17f43d8b/dependents/': function (dependent) {
                dependent = JSON.parse(dependent);
                dependent._uuid = faker.random.uuid();
                $localStorage[storageKey].users[0].insurance.dependents.push(dependent);
                var currentAccount = $localStorage[storageKey].users[0];
                return {
                    status: 200,
                    data: currentAccount
                };
            },
            'GET:/api/v4/users/45da76ae-a5e4-4c32-bafb-262f17f43d8b/activities/': function () {
                var appointment_uuids = $localStorage[storageKey].users[0].appointments;
                var allAppointments = $localStorage[storageKey].appointments;
                var userAppointments = [];

                _.each(appointment_uuids, function(item) {
                    var appt = _.find(allAppointments, { pd_appointment_uuid: item });

                    userAppointments.push(appt);
                });

                return {
                    status: 200,
                    data: userAppointments
                };
            },
        };

        var providers = [makeProvider(), makeProvider(), makeProvider(), fixtures.plmpDefaultUser.providers[0]];

        // return a populated local storage db. Keys determine what resources are available
        function bootstrapData() {
            return {
                loggedIn: true,
                providers: providers,
                apps: [fixtures.plmpDefaultApp],
                users: [fixtures.plmpDefaultUser],
                appointments: makeRandomAppointments(plmpDefaultApp.appointment_types, providers),
                'appointment-types': plmpDefaultApp.appointment_types,
                'csz-mapping': [{
                    'city': 'CHARLESTON',
                    'has_zip': true,
                    'city_state': 'CHARLESTON SC',
                    'state': 'SC',
                    'geo_location': [-79.9309216, 32.7765656],
                    'population': 177294.0
                }, {
                    'city': 'CHARLESTON AFB',
                    'has_zip': true,
                    'city_state': 'CHARLESTON AFB SC',
                    'state': 'SC',
                    'geo_location': [-80.0617, 32.8972],
                    'population': 1348.0
                }, {
                    'city': 'CHAPIN',
                    'has_zip': true,
                    'city_state': 'CHAPIN SC',
                    'state': 'SC',
                    'geo_location': [-81.3498212, 34.1659795],
                    'population': 19140.0
                }, {
                    'city': 'CHADBOURN',
                    'has_zip': true,
                    'city_state': 'CHADBOURN NC',
                    'state': 'NC',
                    'geo_location': [-78.82696654699964, 34.32210894400049],
                    'population': 7102.0
                }, {
                    'city': 'CHAPPELLS',
                    'has_zip': true,
                    'city_state': 'CHAPPELLS SC',
                    'state': 'SC',
                    'geo_location': [-81.8667798, 34.1798538],
                    'population': 824.0
                }, {
                    'city': 'CHARLOTTE',
                    'has_zip': true,
                    'city_state': 'CHARLOTTE NC',
                    'state': 'NC',
                    'geo_location': [-80.8431268, 35.2270869],
                    'population': 790689.0
                }, {
                    'city': 'CHAUNCEY',
                    'has_zip': true,
                    'city_state': 'CHAUNCEY GA',
                    'state': 'GA',
                    'geo_location': [-83.0645928, 32.1046197],
                    'population': 923.0
                }, {
                    'city': 'CHAPEL HILL',
                    'has_zip': true,
                    'city_state': 'CHAPEL HILL NC',
                    'state': 'NC',
                    'geo_location': [-79.05583873299963, 35.91319922300045],
                    'population': 91595.0
                }, {
                    'city': 'CHATHAM',
                    'has_zip': true,
                    'city_state': 'CHATHAM VA',
                    'state': 'VA',
                    'geo_location': [-79.3980806, 36.8256943],
                    'population': 9203.0
                }, {
                    'city': 'CHASE CITY',
                    'has_zip': true,
                    'city_state': 'CHASE CITY VA',
                    'state': 'VA',
                    'geo_location': [-78.458331, 36.7993087],
                    'population': 6232.0
                }],
                specialties: [{
                    _uuid: faker.random.uuid(),
                    name: 'General Practice'
                }, {
                    _uuid: faker.random.uuid(),
                    name: 'Optometry'
                }, {
                    _uuid: faker.random.uuid(),
                    name: 'Eye Health'
                }, {
                    _uuid: faker.random.uuid(),
                    name: 'Ophthalmology'
                }]
            };
        }

        function mapProviderAppts(providers) {
            var appointments = _.groupBy($localStorage[storageKey].appointments, 'pd_provider_uuid');
            return _.map(providers, function (provider) {
                var appointmentType = _.sample($localStorage[storageKey].appointments).appointment_type;
                // get unbooked appointments matching specified appointment type
                var appointmentsOfType = _.filter(appointments[provider._uuid], function (appointment) {
                    return appointment.appointment_type === appointmentType && !appointment.booked;
                });
                // group by day of appointment
                provider.appointments = _.groupBy(appointmentsOfType, function (appt) {
                    return moment(appt.start_date).hours(0).minutes(0).seconds(0).milliseconds(0).toJSON();
                });
                return provider;
            });
        }

        return {
            mappings: mappings,
            bootstrapData: bootstrapData,
            storageKey: storageKey,
            apiPrefix: apiPrefix
        };
    })
    .run(function (httpMock, $log, PLMPMockData) {
        // initialize the mock service
        $log.debug('PLMPMockData:initialazing angularHTTPMock service');
        httpMock.initialize({
            apiPrefix: PLMPMockData.apiPrefix,
            storageKey: PLMPMockData.storageKey,
            mappings: PLMPMockData.mappings,
            bootstrapData: PLMPMockData.bootstrapData
        });
    });
