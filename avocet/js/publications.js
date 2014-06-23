/*!
 * Copyright 2014 Digital Services, University of Cambridge Licensed
 * under the Educational Community License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['jquery', 'oae.core', 'globalize'], function($, oae) {

    // Get the publication id from the URL. The expected URL is `/publications/<tenantId>/<publicationId>`.
    // The publication id will then be `p:<tenantId>:<publicationId>`
    // e.g. p:avocet:g1Z-sJMW0n
    var publicationId = 'p:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Variable used to cache the requested content profile
    var publicationProfile = null;

    /**
     * Set up the submission profile by getting the publication associated to the
     * submission, prefill the form and render the file and submission info panels
     */
    var setUpSubmissionProfile = function() {
        oae.api.publication.getPublication(publicationId, function(err, publication) {
            if (err) {
                oae.api.util.redirect().notfound();
            }

            // Cache the publication profile data
            publicationProfile = publication;
            // Set the browser title
            oae.api.util.setBrowserTitle(publicationProfile.displayName);
            // Render the publication info
            renderPublicationInfo();
            // Render the file info
            renderFileInfo();
            // Initialise the form
            initForm();
            // We can now unhide the page
            oae.api.util.showPage();
        });
    };

    /**
     * Render the publication info template
     */
    var renderPublicationInfo = function() {
        var receivedDate = new Date(publicationProfile.date);
        oae.api.util.template().render($('#oa-publicationinfo-template'), {
            'receivedDate': oae.api.l10n.transformDate(receivedDate),
            'referenceNumber': publicationProfile.ticket.externalId
        }, $('#oa-publicationinfo-container'));
    };

    /**
     * Render the file info template
     */
    var renderFileInfo = function() {
        oae.api.util.template().render($('#oa-fileinfo-template'), {
            'fileName': publicationProfile.linkedContent.filename,
            'fileSize': $.fn.fileSize(publicationProfile.linkedContent.size)
        }, $('#oa-fileinfo-container'));
    };

    /**
     * Initialise the form
     */
    var initForm = function() {
        // Fetch and insert the publicationform widget
        oae.api.widget.insertWidget('publicationform', null, $('#oa-publicationform-container'), null, {
            'publication': publicationProfile,
            'disabled': true
        });
    };

    setUpSubmissionProfile();
});
