'use strict';

angular.module('pdSelect', [])
    .directive('pdSelect', function ($timeout, $http) {
        var keys = {
            up: 38,
            down: 40,
            enter: 13,
            tab: 9,
            backspace: 8
        };
        return {
            restrict: 'E',
            require: '?^form',
            templateUrl: 'pd-select/pd-select.html',
            scope: {
                // angular model which holds values for form submission, an array of JS primitives
                model: '=ngModel',
                // the options available, an array of primitives or objects, or an object
                rawOptions: '=options',
                // string url to call API where you get select's options from
                fromApi: '@',
                // the value key to use when options are an array of objects
                valueKey: '@',
                // the label key to use when options are an array of objects
                labelKey: '@',
                // a template to use for showing option rows
                optionTemplate: '@',
                // toggle for showing a delete button on selected values
                deleteBtn: '@',
                // function that fires onChange of input value
                onChange: '&',
                // Placeholder setting
                placeholder: '@',
                // Shows placeholder if true
                showPlaceholder: '=?bind',
                // sets the input id so that you can use labels to select input
                inputId: '@id',
                // toggles whether or not the user can query the input
                allowQueryInput: '='
            },
            link: function (scope, element, attrs, fCtrl) {
                // the input
                var queryInput = element.find('input')[0];
                // used to determine whether mouse is over pd-select container (for clicks/focus)
                var mouseOutsideElement = true;
                // if input should not respond to user input (disabled in form)
                var disabled = attrs.disabled !== undefined || attrs.disabled;
                // time between API requests
                var apiTimeout;
                // first item selected by default
                scope.activePos = -1;
                // initialize the query
                scope.query = '';
                // placeholder visibility changes on input so that pd-select acts like regular text input
                scope.showPlaceholder = true;
                // if user is actively using keyboard to navigate through pd-select options
                scope.keyboardFocus = false;
                // options selected by user
                scope.selected = [];
                // whether list of matching options is shown
                scope.showDropdown = false;

                // runs initial configurations for pd-select to work
                initialize();

                // defines where or not the placeholder should be shown
                var shouldShowPlaceholder = function () {
                    var length = (typeof scope.query === 'string') ? scope.query.length : 0;
                    return (scope.model === undefined || scope.model === null || scope.model === []) && !length;
                };

                // initialize visible options
                scope.$watch('rawOptions', function (newVal) {
                    scope.options = parseRawOptions(newVal);
                    if (scope.options !== undefined && scope.options.length > 0) {
                        if (_.has(attrs, 'multiple')) {
                            _.each(scope.model, function (item) {
                                scope.selectOption(item);
                            });
                        } else {
                            scope.selectOption(scope.model);
                        }
                    }
                });

                // Set timeout for search function so it's not constantly firing
                function setAPITimer(){
                    apiTimeout = setTimeout(function(){
                        var apiURL = scope.fromApi;
                        if (scope.query) {
                            apiURL += '?query=' + scope.query;
                        }

                        $http.get(apiURL)
                            .then(function (res) {
                                scope.options = parseRawOptions(res.data.data);
                                if(scope.model) {
                                    scope.selectOption(scope.model);
                                }
                            });
                    }, 400);
                }

                // load options from the API if there are no raw options
                scope.loadOptions = function () {
                    // Reset the timeout on API search
                    if ( scope.fromApi ) {
                        clearTimeout(apiTimeout);
                        setAPITimer();
                    }
                };

                if (!scope.rawOptions && scope.fromApi) {
                    scope.loadOptions();
                }

                // update list of selected options with user's latest selection
                scope.selectOption = function (value) {
                    var option = _.find(scope.options, {value: value});
                    if (option !== undefined) {
                        if (_.has(attrs, 'multiple')) {
                            // if user can select multiple values, add option to list of selected options
                            scope.selected.push(option);
                        } else {
                            // if user can select single values, replace currently selected option
                            scope.selected[0] = option;
                            close();
                        }
                        updateModel();
                    } else {
                        if (!_.has(attrs, 'multiple')) {
                            // if user can select single values, remove option
                            scope.selected = [];
                            close();
                        }
                        updateModel();
                    }
                    // clear user input
                    if (scope.query) {
                        scope.query = '';
                    }
                    // run user defined change function on next digest so model change is applied
                    $timeout(function () {
                        scope.onChange && scope.onChange({selection: scope.model});
                        scope.showPlaceholder = shouldShowPlaceholder();
                    });
                };

                // remove option from selected list
                scope.removeOption = function (item) {
                    var value;
                    if ( scope.valueKey ) {
                        value = item.value;
                    } else {
                        value = item;
                    }
                    scope.selected = _.reject(scope.selected, function (item) {
                        return item.value === value;
                    });
                    updateModel();
                };

                // selects the option when it is clicked
                scope.itemClick = function (value) {
                    if ( !_.has(attrs, 'multiple' ) ) {
                        mouseOutsideElement = true;
                    }
                    scope.selectOption(value);
                };

                // custom angular filter to remove options user has already chosen
                scope.filterOptions = function (item) {
                    if (!_.has(attrs, 'multiple')) {
                        return item;
                    } else if ( scope.selected.indexOf(item) < 0 ) {
                        return item;
                    }
                };

                // set the input size
                scope.setInputSize = function () {
                    var length = (typeof scope.query === 'string') ? scope.query.length + 1 : 1;
                    angular.element(queryInput).attr('size', length);
                    $timeout(function () {
                        scope.showPlaceholder = shouldShowPlaceholder();
                    });
                    scope.activePos = (length > 1 && scope.filteredOptions.length > 0) ? 0 : -1;
                };

                scope.setInputSize();

                // enable mouse hover to set active list item class
                scope.setActiveOnHover = function (index) {
                    if (!scope.keyboardFocus) {
                        setActiveItem(index, true);
                    }
                };

                // keyboard events
                element.on('keydown', function (e) {
                    if (e.keyCode === keys.up) {
                        return handleUpArrow(e);
                    }
                    if (e.keyCode === keys.down) {
                        return handleDownArrow(e);
                    }
                    if (e.keyCode === keys.enter) {
                        return handleSelectionKey(e, true);
                    }
                    if (e.keyCode === keys.tab) {
                        return handleSelectionKey(e);
                    }
                    if (e.keyCode === keys.backspace) {
                        return handleRemove(e);
                    }
                });

                // forward focus to query input
                element.on('click', function () {
                    if (disabled) {
                        return;
                    }
                    queryInput.focus();
                });

                // keeps track of mouse position so dropdown can close when user clicks outside element
                element.on('mouseenter mouseleave', function (e) {
                    mouseOutsideElement = e.type === 'mouseleave';
                });

                // prevent mouse interruption of keyboard scrolling/highlighting
                element.on('mousemove', function () {
                    if (!scope.keyboardFocus) {
                        return;
                    }
                    scope.keyboardFocus = false;
                });

                // enable validation
                angular.element(queryInput).on('blur', function () {
                    if ( mouseOutsideElement ) {
                        if (attrs.name && fCtrl) {
                            fCtrl[attrs.name].$setTouched(true);
                        }
                        close();
                        scope.$apply();
                    } else {
                        angular.element(queryInput).focus();
                    }
                    if ( !scope.selected || scope.selected.length < 1 ) {
                        scope.showPlaceholder = true;
                    } else {
                        scope.showPlaceholder = false;
                    }
                    element.children().eq(0).removeClass('focus');
                });


                // enable validation
                angular.element(queryInput).on('focus', function () {
                    if (attrs.name && fCtrl) {
                        fCtrl[attrs.name].$setUntouched(true);
                    }
                    scope.showDropdown = true;
                    scope.showPlaceholder = false;
                    element.children().eq(0).addClass('focus');
                    scope.$apply();

                    // for single select, highlight selected option when dropdown opens
                    $timeout(function () {
                        if (!_.has(attrs, 'multiple') && scope.model !== undefined) {
                            var idx = -1;
                            _.each(scope.filteredOptions, function (obj, objIdx) {
                                if (obj.value === scope.model) {
                                    idx = objIdx;
                                }
                            });
                            setActiveItem(idx);
                        }
                    });
                });

                // deletes the selected items - fires on backspace
                function handleRemove(e) {
                    if (scope.selected.length > 0 && scope.query.length <= 0) {
                        scope.selected.pop();
                        updateModel();
                        scope.activePos = -1;
                        scope.$digest();
                        e.preventDefault();
                        scope.showPlaceholder = shouldShowPlaceholder();
                    }
                }

                // add currently selected item to user choice list - fires on tab or enter key press
                function handleSelectionKey(e, isEnter) {
                    if (scope.activePos !== -1) {
                        if (!_.has(attrs, 'multiple')) {
                            mouseOutsideElement = true;
                        }
                        scope.selectOption(scope.filteredOptions[scope.activePos].value);
                        scope.activePos = -1;
                        scope.setInputSize();
                        scope.$apply();
                    }
                    isEnter && e.preventDefault();
                }

                // moves the active position in the drop down up a single item - fires on up arrow key press
                function handleUpArrow(e) {
                    if (scope.activePos > 0) {
                        scope.activePos--;
                        scope.$digest();
                        setActiveItem(scope.activePos);
                    }
                    scope.keyboardFocus = true;
                    e.preventDefault();
                }

                // moves down the dropdown to the next option - fires on the down arrow key press
                function handleDownArrow(e) {
                    if (scope.activePos < scope.filteredOptions.length - 1) {
                        scope.activePos++;
                    }
                    scope.keyboardFocus = true;
                    scope.$digest();
                    setActiveItem(scope.activePos);
                    e.preventDefault();
                }

                // set active selected list item and make sure it's positioned onscreen - called by scope.setActiveOnHover
                function setActiveItem(index, noScroll) {
                    scope.activePos = index;
                    if ( !noScroll ) {
                        var dropdown = element[0].querySelector('.pd-dropdown');
                        var activeItem = element[0].querySelector('.active');
                        if (activeItem !== null) {
                            // scroll to show active item if it's offscreen
                            if (dropdown.scrollTop >= activeItem.offsetTop) {
                                dropdown.scrollTop = activeItem.offsetTop;
                            } else if (dropdown.scrollTop + dropdown.offsetHeight <= activeItem.offsetTop + activeItem.offsetHeight) {
                                dropdown.scrollTop = activeItem.offsetTop - dropdown.offsetHeight + activeItem.offsetHeight;
                            }
                        }
                    }
                }

                // hides dropdown
                function close() {
                    scope.query = '';
                    scope.showDropdown = false;
                    scope.activePos = -1;
                }

                // sync the model with the selected options
                function updateModel() {
                    if (_.has(attrs, 'multiple')) {
                        // if user can select multiple values, update the model to be an array of values
                        scope.model = angular.copy(scope.selected);
                        _.each(scope.model, function(item, idx) {
                            scope.model[idx] = item.value;
                        });
                      } else {
                        // if user can select single values, update the model to be a single value
                        scope.model = (scope.selected.length) ? scope.selected[0].value : undefined;
                    }
                }

                //format the passed in option for use
                function parseRawOptions(rawOptions) {
                    if (scope.labelKey && !scope.valueKey) {
                        return _.map(rawOptions, function (item) {
                            return {label: item[scope.labelKey], value: item};
                        });
                    }
                    if (scope.valueKey && scope.labelKey) {
                        return _.map(rawOptions, function (item) {
                            return {label: item[scope.labelKey], value: item[scope.valueKey]};
                        });
                    }
                    if (_.isArray(rawOptions)) {
                        return _.map(rawOptions, function (item) {
                            return {label: item, value: item};
                        });
                    }
                    return _.map(scope.rawOptions, function (value, key) {
                        return {label: key, value: value};
                    });
                }

                // initializes pd-select by setting scope values based on directive attributes
                function initialize() {
                    // model that holds values for form submission
                    if (_.has(attrs, 'multiple')) {
                        scope.model = _.uniq(scope.model) || [];
                        element.addClass('multiple-select');
                    } else {
                        element.addClass('single-select');
                    }
                    // add an id to the queryInput if specified on the directive element
                    if ( scope.inputId ) {
                        angular.element(queryInput).attr('id', scope.inputId);
                    }
                }
            }
        };
    });
