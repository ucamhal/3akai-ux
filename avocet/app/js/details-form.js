define([
    'underscore',
    'text!/avocet/templates/details-form.html'
], function(_, template) {
    'use strict';

    var DetailsForm = function() {
        this.$el = $(element);
        this.data = _.extend({}, DetailsForm.DEFAULTS, options);
        this.template = _.template(template);
        this.render();
    };

    DetailsForm.DEFAULTS = {
        'state': 'idle'
    };

    _.extend(DetailsForm.prototype, {
        render: function() {
            this.$el.html(this.template(this.data));
        }
    });

    return DetailsForm;
});
