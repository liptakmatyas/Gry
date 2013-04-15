(function() {

    Gry.SetOrbTail = Class.extend({
        init: function() {
            this.orb            = null;     //  The orb, to which the tail has to be attached
            this.chain          = null;     //  The chain that this activity is part of
            this.am_callback    = null;     //  ActivityManager's callback
            this.done_handler   = null;     //  The bound done handler
        },

        //  ->  am_callback:    Callback of the ActivityManager to call at the end of this action
        //  ->  chain:          The chain that triggered the start of the activity
        //  ->  param:          The orb to which we have to attach the new tail
        begin: function(am_callback, chain, param) {
            this.am_callback = am_callback;
            this.chain = chain;
            this.orb = param;

            //  Return the event handler that should be called when the player
            //  starts setting a new orb target.
            //
            //  This will also be called, when the `ActivityManager` simulates
            //  an event upon triggering the next element of an action chain.
            //  In this case the received event will be the one received by the
            //  *previous* action's `done()` handler, by passing it through the
            //  following route:
            //
            //      a1.done(e) -> a1.end(e) -> AM.DONE(e) -> a2.begin(e)
            //
            //      -   'a1' is the previous `GUIAction`
            //      -   'AM' is the `ActivityManager`, and `AM.DONE()` is the
            //          same as `am_callback` passed in to `begin()`.
            //      -   'a2' is the current `GUIAction`
            return function(e) {
                Gry.actman.SetMode({ name: 'SetOrbTail', param: { orb: this.orb } }, this.chain);
                this.done_handler = this.done.bind(this);
                Gry.gui.$canvas.on('click', this.done_handler);
                return false;
            };
        },

        done: function(e) {
            this.orb.AddTail({ x: e.offsetX+1, y: e.offsetY+1 });
            this.end(e);
            return false;
        },

        end: function(e) {
            if (this.done_handler) {
                Gry.gui.$canvas.off('click', this.done_handler);
                this.done_handler = null;
            }
            Gry.actman.SetNormalMode(this.chain);
            if (this.am_callback) this.am_callback(e, this.orb);
        }
    });

}());

