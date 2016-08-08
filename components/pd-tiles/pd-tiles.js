'use strict';
/**
 * @ngdoc overview
 * @name pdTiles
 * @module pdTiles
 * @description
 *
 * This module includes a list of common UI representations for providers, businesses,
 * locations, search results, and appointments, and appointment times. Some tiles have isolated
 * functionality such as setting the context for scheduling/RFQ, cancelling appointments, etc.
 *
 */

angular.module('pdTiles', [
        'pdToast',
        'pdConfirm',
        'pdPokit',
        'pdLoader',
        'pdCalExport'
    ]);
