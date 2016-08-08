'use strict';

/**
 * Provides mock functionality for a mock database in a browser's local storage.
 */
angular.module('angularHTTPMock', ['uuid4', 'ngStorage', 'ngMockE2E'])
    .service('httpMock', function (uuid4, $localStorage, $httpBackend, $log) {
        return {
            // key used to store/fetch data from local storage
            storageKey: null,
            // path used to recognize calls to mock API
            apiPrefix: null,
            // cache of function mappings
            mappings: [],
            // parses an incoming url
            parseURL: function (method, url) {
                var self = this,
                    uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                    urlParts = url.replace(self.apiPrefix, '').split('/'),
                    resource = null,
                    uuid = null,
                    mapping = null;
                var item = urlParts[urlParts.length - 1];
                // see if the last item was a resource or uuid
                if (uuidRegex.test(item)) {
                    // if it's a uuid, grab the resource and return a resource response
                    uuid = item;
                    resource = urlParts[urlParts.length - 2];
                }
                // see if its a resource, return those if they exist
                else if ($localStorage[self.storageKey][item]) {
                    resource = item;
                }
                else {
                    // see if its in the mappings
                    mapping = self.mappings[method + ':' + url.split('?')[0]];
                }
                return {
                    resource: resource,
                    uuid: uuid,
                    mapping: mapping
                };
            },
            // mocks API responses
            handleResponse: function (method, url, data) {
                $log.debug('httpMock:handling response for ' + method + ':' + url);
                var urlParts = this.parseURL(method, url),
                    res = null;
                // return a 404 if requirements are not met
                if (!urlParts.resource && !urlParts.mapping) {
                    res = {
                        status: 404,
                        data: {}
                    };
                }
                else if (urlParts.mapping) {
                    // mappings are special functions, so handle them here
                    res = urlParts.mapping(data);
                } else {
                    // handle general resource requests
                    res = this[method.toLowerCase()](urlParts.resource, urlParts.uuid, data);
                }
                var resData = {
                    meta: {
                        total: res.data.length
                    },
                    data: res.data
                };
                $log.debug('httpMock:Response: ' + res.status, resData);
                return [res.status, resData, {}];
            },
            // loads mock data into local storage and creates mock RESTful HTTP endpoints for app
            initialize: function (options) {
                var self = this;
                self.storageKey = options.storageKey;
                self.apiPrefix = options.apiPrefix;
                self.mappings = options.mappings;
                // initialize database if it doesn't exist in local storage
                if (!$localStorage[self.storageKey]) {
                    $log.debug('httpMock:bootstraping data');
                    $localStorage[self.storageKey] = options.bootstrapData();
                } else {
                    _.defaults($localStorage[self.storageKey], options.bootstrapData());
                }
                $log.debug('httpMock:local storage contains resources: ' + _.keys($localStorage[self.storageKey]));
                // mock responses for any http request url beginning with user specified path
                $httpBackend.whenGET(new RegExp(self.apiPrefix + '.*'))
                    .respond(function (method, url, data) {
                        return self.handleResponse(method, url, data);
                    });
                $httpBackend.whenPOST(new RegExp(self.apiPrefix + '.*'))
                    .respond(function (method, url, data) {
                        return self.handleResponse(method, url, data);
                    });
                $httpBackend.whenPUT(new RegExp(self.apiPrefix + '.*'))
                    .respond(function (method, url, data) {
                        return self.handleResponse(method, url, data);
                    });
                // let all other http requests go through
                $httpBackend.whenGET(/.*/).passThrough();
                $httpBackend.whenPOST(/.*/).passThrough();
                $httpBackend.whenPUT(/.*/).passThrough();
            },
            get: function (resource, uuid) {
                // simulate regular GET request
                var items = $localStorage[this.storageKey][resource];
                if (!uuid) {
                    return {
                        status: 200,
                        data: items
                    };
                }
                // simulate GET request for specific object
                var item = _.find(items, {_uuid: uuid});
                // send appropriate status code and error if object is not found in database
                if (!item) {
                    return {
                        status: 404
                    };
                }
                // return object if all goes well
                return {
                    status: 200,
                    data: item
                };
            },
            post: function (resource, uuid, data) {
                // add new object to database
                var item = JSON.parse(data);
                // replace uuid key
                item._uuid = uuid4.generate();
                $localStorage[this.storageKey][resource].push(item);
                return {
                    status: 200,
                    data: item
                };
            },
            put: function (resource, uuid, data) {
                var item = _.find($localStorage[this.storageKey][resource], '_uuid', uuid);
                data = JSON.parse(data);
                if (!item) {
                    return {
                        status: 404
                    };
                }
                // update item
                item = _.assign(item, data);
                return {
                    status: 200,
                    data: item
                };
            }
        };
    });
