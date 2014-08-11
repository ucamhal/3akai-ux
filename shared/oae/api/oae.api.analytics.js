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

    var HIT_EVENT = 'event';

    var ACTION_OPEN = 'Opened';
    var ACTION_INTERACT = 'Interacted with';
    var ACTION_TRIGGERED = 'Triggered';
    var ACTION_INVALIDATED = 'Invalidated';
    var ACTION_INVALIDATED_BY = 'Invalidated by';
    var ACTION_CLICK = 'Clicked';

    var CATEOGRY_MODAL = 'Modals';
    var CATEGORY_BUTTON = 'Buttons';
    var CATEGORY_FIELD = 'Form fields';
    var CATEGORY_VALIDATION_ERROR = 'Validation errors';
    var CATEGORY_LINK = 'Links';

    var DIMENSION_IS_USER_LOGGED_IN = 'dimension1';

    var GA_SEND = 'send';
    var GA_SET = 'set';


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
     * Send an analytics pageview for the specified path and page title.
     *
     * @param  {String}     path        The URL path to record a pageview against
     * @param  {Object}     [options]   Extra ga() options
     */
    var trackVirtualPageview = exports.trackVirtualPageview = function(path, options) {
        if (!path) {
            throw new Error('No path provided: ' + path);
        }

        if (path[0] === '/') {
            path = path.substring(1);
        }
        var url = '/virtual/' + path;

        var mergedOptions = _.extend({}, options || {}, {
          'page': url
        });

        gaSend('pageview', mergedOptions);
    };

    /**
     * Send analytics events to track the opening of a modal.
     *
     * @param  {String}             modalName           A unique name for the modal which was opened
     */
    var trackModalOpen = exports.trackModalOpen = function(modalName) {
        gaSendEvent(CATEOGRY_MODAL, ACTION_OPEN, modalName);
    };

    var trackButtonClick = exports.trackButtonClick = function(buttonElement) {
        var label = getElementIdentifier(buttonElement);
        gaSendEvent(CATEGORY_BUTTON, ACTION_INTERACT, label);
    };

    /**
     * Send analytics events to track a form field having been invalidated by bad user input.
     *
     * @param  {Element|jQuery}     The form field's <label> element.
     * @param  {String}             A brief name identifying the validation error that occurred
     */
    var trackValidationError = exports.trackValidationError = function(fieldLabel, errorName) {
        var fieldIdentifier = getElementIdentifier(fieldLabel);

        // This event allows us to identify the # of validation errors per field
        gaSendEvent(CATEGORY_FIELD, ACTION_INVALIDATED, fieldIdentifier);
        // This one gives us the number of individual validation errors
        gaSendEvent(CATEGORY_VALIDATION_ERROR, ACTION_TRIGGERED, errorName);
        // This one gives us the number of times a field encounters a specific validation error
        gaSendEvent(CATEGORY_FIELD, ACTION_INVALIDATED_BY, fieldIdentifier + ' : ' + errorName);
    };

    /**
     * Send analytics events to track a click on an HTML link.
     *
     * @param  {String}     url         The absolute URL of the <a> that was clicked
     * @param  {Function}   callback    A function to call (with no arguments) if & when the GA hit is acknowledged.
     */
    var trackLinkClick = exports.trackLinkClick = function(url, callback) {
        gaSendEvent(CATEGORY_LINK, ACTION_CLICK, url, { 'hitCallback': callback });
    };

    var autoTrackButtonClicks = exports.autoTrackButtonClicks = function() {
        $(document).on('click', 'button', function(ev) {
            trackButtonClick(ev.currentTarget);
        });
    };

    var _goToUrl = function(url) {
        window.location = url;
    };

    /**
     * Block a click event which is triggering a page transition to a new URL.
     * Track a click event against the URL and navigate to the URL once the
     * event has been acknowledged, or after a short delay.
     */
    var _interceptAndTrackAnchorClick = function(ev) {
        var a = ev.currentTarget;
        var goToUrl = whenCalledOrAfter(50, _.partial(_goToUrl, a.href));
        trackLinkClick(a.href, goToUrl);
        ev.preventDefault();
        ev.stopPropagation();
    };

    /**
     * Bind an event handler to watch for and track clicks on links to pages on external websites.
     */
    var autoTrackExternalLinkClicks = exports.autoTrackExternalLinkClicks = function() {
        $(document).on('click', 'a', function(ev) {
            var a = ev.currentTarget;
            if (a.hostname !== window.location.hostname) {
                _interceptAndTrackAnchorClick(ev);
            }
        });
    };

    /**
     * Bind an event handler to watch for and track clicks on addendum download links.
     */
    var autoTrackAddendumDownloads = exports.autoTrackAddendumDownloads = function() {
        var rawAddendumUrl = configAPI.getValue('oae-publications', 'general', 'addendumUrl');
        var absAddendumUrl = $('<a>').prop('href', rawAddendumUrl).prop('href');

        $(document).on('click', 'a', function(ev) {
            var a = ev.currentTarget;
            if (a.href === absAddendumUrl) {
                _interceptAndTrackAnchorClick(ev);
            }
        });
    };

    /**
     * Set user based dimension values.
     */
    var autoTrackUserDimensions = exports.autoTrackUserDimensions = function() {
        // We need to wait until the 'me' data is loaded
        require(['oae.core'], function(oae) {
            var isUserLoggedIn = oae.data.me.anon !== true;

            var values = {};
            values[DIMENSION_IS_USER_LOGGED_IN] = isUserLoggedIn ? 'Logged in' : 'Logged out';

            gaSet(values);
        });
    };

    /**
     * Activate all the autoTrack* functions.
     */
    var autoTrackAll = exports.autoTrackAll = function() {
        autoTrackUserDimensions();
        autoTrackButtonClicks();
        autoTrackExternalLinkClicks();
        autoTrackAddendumDownloads();
    };

    /**
     * A function which can be provided to the 'invalidHandler' option of jQuery Validate's validate() function.
     * It will automatically track validation errors which occur using trackValidationError().
     */
    var jqueryValidateInvalidHandler = exports.jqueryValidateInvalidHandler = function(event, validator) {
        _.forEach(validator.errorList, function(err) {

            // Fall back to using the form field itself as there's no label
            var label = _getLabelForField(err.element) || err.element;
            trackValidationError(label, err.message);
        });
    };

    /**
     * Finds the label element attached to a form field. If the field itself has a data-ga-label attr then it's used directly.
     *
     * This implementation uses the id attr of the form and the for=id attr of the label to identify field labels.
     */
    var _getLabelForField = function(formField) {
        var $field = $(formField);

        if ($field.data('ga-label')) {
            return $field;
        }

        var id = $field.attr('id');
        return $('label[for="' + id + '"]')[0];
    };

    /**
     * Generate an identifier for an HTML Element to be displayed to a human.
     *
     * Depending on maxLength, sutable parents of the element will be included in the identifier.
     *
     * @param  {Element|jQuery}     element     An element to identify
     * @param  {Number}             maxLength   The max number of elements to show in the identifier
     * @return {String}                         A human readable representation of the element
     */
    var getElementIdentifier = exports.getElementIdentifier = function(element, maxLength) {
        if (maxLength === undefined) {
            maxLength = 2;
        }

        var maxParentCount = maxLength - 1;

        // An array is used to guarantee the order of the elements
        var candidates = $(element).parents('[data-ga-label]').toArray();
        candidates = candidates.splice(Math.max(0, candidates.length - maxParentCount), candidates.length);
        candidates.push(element);

        return _.map(candidates, _getElementLabel).join(' > ');
    };

    /**
     * Get a human readable label for an arbitary HTML element without any
     * data-ga-label attr defined.
     */
    var _getUnlabeledElementLabel = function(element) {
        var $elem = $(element);
        var text = $elem.text().trim();
        var id = $elem.attr('id');
        var name = $elem.prop('tagName').toLowerCase();

        if (name === 'label') {
            return '"' + text + '"';
        }

        if (id) {
            name += '#' + id;
        }

        if (text) {
            name += ':contains("' + text + '")';
        }

        return name;
    };

    var _getLabeledElementLabel = function(element) {
        return '"' + $(element).data('ga-label') + '"';
    };

    var _getElementLabel = function(element) {
        if ($(element).data('ga-label')) {
            return _getLabeledElementLabel(element);
        }
        return _getUnlabeledElementLabel(element);
    };

    /**
     * A version of the Google Analytics ga() function which mirrors commands
     * across all enabled trackers.
     *
     * Currently the send and set methods are supported.
     */
    var ga = exports.ga = function(methodName) {
        var args = _.toArray(arguments).splice(1);

        switch(methodName) {
            case GA_SEND:
                gaSend.apply(args);
                break;
            case GA_SET:
                gaSet.apply(args);
                break;
            default:
                throw new Error('Unsupported ga() method: ' + methodName);
        }
    };

    /**
     * Set a field's value on all enabled trackers.
     *
     * Arguments match those accepted by ga('set', ...).
     */
    var gaSet = exports.gaSet = function() {
        var trackers = _getGaEnabledTrackerNames();

        _.forEach(trackers, _.partial(_gaSet, window.ga, _.toArray(arguments)));
    };

    var _gaSet = function(gaFunc, gaArguments, tracker) {
        var gaArgs = _gaBuildArgs(tracker, GA_SET, gaArguments);
        gaFunc.apply(null, gaArgs);
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

    /**
     * A convenience function to call gaSend with hit type set to event.
     *
     * Arguments match those accepted by ga('send', 'event', ...).
     */
    var gaSendEvent = exports.gaSendEvent = _.partial(gaSend, HIT_EVENT);

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

        if (lastIndex === -1 || !_.isObject(gaArguments[lastIndex])) {
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
