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

/**
 * Bootstrap plugin which patches jQuery's show() and hide() functions to
 * keep them working when using Bootstrap 3.
 * See how Bootstrap broke show()/hide() here: https://github.com/twbs/bootstrap/issues/9881
 *
 * Bootstrap's hide/hidden/show classes now use display: none !important,
 * so setting display: none directly on an element (as jQuery does) no longer works.
 * To work around show() and hide() are patched to apply Bootstrap's
 * hidden/show classes in addition to calling through to jQuery's show()/
 * hide() functions.
 */
 define(['jquery'], function($) {

    /** @returns A show()/hide() function which adds & removes a class when showing/hiding. */
    var makeShowHide = function(addClass, removeClass, baseImplementation) {
        return function showHide() {
            if(arguments.length !== 0) {
                if(console && console.warn) {
                    console.warn("Bootstrap compatibility for $.show()/$.hide() is not implemented for show()/hide() calls with > 0 arguments. Falling back to jQuery's default implementation.");
                }
            }
            else {
                this.removeClass(removeClass).addClass(addClass);
            }
            return baseImplementation.apply(this, arguments);
        };
    };

    // Store the original show/hide functions to return later
    var original = {
        'originalShow': $.fn.show,
        'originalHide': $.fn.hide
    };

    // Override $(xx).show() and $(xx).hide() with our Bootstrap 3 compatible versions.
    $.fn.show = makeShowHide("show", "hide hidden", $.fn.show);
    $.fn.hide = makeShowHide("hidden", "show", $.fn.hide);

    return original;
});
