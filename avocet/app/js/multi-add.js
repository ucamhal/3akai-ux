define([
    'jquery',
    'underscore',
    'text!../templates/multi-add.html'
], function($, _, template) {
    'use strict';

    var MultiAdd = function(element, options) {
        _.bindAll(this);
        this.template = _.template(template);
        this.$el = $(element);
        this.data = _.extend({}, MultiAdd.DEFAULTS, options);
        this.data.instanceNumber = (MultiAdd.instanceNumber = MultiAdd.instanceNumber + 1 || 0);
        this.render();
        this.bindEvents();
    };

    MultiAdd.DEFAULTS = {
        'items': [],
        'placeholder': '',
        'error': false,
        'title': '',
        'name': ''
    };

    _.extend(MultiAdd.prototype, {
        'render': function() {
            this.$el.html(this.template(this.data));
        },
        'bindEvents': function() {
            this.$el.on('click', '.js-btn-add', this.onAddClick);
            this.$el.on('click', '.js-btn-remove', this.onRemoveClick);
        },
        'addItem': function(name) {
            this.data.items.push(name);
        },
        'removeItem': function(index) {
            this.data.items.splice(index, 1);
        },
        'getItems': function() {
            return this.data.items;
        },
        'onAddClick': function(event) {
            event.preventDefault();
            var value = this.$el.find('[type="text"]').val();
            if (value) {
                this.addItem(value);
                this.render();
            }
        },
        'onRemoveClick': function(event) {
            event.preventDefault();
            var index = $(event.currentTarget).data('index');
            this.removeItem(index);
            this.render();
        }
    });

    return MultiAdd;
});
