(function() {

    var OrbFactory = {
        'avoid': Gry.AvoidOrb,
        'moveTo': Gry.MoveToOrb,
        'path': Gry.PathOrb
    };

    Gry.SetOrbTarget = Class.extend({
        init: function(orbType) {
            this.orbType        = orbType;  //  Kind of orb to place at the end

            this.am_callback    = null;     //  ActivityManager's callback
            this.done_handler   = null;     //  The bound done handler
        },

        begin: function(am_callback) {
            //  The `ActivityManager` sends its callback at this point, so save
            //  it for later use in `end()`. `null` means this is the last
            //  action in the chain.
            this.am_callback = (typeof am_callback === 'function' ? am_callback : null);

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
                Gry.actman.SetMode({ name: 'SetOrbTarget', param: { type: this.orbType } });
                this.done_handler = this.done.bind(this);
                Gry.gui.$canvas.on('click', this.done_handler);
                return false;
            };
        },

        done: function(e) {
            var hero = Gry.heroes[0];   //  FIXME   UGLY HACK!
            var orb = new OrbFactory[this.orbType](Gry.phx, {
                id: this.orbType+'-'+Date.now(),
                type: this.orbType,
                team: hero.team,
                radius: 10,
                range: 30,
                mapPos: { x: e.offsetX+1, y: e.offsetY+1 }
            });
            hero.AddOrb(orb);

            this.end(e);
            return false;
        },

        end: function(e) {
            if (this.done_handler) {
                Gry.gui.$canvas.off('click', this.done_handler);
                this.done_handler = null;
            }
            if (e) Gry.actman.SetNormalMode();
            if (this.am_callback) this.am_callback(e);
        }
    });

}());

