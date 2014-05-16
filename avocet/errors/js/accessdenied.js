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

    /**
     * Binds a click event to login button
     */
    var setupLogin = function() {
        $('#oa-accessdenied-login').on('click', oae.api.authentication.loginFirstEnabledStrategy);
    };

    /**
     * Initialise the access denied page
     */
    var initPage = function() {
        oae.api.util.template().render($('#oa-access-denied-message-template'), {}, $('#oa-access-denied-message-container'));
        if (oae.data.me.anon) {
            setupLogin();
        }
    };

    initPage();
});
