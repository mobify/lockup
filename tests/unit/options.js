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

        describe('creates default options when no options parameter not used', function() {
            it('correctly defines container', function() {
                var lockup = new Lockup(element);

                assert.equal(lockup.options.container, Lockup.DEFAULTS.container);
                assert.isNull(lockup.options.container);
            });

            it('correctly defines events', function() {
                var lockup = new Lockup(element);

                assert.isFunction(lockup.options.locked);
                assert.isFunction(lockup.options.unlocked);
            });
        });

        describe('creates custom options when options parameter used', function() {
            it('correctly defines container', function() {
                var $container = $('<div />');
                var shade = new Lockup(element, { container: $container });

                assert.deepEqual(shade.options.container, $container);
                assert.isArray(shade.options.container);
            });

            it('correctly defines locked event', function() {
                var locked = function() {
                    console.log('Locked!')
                };
                var lockup = new Lockup(element, { locked: locked });

                assert.equal(lockup.options.locked, locked);
                assert.isFunction(lockup.options.locked);
            });

            it('correctly defines unlocked event', function() {
                var unlocked = function() {
                    console.log('unlocked!')
                };
                var lockup = new Lockup(element, { unlocked: unlocked });

                assert.equal(lockup.options.unlocked, unlocked);
                assert.isFunction(lockup.options.unlocked);
            });
        });
    });
});
