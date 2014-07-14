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

define(['exports', 'jquery', 'underscore', 'oae.api.util'], function(exports, $, _, utilAPI) {

    /**
     * Create a new ticket linked to a new publication.
     *
     * @param  {String}          displayName              Display title for the created publication
     * @param  {String}          correspondingAuthor      The name of the corresponding author of the publication
     * @param  {String}          journalName              The name of the journal the publication is published in
     * @param  {String[]}        funders                  An Array of names of funders who funded the publication, custom funder names should be using the 'other:<funderName>' format
     * @param  {String}          contactEmail             The email of the person who should be contacted regarding the submission of this publication
     * @param  {Boolean}         useCambridgeAddendum     Whether the submitter will use the Cambridge Authors' Addendum
     * @param  {String}          comments                 Free text containing comments or questions on the publication submission
     * @param  {String}          contentId                The ID of the content item associated with this ticket
     * @param  {Function}        [callback]               Standard callback method
     * @param  {Object}          [callback.err]           Error object containing error code and error message
     * @param  {Ticket}          [callback.ticket]        Ticket object representing the created ticket
     */
    var createTicket = exports.createTicket = function(publication, contentId, callback) {
        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        var data = {
            'contentId': contentId,
            'publication': publication,
            'sourceIds': [_generateUserSourceId()],
        };

        $.ajax({
            'type': 'POST',
            'url': '/api/ticket/create',
            'contentType': 'application/json',
            'data': JSON.stringify(data),
            'success': function (data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Generate a unique ID to use as the source ID of a user submitted
     * publication. A sourceId is used by Hilary to link together semantically
     * equivalent publication records from different sources.
     *
     * @return {String}         The generated source ID of the form "user#ID" where ID is an opaque random ID
     * @api private
     */
    var _generateUserSourceId = function() {
        var userId = require("oae.core").data.me.id;
        return "user#" + userId + "#" + utilAPI.generateId();
    };
});
