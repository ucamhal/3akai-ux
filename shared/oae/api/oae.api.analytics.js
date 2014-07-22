/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['exports', 'require', 'jquery', 'underscore', 'oae.api.config'], function(exports, require, $, _, configAPI) {

    var GA_SEND = 'send';


    /**
     * A wrapper for callback to fire when a hit has gone out. If the tracker fails
     * to call the func within delay milliseconds it'll be called automatically.
     * func is only ever called once.
     */
    var whenCalledOrAfter = exports.whenCalledOrAfter = function(delay, func) {
        var onceFunc = _.once(func);
        _.delay(onceFunc, delay);
        return onceFunc;
    };

    /**
     * Send a Google Analytics hit to each enabled tracker.
     *
     * If a hitCallback is specified, it's called once all enabled trackers have finished sending their hit.
     * It's recommended to wrap your callbacks in whenCalledOrAfter() if the callback must be called eventually for correct application behaviour. (There's no guarantee that GA will call the hitCallback.)
     *
     * The arguments are the same as those accepted by ga('send', ...). 'send' is implicit, only provide those arguments following send.
     *
     *  For example:
     *      gaSend('pageview');
     *      gaSend('event', 'foo', 'bar', {'hitCallback': whenCalledOrAfter(100, function() {
     *          // essential thing
     *          window.location = '/somewhere';
     *      })});
     */
    var gaSend = exports.gaSend = function() {
        var trackers = _getGaEnabledTrackerNames();
        var hitCallback = _gaGetHitCallback(arguments) || function() {};

        // Send a hit to each enabled tracker, holding on to a promise which will be resolved when the hit has been acknowledged.
        var hitPromises = _.map(trackers, _.partial(_gaSendHit, window.ga, _.toArray(arguments)));

        // Call hitCallback if/when all the hitPromises are resolved - e.g. when GA's acknowledged all the hits
        $.when.apply(null, hitPromises).done(hitCallback);
    };

    var _gaSendHit = function(gaFunc, gaArguments, tracker) {
        var deferredHit = $.Deferred();

        var gaArgs = _gaBuildArgs(tracker, GA_SEND, gaArguments);
        gaArgs = _gaSetHitCallback(gaArgs, _gaCreateDeferredHitCallback(deferredHit));

        gaFunc.apply(null, gaArgs);

        // The deferredHit will be resolve()d if/when ga calls the hitCallback
        return deferredHit.promise();
    };

    var _gaCreateDeferredHitCallback = function(deferredHit) {
        return $.proxy(deferredHit.resolve, deferredHit);
    };

    var _gaBuildArgs = function(tracker, command, gaArguments) {
        return [_gaBuildCommand(tracker, command)].concat(gaArguments);
    };

    var _gaBuildCommand = function(tracker, command) {
        if (!tracker) {
            return command;
        }
        return tracker + '.' + command;
    };

    var _getGaEnabledTrackerNames = function() {
        var globalEnabled = configAPI.getValue('oae-google-analytics', 'google-analytics', 'globalEnabled');
        var globalTrackingId = globalEnabled && configAPI.getValue('oae-google-analytics', 'google-analytics', 'globalTrackingId');
        var tenantEnabled = configAPI.getValue('oae-google-analytics', 'google-analytics', 'tenantEnabled');
        var tenantTrackingId = tenantEnabled && configAPI.getValue('oae-google-analytics', 'google-analytics', 'tenantTrackingId');

        var trackers = [];

        // This mimics the logic in oae.api.util's googleAnalytics()...
        if (globalTrackingId) {
            trackers.push('');
        }
        if (tenantTrackingId && tenantTrackingId !== globalTrackingId) {
            // If there's no global tracking ID the tenant uses the default tracker name
            if (!globalTrackingId) {
                trackers.push('');
            }
            // Otherwise they use tenantTracker ...
            else {
                trackers.push('tenantTracker');
            }
        }
        return trackers;
    };

    var _gaSetHitCallback = function(gaArguments, callback) {
        // Clone to arguments to avoid modifying the input
        gaArguments = _.clone(gaArguments);

        var lastIndex = gaArguments.length - 1;

        if(lastIndex === -1 || !_.isObject(gaArguments[lastIndex])) {
            gaArguments.push({});
            lastIndex++;
        }
        else {
            // clone the options object to avoid modifying the input
            gaArguments[lastIndex] = _.clone(gaArguments[lastIndex]);
        }

        gaArguments[lastIndex].hitCallback = callback;
        return gaArguments;
    };

    var _gaGetHitCallback = function(gaArguments) {
        // The extra options object is always the last argument (if provided)
        var lastIndex = gaArguments.length - 1;
        if (lastIndex > -1 && _.isObject(gaArguments[lastIndex])) {
            var callback = gaArguments[lastIndex].hitCallback;
            if (_.isFunction(callback)) {
                return callback;
            }
        }
        return null;
    };
});
