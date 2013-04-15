(function() {

    Gry.ActivityManager = Class.extend({
        init: function(mouse) {
            if (typeof mouse !== 'object') throw 'Not a mouse object';
            this.mouse = mouse;
            this.actChain = null;
            this.SetMode({ name: 'normal', param: null });
        },

        //  Set new activity mode
        //  ->  mode{name,param}: mode information
        //      -   name:   the name of the mode
        //      -   param:  OPTIONAL parameters for the mode
        //
        //  -   Syncs the mouse cursor to the new mode.
        SetMode: function(mode) {
            this.AbortChain();
            this.mode = mode.name;
            this.modeParam = (typeof mode.param === 'object' ? mode.param : null);

            this.mouse.setMode(mode.name);
        },

        SetNormalMode: function() { this.SetMode({ name: 'normal' }); },
        GetModeParam: function() { return this.modeParam; },

        //  Set up a chain of GUIActions and return the first event handler
        //
        //  -   If there's already a running chain, that will be aborted first
        //      (via its Abort() method).
        RegisterChain: function(eventBinder, chain) {
            eventBinder(chain.Begin(this));
        },

        //  Abort the currently active chain of GUIActions (if any)
        AbortChain: function() {
            if (this.actChain) {
                this.actChain.Abort();
            }
        },

        ChainTriggered: function(chain) {
            var c = this.actChain;
            if (c && (chain.name !== c.name || c.isActive())) {
                this.AbortChain();
            }
            this.actChain = chain;
        }

    });

}());

