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

define(['oae.core'], function(oae) {

    /**
     * Renders the content on the page
     */
    var renderPage = function() {
        oae.api.util.template().render($('#home-content-template'), {}, $('#home-content-container'));
        oae.api.widget.loadWidgets($('#home-content-container'));

        if (!oae.data.me.anon) {
            var lastUploaded = sessionStorage.getItem('avocet-last-uploaded');
            if (lastUploaded) {
                sessionStorage.removeItem('avocet-last-uploaded');
                oae.api.util.template().render($('#oa-upload-success-template'), {
                    'addendumUrl': oae.api.config.getValue('oae-tickets', 'general', 'addendumUrl'),
                    'ticketId': lastUploaded
                }, $('#oa-upload-success-container'));
            }
        }
    }

    renderPage();
});
