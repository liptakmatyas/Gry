(function() {

    Gry.ActivityManager = Class.extend({
        init: function(mouse, keyboard) {
            this.mouse = mouse;
            this.keyboard = keyboard;
            this.actChain = null;
            this.SetMode({ name: 'normal', param: null });
            this.setupEventHandlers();
        },

        setupEventHandlers: function() {
            Gry.gui.$canvas.on('mouseenter',    Gry.mouse.onEnterMap.bind(Gry.mouse));
            Gry.gui.$canvas.on('mouseleave',    Gry.mouse.onLeaveMap.bind(Gry.mouse));
            Gry.gui.$canvas.on('mousemove',     Gry.mouse.onMoveOverMap.bind(Gry.mouse));

            this.RegisterChain(
                function(h) { Gry.gui.$avoidOrb.on('click', h); Gry.keyboard.bind(49, h); },
                new Gry.ActivityChain('set-AvoidOrb-target', [ new Gry.SetOrbTarget('avoid') ])
            );

            this.RegisterChain(
                function(h) { Gry.gui.$moveToOrb.on('click', h); Gry.keyboard.bind(50, h); },
                new Gry.ActivityChain('set-MoveToOrb-target', [ new Gry.SetOrbTarget('moveTo') ])
            );

            this.RegisterChain(
                function(h) { Gry.gui.$pathOrb.on('click', h); Gry.keyboard.bind(51, h); },
                new Gry.ActivityChain('set-PathOrb-target', [ new Gry.SetOrbTarget('path'), new Gry.SetOrbTail(), new Gry.SetOrbTail(), new Gry.SetOrbTail() ])
            );

            var setMode = function(mode) { return function(e) { debugger; Gry.plr.hero.fighterMode = mode; }; };

            Gry.gui.$fight.on('click', setMode('fight'));
            Gry.keyboard.bind(70, setMode('fight'));

            Gry.gui.$shield.on('click', setMode('shield'));
            Gry.keyboard.bind(83, setMode('shield'));

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

