'use strict';

angular.module('pdServices', []);

angular.module('pdServices')
    .factory('BenefitsFormatter', function () {
        return {
            groupByCoverage: function (res) {
                // group each by coverage
                return _.groupBy(res, function (r) {
                    return r.coverage_level;
                });
            },
            groupByNetwork: function (res) {
                // group each coverage level by whether it is in/out of plan network (or if that doesn't apply)
                var map = {
                    yes: "in_network_plan",
                    no: "out_of_network_plan",
                    not_applicable: "network_not_applicable"
                };
                _.each(res, function (val, key) {
                    res[key] = _.groupBy(val, function (v) {
                        return map[v.in_plan_network] || map["not_applicable"];
                    });
                });
                return res;
            },
            organizeResult: function (res) {
                // group and sort benefit (e.g., coinsurance, copay) information for better display
                var self = this;
                return self.groupByNetwork(self.groupByCoverage(res));
            },
            organizeCoinsurance: function (coinsurance) {
                var self = this;
                var organizedResult = self.organizeResult(coinsurance);
                return _.each(organizedResult, function (val) {
                    _.each(val, function (v, k) {
                        val[k] = _.groupBy(v, function (v1) {
                            return v1.benefit_percent;
                        });
                    });
                });
            },
            organizeCopay: function (copay) {
                var self = this;
                var organizedResult = self.organizeResult(copay);
                return _.each(organizedResult, function (val) {
                    _.each(val, function (v, k) {
                        val[k] = _.groupBy(v, function (v1) {
                            if(v1.benefit_amount && v1.benefit_amount.amount) {
                                return v1.benefit_amount.amount;
                            }
                            return 0;
                        });
                    });
                });
            },
            organizeLimitations: function (limitations) {
                var self = this;
                var organizedResult = self.organizeResult(limitations);
                return _.each(organizedResult, function (val) {
                    _.each(val, function (v, k) {
                        val[k] = _.groupBy(v, function (v1) {
                            if(v1.benefit_amount && v1.benefit_amount.amount) {
                                return v1.benefit_amount.amount;
                            }
                            return 0;
                        });
                    });
                });
            }
        }
    });
