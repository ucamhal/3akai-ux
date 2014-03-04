require.config({
    'paths': {
        'jquery': '/avocet/components/jquery/dist/jquery',
        'text': '/avocet/components/requirejs-text/text',
        'underscore': '/shared/vendor/js/underscore',

        'jquery.fileupload': '/avocet/components/blueimp-file-upload/js/jquery.fileupload',
        'jquery.ui.widget': '/avocet/components/blueimp-file-upload/js/vendor/jquery.ui.widget',

        'oa-fileupload': '/avocet/js/fileupload',
        'oa-form': '/avocet/js/form'
    }
});

define([
    'jquery',
    'oa-fileupload',
    'oa-form'
], function($, Fileupload, Form) {
    'use strict';

    var widgets = {
        'fileupload': Fileupload,
        'form': Form
    };

    $(function() {
        $('[data-oa-widget]').each(function() {
            var widget = widgets[$(this).data('oa-widget')];
            if (widget) new widget(this);
        });
    });
});
