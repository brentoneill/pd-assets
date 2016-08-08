'use strict';

angular.module('pdServices')
    // .service('NavBuilder', function($http, $q, Session, ActivityService) {
    .service('NavBuilder', function($http, $q, Session) {
        // TODO: get from config
        var currentBusiness = {
            name: 'Cigna Health Care Of Arizona Inc',
            slug:'superstition-springs'
        };

        // function that returns header nav objects - consumer or business
        var getHeaderNav = function(mode, config, loggedIn) {
            var headerNav = {
                tabs:[]
            };

            if ( mode === 'consumer' ) {
                if ( loggedIn ) {
                    headerNav.tabs = [{
                        title: Session.currentApp.features.search.title || 'search',
                        ui_sref: 'app.consumer.search',
                        id: 'tab-search',
                        enabled: Session.currentApp.layouts.header.indexOf('search'.toLowerCase()) !== -1
                    },
                    {
                        title: Session.currentApp.features.pokit.title || 'Saved',
                        ui_sref: 'app.consumer.pokit',
                        id: 'tab-saved',
                        enabled: Session.currentApp.layouts.header.indexOf('saved'.toLowerCase()) !== -1
                    },
                    {
                        title: Session.currentApp.features.activities.title || 'activity',
                        ui_sref: 'app.consumer.activity.list',
                        id: 'tab-activity',
                        enabled: Session.currentApp.layouts.header.indexOf('activity'.toLowerCase()) !== -1
                    }];

                    // changed from following commented line until specific layouts can be removed from NavBuilder
                    $http.get('$api/users/' + Session.currentUser._uuid + '/activities')
                        .then(function(res) {
                            headerNav.tabs[2].label = res.data.data && res.data.data.length;
                        });
                } else {
                    headerNav.tabs = [{
                        title: Session.currentApp.features.search.title || 'Search',
                        ui_sref: 'app.consumer.search',
                        id: 'tab-search',
                        enabled: Session.currentApp.layouts.header.indexOf('search'.toLowerCase()) !== -1 && !Session.currentApp.require_login
                    }];
                    if (!Session.currentApp.features.user_signup.workflow_mode) {
                        headerNav.tabs = headerNav.tabs.concat([{
                            title: 'log in',
                            ui_sref: 'app.consumer.auth.login',
                            id: 'tab-login',
                            enabled: true
                        }, {
                            title: 'sign up',
                            ui_sref: 'app.consumer.auth.signup.account',
                            id: 'tab-signup',
                            enabled: true
                        }]);
                    }
                }
            } else if ( mode === 'business' && loggedIn ) {
                headerNav.tabs = [{
                    title: 'Dashboard',
                    ui_sref: 'app.business.dashboard.list({slug: "' + currentBusiness.slug + '" })',
                    id: 'tab-dashboard',
                    enabled: true
                },
                {
                    title: 'Manage',
                    ui_sref: 'app.business.settings.profile({ slug: "' + currentBusiness.slug + '" })',
                    id: 'tab-manage',
                    enabled: true
                }];

                $http.get('$api/businesses/' + currentBusiness.slug + '/appointments?include=platform_appointment')
                    .then(function(res) {
                        var now = moment();
                        var activities = _.filter(res.data.data, function(activity) {
                            return moment(activity.platform_appointment.start_date).isAfter(now);
                        });
                        headerNav.tabs[0].label = activities.length;
                    });
            }
            return headerNav;
            // return dfd.promise;
        };

        // function that returns drawer nav objects - consumer or business
        var getDrawerNav = function(config, loggedIn) {
            var drawerNav = {};
            if ( loggedIn ) {
                drawerNav.loggedIn = {
                    navSections: [{
                        title: 'My Account',
                        menuItems: [{
                            title: Session.currentApp.features.search.title || 'search',
                            ui_sref: 'app.consumer.search',
                            enabled: Session.currentApp.layouts.drawer.indexOf('search'.toLowerCase()) !== -1
                        }, {
                            title: Session.currentApp.features.pokit.title || 'Saved',
                            ui_sref: 'app.consumer.pokit',
                            label: Session.currentUser.pokits && Session.currentUser.pokits.length,
                            enabled: Session.currentApp.layouts.drawer.indexOf('saved'.toLowerCase()) !== -1
                        }, {
                            title: Session.currentApp.features.activities.title || 'activity',
                            ui_sref: 'app.consumer.activity.list',
                            enabled: Session.currentApp.layouts.drawer.indexOf('activities'.toLowerCase()) !== -1
                            // label: $scope.currentUser.activities && $scope.currentUser.activities.length
                        }, {
                            title: 'my settings',
                            ui_sref: 'app.consumer.settings.profile',
                            enabled: Session.currentApp.layouts.drawer.indexOf('my settings'.toLowerCase()) !== -1
                        }]
                    }, {
                        title: 'my business',
                        menuItems: [{
                            title: currentBusiness.name,
                            ui_sref: 'app.business.dashboard.list({ slug: "' + currentBusiness.slug + '" })',
                            enabled: true
                        }]
                    }]
                };
            } else {
                drawerNav.loggedOut = {
                    navSections: [{
                        title: '',
                        menuItems: [{
                            title: Session.currentApp.features.search.title || 'search',
                            ui_sref: 'app.consumer.search',
                            enabled: Session.currentApp.layouts.drawer.indexOf('search'.toLowerCase()) !== -1 && !Session.currentApp.require_login
                        }, {
                            title: 'sign up',
                            ui_sref: 'app.consumer.auth.signup.account',
                            enabled: true
                        }, {
                            title: 'log in',
                            ui_sref: 'app.consumer.auth.login',
                            enabled: true
                        }]
                    }]
                };
            }

            return drawerNav;
        };

        // function that returns dropdown nav objects - constant if logged in
        var getDropdownNav = function() {
            return [
                {
                    title: 'my account',
                    ui_sref: 'app.consumer.settings.profile'
                },
                {
                    title: 'my business',
                    ui_sref: 'app.business.dashboard.list({ slug: "' + currentBusiness.slug + '" })'
                },
                {
                    title: 'log out',
                    ui_sref: 'app.consumer.auth.logout'
                }
            ];
        };

        // function that returns footer nav object
        var getFooterNav = function() {
            var footerConfig = {
                footerNav: [{
                    title: 'directory',
                    ui_sref: 'app.consumer.providers.directory',
                    enabled: Session.currentApp.layouts.footer.indexOf('directory'.toLowerCase()) !== -1
                }, {
                    title: 'contact us',
                    ui_sref: 'app.consumer.contact',
                    enabled: Session.currentApp.layouts.footer.indexOf('contact us'.toLowerCase()) !== -1
                }, {
                    title: 'FAQ',
                    ui_sref: 'app.consumer.support.articles',
                    enabled: Session.currentApp.layouts.footer.indexOf('FAQ'.toLowerCase()) !== -1
                }],
                footerLinks: [{
                    title: 'privacy policy',
                    ui_sref: 'app.consumer.privacy-policy'
                }, {
                    title: 'terms of service',
                    ui_sref: 'app.consumer.terms-of-service'
                }],
                socialLinks: [{
                    icon: 'facebook',
                    href: 'http://facebook.com'
                }, {
                    icon: 'twitter',
                    href: 'http://twitter.com'
                }, {
                    icon: 'youtube',
                    href: 'http://youtube.com'
                }, {
                    icon: 'instagram',
                    href: 'http://instagram.com'
                }]
            };

            return footerConfig;
        };

        return {
            getHeaderNav: getHeaderNav,
            getDrawerNav: getDrawerNav,
            getFooterNav: getFooterNav,
            getDropdownNav: getDropdownNav
        };
    });
