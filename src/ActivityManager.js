(function() {

    Gry.ActivityManager = Class.extend({
        init: function(mouse, keyboard) {
            this.mouse = mouse;
            this.keyboard = keyboard;
            this.actChain = null;
            this.SetMode({ name: 'normal', param: null });
        },

        //  Set new activity mode
        //  ->  mode{name,param}: mode information
        //      -   name:   the name of the mode
        //      -   param:  OPTIONAL parameters for the mode
        //
        //  -   Syncs the mouse cursor to the new mode.
        SetMode: function(mode, chain) {
            if (this.mode !== 'normal' && this.actChain !== chain) {
                this.AbortChain();
            }
            this.mode = mode.name;
            this.modeParam = (typeof mode.param === 'object' ? mode.param : null);

            this.mouse.setMode(mode.name);
            Gry.keyboard.bind(27, this.AbortChain.bind(this));
        },

        SetNormalMode: function(chain) { this.SetMode({ name: 'normal' }, chain); },
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
            Gry.keyboard.unbind(27, this.AbortChain.bind(this));
        },

        ChainTriggered: function(chain) {
            var c = this.actChain;
            if (c && (chain.name !== c.name || c.isActive())) {
                this.AbortChain();
            }
            this.actChain = chain;
        },

        ChainDone: function(chain) {
            if (this.actChain !== chain) throw 'An unknown activity chain finished.';
            this.actChain = null;
        }

    });

}());

