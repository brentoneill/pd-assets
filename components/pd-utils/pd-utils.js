'use strict';

angular.module('pdUtils', [
        'ui.router'
    ])
    .directive('scrollTo', function ($window) {
        return {
            restrict: 'AC',
            compile: function () {

                var document = $window.document;

                function scrollInto(idOrName, offset) { //find element with the given id or name and scroll to the first element it finds
                    if (!idOrName) { //move to top if idOrName is not provided
                        $window.scrollTo(0, 0);
                    }
                    if (idOrName === '$none') {
                        return;
                    }

                    //check if an element can be found with id attribute
                    var el = document.getElementById(idOrName);
                    if (!el) { //check if an element can be found with name attribute if there is no such id
                        el = document.getElementsByName(idOrName);

                        if (el && el.length) {
                            el = el[0];
                        } else {
                            el = null;
                        }
                    }

                    if (el) { //if an element is found, scroll to the element
                        if (offset) {
                            var top = $(el).offset().top - offset;
                            window.scrollTo(0, top);
                        } else {
                            el.scrollIntoView();
                        }
                    }
                    //otherwise, ignore
                }

                return function (scope, element, attr) {
                    element.bind('click', function () {
                        scrollInto(attr.scrollTo, attr.offset);
                    });
                };
            }
        };
    })

/*
 * fix for the documentation nav
 */
.directive('anchorLink', function () {
    return {
        restrict: 'CA',
        link: function (scope, element, attrs) {
            element.on('click', function (e) {
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: $(attrs.href).offset().top - 20
                }, 250);
            });
        }
    };
})

.directive('pdVideoSrc', function ($timeout) {
    return {
        require: '^form',
        restrict: 'A',
        link: function (scope, element, attrs, fCtrl) {
            var videoField = fCtrl[attrs.name];
            var iframe = $('.video-frame iframe');
            scope.loadVideo = function () {
                var url = videoField.$viewValue || '';
                if (!url) {
                    videoField.$setValidity('videoSrc', true);
                }
                var urlInParts = url.replace('http://', '')
                    .replace('https://', '')
                    .replace('www.', '')
                    .replace('.com', '')
                    .split('/');
                var videoSource = urlInParts[0];
                var videoID = urlInParts[1];

                if (['youtube', 'vimeo'].indexOf(videoSource) !== -1 && urlInParts[1]) {
                    if (videoSource === 'youtube') {
                        var endOfID = videoID.indexOf('&') !== -1 ? videoID.indexOf('&') : videoID.length;
                        videoID = videoID.substring((videoID.indexOf('watch?v=') + 'watch?v='.length), endOfID);

                        iframe.attr('src', 'https://www.youtube.com/embed/' + videoID);

                        scope.data.video = {
                            url: url,
                            source: videoSource,
                            embed_url: 'https://www.youtube.com/embed/' + videoID,
                            thumbnail: 'https://img.youtube.com/vi/' + videoID + '/0.jpg'
                        };
                    } else if (videoSource === 'vimeo') {
                        if (videoID === 'channels') {
                            videoID = urlInParts[3];
                        }
                        iframe.attr('src', 'https://player.vimeo.com/video/' + videoID);

                        $.getJSON('https://vimeo.com/api/v2/video/' + videoID + '.json?callback=?', null, function (json) {
                            scope.thumbnail = json[0].thumbnail_medium;

                            scope.data.video = {
                                url: url,
                                source: videoSource,
                                embed_url: 'https://player.vimeo.com/video/' + videoID,
                                thumbnail: scope.thumbnail
                            };
                        });
                    }
                    videoField.$setValidity('videoSrc', true);
                } else if (videoField.$viewValue === '' || !videoField.$viewValue) {
                    videoField.$setValidity('videoSrc', true);
                    scope.data.video = {};
                } else {
                    videoField.$setValidity('videoSrc', false);
                }
            };
            $timeout(function () {
                scope.loadVideo();
            }, 250);
        }
    };
})

/*
 * like ng-hide/ng-show, but with visibility instead of display
 * (element still affects layout)
 */
.directive('ngInvisible', function () {
    return {
        restrict: 'A',
        scope: {
            ngInvisible: '='
        },
        link: function (scope, element) {
            scope.$watch('ngInvisible', function (newValue) {
                if (newValue && !element.hasClass('ng-invisible')) {
                    element.addClass('ng-invisible');
                } else if (!newValue && element.hasClass('ng-invisible')) {
                    element.removeClass('ng-invisible');
                }
            });
        }
    };
})

/*
 * bind a value only once to reduce the number of watches
 *
 * e.g.,
 * <div bind-once>{{ dang }} {{ boss }}</div>
 *
 */
.directive('bindOnce', function () {
    return {
        scope: true,
        link: function ($scope, $element) {
            setTimeout(function () {
                $scope.$destroy();
                $element.removeClass('ng-binding ng-scope');
                !$element.attr('class') && $element.removeAttr('class');
            }, 0);
        }
    };
})

.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                element.blur();
                event.preventDefault();
            }
        });
    };
})

/* intercepts 401 errors and redirects user to login page */
.factory('errorInterceptor', function ($rootScope, $q) {
    return {
        'response': function (response) {
            return response || $q.when(response);
        },
        'responseError': function (rejection) {
            if (rejection.status === 401 || rejection.status === 400) {
                window.location = '/login?session-expired=true';
                return rejection;
            }
            return $q.reject(rejection);
        }
    };
})

.filter('titlecase', function () {
    return function (input) {
        if (!input || input === '') {
            return input;
        }
        var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
        var abbr = /^(ID|DT|API|UUID|URL)$/i;
        input = input.toLowerCase();
        input = input.replace(/_/g, ' ');
        return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function (match, index, title) {
            if (index > 0 && index + match.length !== title.length &&
                match.search(smallWords) > -1 && title.charAt(index - 2) !== ':' &&
                (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
                title.charAt(index - 1).search(/[^\s-]/) < 0) {
                return match.toLowerCase();
            }

            if (match.search(abbr) > -1) {
                return match.toUpperCase();
            }

            if (match.substr(1).search(/[A-Z]|\../) > -1) {
                return match;
            }

            return match.charAt(0).toUpperCase() + match.substr(1);
        });
    };
})

.filter('removeUnderscores', function () {
    return function (input) {
        if (input) {
            return input.replace(/_/g, ' ');
        }
        return input;
    };
})

.filter('spacesToDashes', function () {
    return function (input) {
        if (input) {
            return input.replace(/ /g, '-').toLowerCase();
        }
        return input;
    };
})

/*
 * date value formatter
 * noTimezone: accepts Boolean - true will bypass time zone calculation, e.g. DOB data
 */
.filter('formatDate', function () {
        return function (dateStr, formatStr, noTimezone) {
            if (dateStr) {
                var date = moment(dateStr, ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'ddd MMM DD HH:mm:ss YYYY', 'HH:mm:ss A, ddd MMM DD, YYYY']);
                if (!noTimezone) {
                    date.add(moment().utcOffset(), 'm');
                }
                return date.format(formatStr || 'MM/DD/YYYY');
            } else {
                return '';
            }
        };
    })
    .filter('telephone', function () {
        return function (tel) {
            if (!tel) {
                return '';
            }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var city, number;

            switch (value.length) {
                case 1:
                case 2:
                case 3:
                    city = value;
                    break;

                default:
                    city = value.slice(0, 3);
                    number = value.slice(3);
            }

            if (number) {
                if (number.length > 3) {
                    number = number.slice(0, 3) + '-' + number.slice(3, 7);
                } else {
                    number = number;
                }

                return ('(' + city + ') ' + number).trim();
            } else {
                return '(' + city;
            }

        };
    })

.filter('specialties', function () {
    return function (input) {
        return (_.isArray(input)) ? _.pluck(input, 'name').join(', ') : '';
    };
})

.filter('convertAppointmentType', function (Session) {
    return function (input) {
        // get the appointment description from the currentApp's list of appoinment types
        var apptType = _.find(Session.currentApp.features.scheduling.appointment_types, {
            platform_id: input
        });
        if (apptType && apptType.description) {
            return apptType.description;
        }
        return input;
    }
})

.filter('weekdayFilter', function () {
    return function (input) {
        var translate = {
            'monday': 'M',
            'tuesday': 'T',
            'wednesday': 'W',
            'thursday': 'Th',
            'friday': 'F',
            'saturday': 'Sa',
            'sunday': 'Su'
        };
        return translate[input];
    };
})

.filter('percentage', function ($filter) {
    return function (input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
    };
})

.filter('streetAddress', function () {
    return function (location) {
        return location.address_ln1 + (location.address_ln2 && ', ' + location.address_ln2 || '');
    }
})

.filter('cityStateZip', function () {
    return function (location) {
        return location.city + ' ' + location.state + ', ' + location.zipcode;
    }
});
