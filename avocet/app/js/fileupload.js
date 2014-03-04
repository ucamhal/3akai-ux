define([
    'jquery',
    'underscore',
    'text!/avocet/templates/fileupload.html',
    'jquery.fileupload'
], function($, _, template) {
    'use strict';

    var Fileupload = function(element, options) {
        this.$el = $(element);
        this.data = _.extend({}, Fileupload.DEFAULTS, options);
        this.template = _.template(template);
        this.render();
    };

    Fileupload.DEFAULTS = {
        'state': 'idle'
    };

    _.extend(Fileupload.prototype, {
        render: function() {
            this.$el.html(this.template(this.data));
        }
    });

    return Fileupload;
});
