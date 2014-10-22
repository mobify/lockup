define([
    'text!fixtures/lockup.html',
    '$',
    'lockup'
], function(fixture, $) {
    var Lockup;
    var element;
    var lockup;

    describe('lockup options', function() {
        beforeEach(function() {
            Lockup = $.fn.lockup.Constructor;
            element = $(fixture);
        });

        afterEach(function() {
            if (element) {
                element.remove();
                element = null;
            }

            $('.pinny__container').removeClass('pinny__container');
        });

        describe('creates default options when no options parameter not used', function() {

        });

        describe('creates custom options when options parameter used', function() {

        });
    });
});
