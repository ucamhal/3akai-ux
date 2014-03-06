define([
    'jquery',
    'underscore',
    'oae.core',
    'text!../templates/logout.html'
], function($, _, oae, template) {
    'use strict';
    var LogOut = function(element) {
        _.bindAll(this);
        this.$el = $(element)
        this.template = _.template(template);
        this.render();
        this.bindEvents();
    };

    _.extend(LogOut.prototype, {
        'render': function() {
            this.$el.html(this.template());
        },
        'bindEvents': function() {
            this.$el.on('click', '.js-btn-logout', this.onLogOutClick);
        },
        'onLogOutClick': function(event) {
            event.preventDefault();
            oae.api.authentication.logout(function() {
                window.location = '/';
            });
        }
    });

    return LogOut;
});
