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
     * Binds all necesary event listeners
     */
    var addBinding = function() {
        // See if there is a link to a specific section in the page
        var linkedSection = $.url().attr().fragment.replace(/[^\w-]+/g, "");
        // Select the linked section
        var $jumpTo = $('#' + linkedSection);
        if ($jumpTo.length) {
            // If the element exist, listen for the widgetsready event
            $(document).on('widgetsready.oae', function() {
                // Scroll to the linked section once the widgets are loaded
                $(window).scrollTop($jumpTo.offset().top);
            });
        }
    };

    addBinding();
});
