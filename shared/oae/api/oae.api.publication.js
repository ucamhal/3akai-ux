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
     * Get a full publication profile.
     *
     * @param  {String}       publicationId           Id of the publication we're trying to retrieve
     * @param  {Function}     callback                Standard callback method
     * @param  {Object}       callback.err            Error object containing error code and error message
     * @param  {Content}      callback.publication    Publication object representing the retrieved publication
     * @throws {Error}                                Error thrown when no publication id has been provided
     */
    var getPublication = exports.getPublication = function(publicationId, callback) {
        if (!publicationId) {
            throw new Error('A valid publication id should be provided');
        }

        $.ajax({
            'url': '/api/publications/' + publicationId,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    var updatePublication = exports.updatePublication = function(publicationId, publication, callback) {
        if (!publicationId) {
            throw new Error('A valid publication id should be provided');
        }

        if (!publication) {
            throw new Error('An object specifying the fields to be updated should be provided');
        }

        $.ajax({
            'type': 'POST',
            'url': '/api/publications/' + publicationId,
            'contentType': 'application/json',
            'data': JSON.stringify({
                'publication': publication
            }),
            'success': function (data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the publications uploaded by the current user.
     *
     * @param  {Function}        callback               Standard callback method
     * @param  {Object}          callback.err           Error object containing error code and error message
     * @param  {Publication[]}   callback.publication   List of publications representing the publications uploaded by the current user
     */
    var getMyUploads = exports.getMyUploads = function(callback) {
        $.ajax({
            'url': '/api/publications/uploads/' + require('oae.core').data.me.id,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };
});
