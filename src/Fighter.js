(function($) {

    //  TODO    This is hardcoded for now, but should be set, as the parameter
    //          for the mode, from the GUI.
    //          -   Maybe using '.toHero().shieldRadius'?
    var shieldRadius = 1;

    Gry.UnitType.FIGHTER = 'fighter';

    Gry.Fighter = Gry.Unit.extend({
        init: function(GSys, stat) {
            //console.log('[Gry.Fighter] stat:', stat);
            this._super(GSys, {
                entityType: Gry.EntityType.UNIT,
                unitType: Gry.UnitType.FIGHTER,
                unitIdx: stat.unitIdx,

                team: stat.team,
                HP: stat.HP,
                maxHP: stat.maxHP,

                mapPos: { x: stat.mapPos.x, y: stat.mapPos.y },
                mapDim: { w: 5, h: 5 }
            });

            this.fighterMode = stat.fighterMode;
        }

    });

    //
    //  Fighter modes
    //
    //  These are the available modes for the fighter swarm
    //
    //  -   shiled: protecting hero
    //  -   fight: attacking
    //
    //  All modes have the following functions to calculate forces:
    //
    //  -   .toOwnHero(fp)
    //  -   .toEnemyHero(fp)
    //  -   .toOwnFighter(fp)
    //  -   .toEnemyFighter(fp)
    //
    //  All such functions have the same signature:
    //
    //  -   .toEntity(fp) -> {sym, size}
    //      -   fp{bA,bB,pA,pB,dx,dy,R2}
    //      <-  .sym: force symmetry
    //          -   'a': only entity A is affected
    //          -   'b': only entity B is affected
    //          -   'ab': symmetrical force; both entities affected
    //      <-  .size: force size
    //          -   .size < 0: repel
    //          -   .size === 0: natural; i.e. no effect
    //          -   .size > 0: attract
    //

    Gry.FighterMode = {

        //  Own hero: attracts with radius
        //  Enemy fighters: attract
        'shield': {
            toOwnHero:      function(fp) { return { sym: 'a', size: 8*(fp.R2-shieldRadius*fp.eB.level), }; },
            toEnemyHero:    null,
            toOwnFighter:   null,
            toEnemyFighter: function(fp) { return { sym: 'a', size: 0.5/fp.R2 }; }
        },

        //  Enemy heroes: attract
        //  Enemy fighters: attract
        'fight': {
            toOwnHero:      null,
            toEnemyHero:    function(fp) { return { sym: 'a', size: 4/fp.R2 }; },
            toOwnFighter:   null,
            toEnemyFighter: function(fp) { return { sym: 'a', size: 1/fp.R2 }; }
        }
    };

}(jQuery));

