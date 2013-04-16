Gry.Frag = (function($) {

    var dimension = function(type) {
        if      ( type === 'Small') {   size = '16x16'; }
        else if ( type === 'Huge')  {   size = '64x64'; }
        else    { type = 'Normal';      size = '32x32'; }   //  Default

        return { type: type, size: size };
    };

    //  -----

    var Frag = {
        imgLabel: function(id, imgName, label, labelType) {
            var dim = dimension(labelType);
            return '<div id="'+id+'_imgLabel" class="imgLabel'+dim.type+'">' +
                '<img src="img/'+imgName+'.'+dim.size+'.png"/>' +
                '<div id="'+id+'" class="label">'+label+'</div>' +
            '</div>';
        },

        tab: function(tabId, tabName, label, content) {
            return '<div id="'+tabId+'" class="tab">' +
                '<div id="'+tabId+'_header" class="tabHeader">' +
                    '<img src="img/'+tabName+'.16x16.png"/>' +
                    '<div class="label">'+label+'</div>' +
                '</div>' +
                '<div class="tabContent">' +
                    content +
                '</div>' +
            '</div>';
        },

        imgButton: function(buttonId, imgName, buttonType) {
            var dim = dimension(buttonType);
            return '<img id="'+buttonId+'" class="imgButton'+dim.type+'" ' +
                'src="img/'+imgName+'.'+dim.size+'.png"/>';
        },

        /*
        dualLabel: function(id, iconNameA, labelA, iconNameB, labelB) {
            return '<div id="'+id+'" class="dualLabel">' +
                '<img class="A" src="img/'+iconNameA+'.32x32.png"/>' +
                '<div class="A">'+labelA+'</div>' +
                '<div class="B">'+labelB+'</div>' +
                '<img class="B" src="img/'+iconNameB+'.32x32.png"/>' +
            '</div>';
        },
        */

        hpBox: function(boxId, act, max) {
            return this.dualLabel(boxId, 'hp', act, 'hp', max);
        },

        shortcutKeyIcon: function(key) {
            return '<div class="shortcutKeyIcon">' +
                '<span>' + key + '</span>' +
            '</div>';
        },

        amountBox: function(id, label, amount) {
            return '<div class="amountBox">' +
                '<div class="plusMinus">' +
                    '<button class="plus">+</button>' +
                    '<button class="minus">-</button>' +
                '</div>' +
                '<div id="'+id+'" class="amount">'+amount+'</div>' +
                '<div class="label">' + label + '</div>' +
            '</div>';
        },

        avoidOrbBox: function() {
            return '<div id="avoidOrbBox">' +
                this.shortcutKeyIcon('1') +
                this.imgButton('avoid', 'avoid') +
            '</div>';
        },

        /*
        goldBox: function(boxId, act, gain) {
            return this.dualLabel(boxId, 'gold', act, 'gold', gain);
        },

        manaBox: function(boxId, act, gain) {
            return this.dualLabel(boxId, 'mana', act, 'mana', gain);
        },

        shopItem: function(amount, itemName, itemDesc, goldCost, manaCost) {
            return '<div class="shopItem">' +
                '<div class="amountBox">' +
                    '<div class="plusMinus">' +
                        '<button class="plus">+</button>' +
                        '<button class="minus">-</button>' +
                    '</div>' +
                    '<div id="'+itemName+'_amount" class="amount">'+amount+'</div>' +
                '</div>' +
                '<div class="itemIcon">' +
                   '<img src="img/'+itemName+'.32x32.png" alt="helm"/>' +
                '</div>' +
                '<div class="itemDesc">'+itemDesc+'</div>' +
                '<div class="costBox">' +
                    this.imgLabel(itemName+'_goldCost', 'gold', goldCost, 'Small') +
                    this.imgLabel(itemName+'_manaCost', 'mana', manaCost, 'Small') +
                '</div>' +
                this.imgButton(itemName+'_buyButton', 'buy');
            '</div>'
        }
        */

    };

    return Frag;

})(jQuery);

