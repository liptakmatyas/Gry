(function() {

    var OrbFactory = {
        'avoid': Gry.AvoidOrb,
        'moveTo': Gry.MoveToOrb,
        'path': Gry.PathOrb
    };

    Gry.SetOrbTarget = Class.extend({
        init: function(orbType) {
            this.orbType        = orbType;  //  Type of orb to place at the end
            this.orb            = null;     //  The orb that has been created as the result of this action
            this.chain          = null;     //  The chain that this activity is part of
            this.param          = null;     //  OPTIONAL parameters for the activity
            this.am_callback    = null;     //  ActivityManager's callback
            this.done_handler   = null;     //  The bound done handler
        },

        //  ->  am_callback:    Callback of the ActivityManager to call at the end of this action
        //  ->  chain:          The chain that triggered the start of the activity
        //  ->  param:          OPTIONAL parameters for the activity
        begin: function(am_callback, chain, param) {
            this.am_callback = (typeof am_callback === 'function' ? am_callback : null);
            this.chain = chain;
            this.param = param;

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
                Gry.actman.SetMode({ name: 'SetOrbTarget', param: { type: this.orbType, DOMElement: $('#'+this.orbType) } }, this.chain);
                this.orb = null;
                this.done_handler = this.done.bind(this);
                Gry.gui.$canvas.on('click', this.done_handler);
                return false;
            };
        },

        done: function(e) {
            var hero = Gry.heroes[0];   //  FIXME   UGLY HACK!
            var timestamp = Date.now();
            this.orb = new OrbFactory[this.orbType](Gry.phx, {
                id: this.orbType+'-'+timestamp,
                type: this.orbType,
                team: hero.team,
                creatorChain: this.chain, 
                creatorChainTS: this.chain.timestamp,
                radius: 10,
                range: 30,
                mapPos: { x: e.offsetX+1, y: e.offsetY+1 }
            });
            hero.AddOrb(this.orb);

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

