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

define(['exports', 'jquery', 'underscore'], function(exports, $, _) {

    /**
     * Create a publication on the backend.
     *
     * @param  publication                         An object representing a publication.
     * @param  publication.sourceIds               One or more IDs of the form "source#id"
     * @param  publication.file                    An object.
     * @param  publication.file.file               A jQuery.fileupload file object
     * @param  publication.file.fileuploadElement  The DOM element that jQuery.fileupload has been bound to
     * @param  publication.displayName             A human readable name for the publication.
     * @param  [publication.publicationType]       One of the publication type constants.
     * @param  [publication.date]                  The date of the publication as milliseconds since the std epoch (e.g. Date.getTime()).
     * @param  [publication.thumbnailUri]
     * @param  publication.authors                 One or more author name strings.
     * @param  [publication.publisher]             The name of the publisher of this publication
     * @param  [publication.issueNumber]           The issueNumber of the journal the publication was published in.
     * @param  [publication.pageBegin]             The first page that the publication appears on in the publication the publication is published in.
     * @param  [publication.pageEnd]               The last page that the publication appears on in the publication the publication is published in.
     * @param  publication.extra                   An object containing additional arbitrary key-value pairs to associate with this publication.
     * @param  callback                            A function to call when the thing has been created.
     */
    var createPublication = exports.createPublication = function(publication, callback) {
        callback = callback || function() {};

        var $fileUploadElement = $(publication.file.fileuploadElement);
        var file = publication.file.file;

        if(!$fileUploadElement.length) {
            throw new Error('No publication.file.fileuploadElement provided');
        }
        if(!file) {
            throw new Error('No publication.file.file provided');
        }

        var formData = {
            sourceIds: [generateUserSourceId()],
            publicationType: "other",
            displayName: "",
            date: new Date().getTime(),
            thumbnailUri: null,
            authors: [],
            publisher: null,
            issueNumber: null,
            pageBegin: null,
            pageEnd: null
        };

        // Build the form data to send - update defaults w/ provided publication data
        _.extend(
            formData,
            _.pick(publication, "sourceIds", "displayName", "publicationType", "date", "thumbnailUri", "authors", "publisher", "issueNumber", "pageBegin", "pageEnd"),
            // Flatten values from the extra obj into the form data as extra-NAME=VALUE
            _.chain(publication.extra).pairs().map(_prefixExtraKey).object().value()
        );

        // Send the file w/ form data
        $fileUploadElement.fileupload('send', {
            'files': [file],
            'formData': formData,
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    var _prefixExtraKey = function(e, prefix) {
        return ["extra-" + e[0], e[1]];
    };

    /**
     * Generate a unique ID to use as the source ID of a user submitted
     * publication.
     *
     * @return The generated source ID - a string of the form "user#ID" where ID is a random ID.
     */
    var generateUserSourceId = exports.generateUserSourceId = function() {
        // Need to load oae.core on demand as it's not available when this
        // module is loaded.
        userId = require("oae.core").data.me.id;
        // Generate a random integer to use as an ID. 2^53 is the largest
        // representable integer in js, but should be large enough.
        var id = (Math.random() * 2 - 1) * Math.pow(2, 53);
        return "user#" + userId + "#" + id;
    };
});
