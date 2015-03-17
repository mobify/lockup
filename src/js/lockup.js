(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            '$',
            'plugin',
            'deckard'
        ], factory);
    } else {
        var framework = window.Zepto || window.jQuery;
        factory(framework, window.Plugin);
    }
}(function($, Plugin) {
    $.extend($.fn, {
        renameAttr: function(oldName, newName) {
            return this.each(function() {
                var $el = $(this);
                $el
                    .attr(newName, $el.attr(oldName))
                    .removeAttr(oldName);
            });
        }
    });

    var classes = {
        CONTAINER: 'lockup__container',
        LOCKED: 'lockup--is-locked'
    };

    function Lockup(element, options) {
        Lockup.__super__.call(this, element, options, Lockup.DEFAULTS);
    }

    Lockup.VERSION = '0';

    Lockup.DEFAULTS = {
        container: null,
        locked: $.noop,
        unlocked: $.noop
    };

    Plugin.create('lockup', Lockup, {
        _init: function(element) {
            this.$element = $(element);
            this.$html = $('html');
            this.$body = $('body');
            this.$roots = this.$html.add(this.$body);
            this.$doc = $(document);

            this.$container = this._buildContainer();

            // We track instances of elements using lockup so that when we
            // destroy lockup, we don't destroy it if elements are still
            // using it.
            var instanceCount = this._instanceCount();
            this._instanceCount(++instanceCount);
        },

        destroy: function() {
            var instanceCount = this._instanceCount();
            var containerGenerated = this.$container.data('generated');

            if (this._instanceCount(--instanceCount) === 0 && containerGenerated) {
                this._disableScripts(function() {
                    this.$body.append(this.$container.children());
                });

                this.$element.removeData(this.name);
                this.$container.remove();
            }
        },

        _instanceCount: function(count) {
            !isNaN(count) && this.$container.data('instance', count);

            return this.$container.data('instance') || 0;
        },

        /**
         * The body content needs to be wrapped in a containing
         * element in order to facilitate scroll blocking. One can
         * either be supplied in the options, or we'll create one
         * automatically, and append all body content to it.
         */
        _buildContainer: function() {
            // Check if there's a lockup container already created. If there is,
            // we don't want to create another. There can be only one!
            var $container = $('.' + classes.CONTAINER);

            if (!$container.length) {
                $container = this.options.container ?
                    $(this.options.container).addClass(classes.CONTAINER) :
                    this._createContainer();
            }

            $container.css({
                'overflow': 'hidden'
            });

            return $container;
        },

        _createContainer: function() {
            this._disableScripts(function() {
                this.$body.wrapInner($('<div />').addClass(classes.CONTAINER));
            });

            return this.$body.find('.' + classes.CONTAINER).data('generated', true);
        },

        _disableScripts: function(fn) {
            // scripts must be disabled to avoid re-executing them
            var $scripts = this.$body.find('script')
                .renameAttr('src', 'x-src')
                .attr('type', 'text/lockup-script');

            fn.call(this);

            $scripts.renameAttr('x-src', 'src').attr('type', 'text/javascript');
        },

        /**
         * This function contains several methods for fixing scrolling issues
         * across different browsers. See each if statement for an in depth
         * explanation.
         */
        lock: function() {
            var self = this;

            this.bodyPaddingTop = this._getStyle(self.$body, 'padding-top');
            this.bodyPaddingBottom = this._getStyle(self.$body, 'padding-bottom');
            this.bodyHasPadding = this.bodyPaddingTop > 0 || this.bodyPaddingBottom > 0;
            this.bodyMargin = this._getStyle(self.$body, 'margin-top');
            this.containerPaddingTop = 0;
            this.containerPaddingBottom = 0;

            if (this.bodyPaddingTop > 0) {
                this.containerPaddingTop = this._getStyle(self.$container, 'padding-top');
                this.containerPaddingBottom = this._getStyle(self.$container, 'padding-bottom');
            }

            this.scrollPosition = this.$body.scrollTop();

            this.$doc.off('touchmove', this._preventDefault);

            this.$container.addClass(classes.LOCKED);

            if ($.browser.chrome || ($.os.ios && $.os.major >= 8)) {
                this.$roots.height('100%');

                this.$container.css({
                    'overflow': 'hidden',
                    'height': window.innerHeight
                });

                if (this.bodyHasPadding) {
                    this.$body.css({
                        'padding-top': 0,
                        'padding-bottom': 0
                    });

                    this.$container.css({
                        'padding-top': this.containerPaddingTop + this.bodyPaddingTop,
                        'padding-bottom': this.containerPaddingBottom + this.bodyPaddingBottom
                    });
                }

                if (this.bodyMargin > 0) {
                    this.$body.css({
                        'margin-top': 0,
                        'margin-bottom': 0
                    });
                }

                this.$container.scrollTop(this.scrollPosition);

                this._trigger('locked');
            }
            /**
             * On iOS7 and under, the browser can't handle what we're doing
             * above so we need to do the less sexy version. Wait for the
             * focus to trigger and then jump scroll back to the initial
             * position. Looks like crap but it works.
             */
            else if ($.os.ios && $.os.major <= 7) {
                this.$element.find('input, select, textarea')
                    .on('focus', function() {
                        setTimeout(function() {
                            window.scrollTo(0, self.scrollPosition);

                            self._trigger('locked');
                        }, 0);
                    });
            } else {
                this._trigger('locked');
            }
        },

        /**
         * Undo all the things above
         */
        unlock: function() {
            this.$doc.on('touchmove', this._preventDefault);

            this.$container.removeClass(classes.LOCKED);

            if ($.browser.chrome || ($.os.ios && $.os.major >= 8)) {
                this.$roots.css('height', '');

                this.$body.css({
                    'margin': '',
                    'padding': ''
                });

                this.$container.css({
                    'overflow': '',
                    'height': ''
                });

                this.$container.css('padding', '');

                window.scrollTo(0, this.scrollPosition);
            } else if ($.os.ios && $.os.major <= 7) {
                this.$element.find('input, select, textarea').off('focus');
            }

            this._trigger('unlocked');

            this.$doc.off('touchmove', this._preventDefault);
        },

        isLocked: function() {
            return this.$container.hasClass(classes.LOCKED);
        },

        _preventDefault: function(e) {
            e.preventDefault();
        },

        _getStyle: function(e, property) {
            return parseInt(e.css(property));
        }
    });

    return $;
}));
