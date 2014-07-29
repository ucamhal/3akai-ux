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

define(['jquery', 'oae.core'], function($, oae) {

    var publication;
    var publicationSubmitter;

    /**
     * Get the publication id from the URL. The expected URL is `/publications/<tenantId>/<publicationId>`.
     * The publication id will then be `p:<tenantId>:<publicationId>`. e.g. p:avocet:g1Z-sJMW0n
     *
     * @return  {String}    A Publication id
     */
    var getPublicationIdFromURL = function() {
        var url = $.url();
        var tenantId = url.segment(2);
        var publicationId = url.segment(3);
        return tenantId && publicationId ? 'p:' + tenantId + ':' + publicationId : null;
    };

    /**
     * Fetch a publication by the id supplied in the URL
     *
     * @param  {Function}    callback      The function to be called when the publication has been fetched.
     */
    var fetchPublication = function(callback) {
        var publicationId = getPublicationIdFromURL();
        if (!publicationId) {
            oae.api.util.redirect().notfound();
        }

        oae.api.publication.getPublication(publicationId, function(err, fetchedPublication) {
            if (err) {
                if (err.code === 401) {
                    oae.api.util.redirect().accessdenied();
                } else {
                    oae.api.util.redirect().notfound();
                }
                return;
            }

            publication = fetchedPublication;
            callback();
        });
    };

    /**
     * Fetch the user who submitted the viewed publication
     *
     * @param  {Function}    callback      The function to be called when the user has been fetched.
     */
    var fetchPublicationSubmitter = function(callback) {
        oae.api.user.getUser(publication.linkedContent.createdBy, function(error, user) {
            publicationSubmitter = user;
            callback();
        });
    };

    /**
     * Initialise the page
     */
    var initPage = function() {
        renderPage();
        insertWidgets();
        addBinding();
    };

    /**
     * Render all the components on the page
     */
    var renderPage = function() {
        renderPublicationTitle();
        renderBackBar();
    };

    /**
     * Render the publication title
     */
    var renderPublicationTitle = function() {
        oae.api.util.template().render($('#oa-publication-title-template'), {
            'publication': publication
        }, $('#oa-publication-title-container'));
    };

    /**
     * Render the back navigation bar
     */
    var renderBackBar = function() {
        var $container = $('#oa-publication-back-container');
        if (oae.data.me.id === publication.createdBy) {
            oae.api.util.template().render($('#oa-publication-back-template'), null, $container);
        } else {
            $container.remove();
        }
    };

    /**
     * Insert all necessary widgets into the page
     */
    var insertWidgets = function() {
        insertPublicationMetadata();
        insertPublicationFile();
        insertPublicationForm();
    };

    /**
     * Insert the publication metadata widget
     */
    var insertPublicationMetadata = function() {
        oae.api.widget.insertWidget('publicationmetadata', null, $('#oa-publication-metadata-widget-container'), null, {
            'publication': publication,
            'publicationSubmitter': publicationSubmitter
        });
    };

    /**
     * Insert the publicationfile widget
     */
    var insertPublicationFile = function() {
        oae.api.widget.insertWidget('publicationfile', null, $('#oa-publicationfile-widget-container'), null, {
            'content': publication.linkedContent
        });
    };

    /**
     * Insert the publicationform widget
     */
    var insertPublicationForm = function() {
        oae.api.widget.insertWidget('publicationform', null, $('#oa-publicationform-widget-container'), null, {
            'publication': publication,
            'disabled': !(publication.permissions.isAdmin || publication.permissions.isGlobalAdmin)
        });
    };

    /**
     * Binds all necessary events
     */
    var addBinding = function() {
        if (publication.permissions.isAdmin || publication.permissions.isGlobalAdmin) {
            $(document).on('oa.publicationform.submit oa.trackingform.submit', function(event, publicationData) {
                oae.api.publication.updatePublication(publication.id, publicationData, function(err, data) {
                    if (!err) {
                        window.location.reload(true);
                    }
                });
            });
        }
    };

    fetchPublication(function() {
        if (publication.linkedContent) {
            fetchPublicationSubmitter(initPage);
        } else {
            initPage();
        }
    });
});
