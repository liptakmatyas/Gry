(function($) {

    Gry.Keyboard = Class.extend({
        init: function() {
            this.handlers = new Array(256);
            $('body').on('keyup', this.onKeyUp.bind(this));
        },

        bind: function(keyCode, handler) {
            if (typeof this.handlers[keyCode] === 'undefined') this.handlers[keyCode] = [];
            this.handlers[keyCode].push(handler);
        },

        unbind: function(keyCode, handler) {
            var handlers = this.handlers[keyCode];
            if (typeof handlers !== 'undefined') {
                for (var i = 0; i < handlers.length; ++i) {
                    handlers.splice(i, 1);
                }
            }
        },

        onKeyUp: function(e) {
            var handlers = this.handlers[e.keyCode];
            if (typeof handlers !== 'undefined') {
                for (var i = 0; i < handlers.length; ++i) {
                    handlers[i](e);
                }
            }
            return false;
        }
    });

}(jQuery));

