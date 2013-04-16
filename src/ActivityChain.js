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

        reset: function() {
            this.chainIdx = 0;
            this.current = this.chain[0];
            this.timestamp = null;
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

        //  Set up a chain of GUIActions and return the first event handler
        //  ->  actChain[]:     array of GUIAction objects
        //  <-  function(e):    event handler function for the first GUIAction in the chain
        Begin: function(actman) {
            //  This is the callback that the GUIActions call from their end() method
            //  ->  e:      jQuery event object, originating from the done() handler of the GUIAction
            //  ->  param:  OPTIONAL parameter for the next element in the chain (if any)
            var DONE = function(e, param) {
                if (this.chainIdx < this.chain.length-1) {
                    if (!this.aborting) {
                        this.next();
                        //  Trigger the next event handler from the chain in its GUIAction's context
                        this.current.begin(DONE.bind(this), this, param).bind(this.current)(e);
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
                    actman.ChainDone(this);
                    this.reset();
                }
            };

            //  Return the first event handler of the chain
            //  -   The DONE() function has to run in this context, we're now in.
            //  -   The event handler function returned by current.begin() has
            //      to run in the context of the GUIAction object.
            var handler = this.current.begin(DONE.bind(this), this, null).bind(this.current);
            var me = this;
            return function(e) {
                me.timestamp = Date.now();
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


