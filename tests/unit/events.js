define([
    'text!fixtures/lockup.html',
    '$',
    'lockup'
], function(fixture, $) {
    var element;

    describe('lockup events', function() {
        beforeEach(function() {
            element = $(fixture);
        });

        afterEach(function() {
            if (element) {
                element.remove();
                element = null;
            }
        });
    });
});