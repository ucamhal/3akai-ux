/*!
 * Copyright 2013 Apereo Foundation (AF) Licensed under the
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

define(['exports', 'jquery'], function(exports, $) {

    /**
     * Get the publications authored by a user.
     *
     * @param  {String}         userId                  The userId whose publications you wish to fetch
     * @param  {String}         [start]                 The token used for paging. If the first page of results is required, `null` should be passed in as the token. For any subsequent pages, the `nextToken` provided in the feed from the previous page should be used
     * @param  {Number}         [limit]                 Maximum number of publications to return
     * @param  {Function}       callback                Standard callback method takes arguments `err` and `resp`
     * @param  {Object}         callback.err            Error object containing error code and error message
     * @param  {Object}         callback.publications   The list of publications
     */
    var getUserPublications = exports.getUserPublications = function (userId, start, limit, callback) {
        if (!userId) {
            throw new Error('A valid user id should be provided');
        }

        var data = {
            'start': start,
            'limit': limit
        };

        $.ajax({
            'url': getUserPublicationsURL(userId),
            'data': data,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get a URL pointing to the REST endpoint for the publications of the specified user.
     *
     * This can be used for APIs expecting to perform HTTP requests to REST endpoints directly.
     *
     * @param   {String}  userId   The userId whose publications you wish to fetch
     * @return  {String}           A URL string suitable for passing to $.ajax or similar
     */
    var getUserPublicationsURL = exports.getUserPublicationsURL = function (userId) {
        return '/api/publications/library/' + encodeURIComponent(userId);
    }
});
