(function() {

    var GryFrag = Gry.Frag;

    Gry.GUI = Class.extend({
        init: function(viewDivId) {
            this.viewDivId  = viewDivId;
            this.$viewDiv   = $('#'+viewDivId);
            this.viewWidth  = this.$viewDiv.width();
            this.viewHeight = this.$viewDiv.height();

            this.canvasId   = null;
            this.$canvas    = null;

            this.$ctrlPanel = null;
            this.$avoidOrb  = null;
            this.$moveToOrb = null;
            this.$pathOrb   = null;
        },

        setupCanvas: function(canvasId) {
            this.canvasId = canvasId;

            //  tabindex="0" is needed, so that the canvas can get focus and we can handle the keyboard events
            this.$canvas = $('<canvas id="'+this.canvasId+'" width="'+this.viewWidth+'" height="'+this.viewHeight+'" tabindex="0"></canvas>');
            this.$canvas.css({
                'position': 'absolute',
                'left': '0',
                'top': '0',
                'border': 'none',
                'border-collapse': 'collapse',
                'padding': '0',
                'margin': '0',
                'background-color': '#FFF',
                'outline': 'none'
            });
            this.canvasCtx = this.$canvas[0].getContext("2d");
            this.$viewDiv.append(this.$canvas);
            this.$canvas.focus();

            return this.$canvas;
        },

        setupControlPanelDOM: function() {
            //  FIXME   Hard-coded values
            var teamColorName = 'red';
            var teamName = 'Red';
            var css_normalHeader = teamColorName+'-normal';
            var amount = 99;
            var itemName = 'helm';
            var itemDesc = 'Description of helm';
            var goldCost = 1234;
            var manaCost = 5678;

            var CPFrag =
                GryFrag.imgLabel('colonyHeader', 'colony', teamName, 'Huge') +

                /*
                GryFrag.tab('colonyTab', 'colony', 'COLONY',
                    GryFrag.hpBox('colonyHP', '123456', '999999') +
                    GryFrag.goldBox('colonyGold', '1234', '9999') +
                    GryFrag.manaBox('colonyMana', '12', '99')
                ) +
                */

                GryFrag.tab('heroTab', 'hero', 'HERO',
                    GryFrag.imgLabel('heroHP', 'hp', '123456/999999') +
                    '<div class="statRow">' +
                        GryFrag.imgLabel('heroLevel', 'level', 999, 'Small') +
                        GryFrag.imgLabel('heroXP', 'level', 123456, 'Small') +
                        '<div class="dmgshd">' +
                            GryFrag.imgLabel('heroDamage', 'damage', 123.45, 'Small') +
                            GryFrag.imgLabel('heroShield', 'shield', 999.99, 'Small') +
                        '</div>' +
                    '</div>' +
                    '<div id="heroOrbs">' +
                        GryFrag.avoidOrbBox() +
                        //GryFrag.imgButton('moveTo', 'moveto') +
                        //GryFrag.imgButton('path', 'path') +
                    '</div>'
                //) +

                /*
                GryFrag.tab('swarmTab', 'swarm', 'SWARMS',
                    '<div id="swarmList">' +
                        GryFrag.imgButton('fighterSwarm', 'fighter') +
                        GryFrag.imgButton('goliathSwarm', 'goliath') +
                    '</div>'
                ) +

                GryFrag.tab('arsenalTab', 'arsenal', 'ARSENAL',
                    '<div id="weaponList">' +
                        GryFrag.imgButton('rocketButton', 'rocket') +
                        GryFrag.imgButton('orbiterCannonButton', 'orbiter-canon') +
                    '</div>'
                ) +

                GryFrag.tab('shopTab', 'shop', 'SHOP',
                    '<div id="shopBox">' +
                        GryFrag.shopItem(amount, itemName, itemDesc, goldCost, manaCost) +
                    '</div>'
                */
                );

            this.$ctrlPanel = $('#controlPanel').append(CPFrag);
            $('#colonyHeader').addClass(css_normalHeader);
            $('div.tabHeader')
                .addClass(css_normalHeader)
                .click(function() { $(this).next('.tabContent').toggle(); });

            this.$avoidOrb  = $('#avoid');
            this.$moveToOrb = $('#moveTo');
            this.$pathOrb   = $('#path');
        }
    });


}());

