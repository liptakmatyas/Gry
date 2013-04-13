(function() {

    Gry.UnitType.HERO = 'hero';

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
                unitType: Gry.UnitType.HERO,
                unitIdx: stat.unitIdx,

                team: stat.team,
                HP: stat.HP,
                maxHP: stat.maxHP,
                mapPos: { x: stat.mapPos.x, y: stat.mapPos.y },
                mapDim: { w: size, h: size }
            });

            this.level = stat.level;
            this.orbs = [];
            this.symbol = stat.symbol;

            //  Override collision category
            var fixt = this.body.GetFixtureList();
            var filter = fixt.GetFilterData();
            filter.categoryBits = Gry.EntityCategory.HERO;
            fixt.SetFilterData(filter);
        },

        AddOrb: function(orb) {
            //console.log('[Hero.AddOrb] this, orbStat:', this, orbStat);
            orb.hero = this;
            this.orbs.push(orb);
            return this;
        },

        RemoveOrbId: function(orbId) {
            //console.log('[Hero.RemoveOrbId] this, orbId:', this, orbId);
            var orbs = this.orbs;
            var n = orbs.length;
            for (var i = 0; i < n; ++i) {
                if (orbs[i].id === orbId) {
                    var orb = orbs.splice(i, 1)[0];
                    Gry.World.DestroyBody(orb.body);
                    break;  //  The id should be unique...
                }
            }
            return this;
        },

    });

}());

