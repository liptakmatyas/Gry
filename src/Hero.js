(function($) {

    //  Add .orbIdx to all elements in the orbs array, accoding to their index
    var indexOrbList = function(orbs) {
        var n = orbs.length;
        for (var i = 0; i < n; ++i) {
            orbs[i].orbIdx = i;
        }
        return orbs;
    };

    Gry.Hero = Gry.Unit.extend({
        init: function(GSys, stat) {
            //console.log('[Hero.init] stat:', stat);

            var size = 20*stat.level;

            this._super(GSys, {
                unitType: 'hero',
                unitIdx: stat.unitIdx,

                team: stat.team,
                HP: stat.HP,
                maxHP: stat.maxHP,
                mapPos: { x: stat.mapPos.x, y: stat.mapPos.y },
                mapDim: { w: size, h: size }
            });

            this.level = stat.level;
            this.orbs = {
                'avoid':    new Gry.Orb(GSys, { name: 'avoid',  mapPos: stat.flagPos.avoid }),
                'moveTo':   new Gry.Orb(GSys, { name: 'moveTo', mapPos: stat.flagPos.moveTo })
            };
            this.symbol = stat.symbol;
        }
    });

}(jQuery));

