(function($) {

    Gry.ActivityChain = Class.extend({
        init: function(name, actionList) {
            this.name = name;
            this.chain = $.extend(true, [], actionList);    //  Deep copy

            this.reset();

            this.active = false;
            this.aborting = false;
            this.aborted = false;
            this.done = false;
        },

        isActive:   function() { return this.active; },
        isAborting: function() { return this.aborting; },
        isAborted:  function() { return this.aborted; },
        isDone:     function() { return this.done; },

        next: function() {
            if (this.chainIdx < this.chain.length) {
                ++this.chainIdx;
                this.current = this.chain[this.chainIdx];
            }
        },

        reset: function() {
            this.chainIdx = 0;
            this.current = this.chain[0];
        },

        //  Set up a chain of GUIActions and return the first event handler
        //  ->  actChain[]:     array of GUIAction objects
        //  <-  function(e):    event handler function for the first GUIAction
        //                      in the chain
        Begin: function(actman) {
            var DONE = function(e) {
                if (this.chainIdx < this.chain.length-1) {
                    if (!this.aborting) {
                        //  Trigger the next event handler from the chain in its
                        //  GUIAction's context
                        this.next();
                        this.current.begin(DONE.bind(this)).bind(this.current)(e);
                    }
                    else {
                        this.active = false;
                        this.aborted = true;
                        this.reset();
                    }
                }
                else {
                    this.active = false;
                    this.done = true;
                    this.reset();
                }
            };

            //  Return the first event handler of the chain
            //  -   The DONE() function has to run in this context, we're now
            //      in.
            //  -   The event handler function returned by current.begin() has
            //      to run in the context of the GUIAction object.
            var handler = this.current.begin(DONE.bind(this)).bind(this.current);
            var me = this;
            return function(e) {
                me.active = true;
                actman.ChainTriggered(me);
                return handler(e);
            };
        },

        //  Abort the currently active chain of GUIActions (if any)
        //
        //  -   Calls the end() handler of the currently active GUIAction (if
        //      there is one)
        Abort: function() {
            this.active = false;
            this.aborting = true;
            this.current.end(null);
            this.aborting = false;
        }

    });

}(jQuery));


