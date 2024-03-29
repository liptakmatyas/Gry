(function() {

    Gry.UnitType.FIGHTER = 'fighter';

    Gry.Fighter = Gry.Unit.extend({
        init: function(GSys, hero, stat) {
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

            this.hero = hero;
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
    //  -   .toEntity(fp) -> null / {sym, size}
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

    //  TODO    This is hardcoded for now, but should be set, as the parameter
    //          for the mode, from the GUI.
    //          -   Maybe using '.toHero().shieldRadius'?
    var shieldRadius = 1;

    Gry.FighterMode = {

        'shield': {
            toHero:     function(fp) { return ((fp.eA.team === fp.eB.team) ? { sym: 'a', size: 8*(fp.R2-shieldRadius*fp.eB.level) } : null); },
            toFighter:  function(fp) { return ((fp.eA.team === fp.eB.team) ? null : { sym: 'a', size: 0.5/fp.R2 }); }
        },

        'fight': {
            toHero:     function(fp) { return ((fp.eA.team !== fp.eB.team) ? { sym: 'a', size: 4/fp.R2 } : null); },
            toFighter:  function(fp) { return ((fp.eA.team !== fp.eB.team) ? { sym: 'a', size: 1/fp.R2 } : null); }
        }
    };

}());

