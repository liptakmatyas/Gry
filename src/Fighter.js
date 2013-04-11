Gry.Fighter = (function($) {

    var F = function(GSys, stat) {
        //console.log('[Gry.Fighter] stat:', stat);
        var fighter = Gry.Unit(GSys, {
            unitType: 'fighter',
            unitIdx: stat.unitIdx,

            team: stat.team,
            HP: stat.HP,
            maxHP: stat.maxHP,
            fighterMode: stat.fighterMode,

            body: null,
            mapPos: { x: stat.mapPos.x, y: stat.mapPos.y },
            imgW: 3,
            imgH: 3
        });

        //console.log('[Gry.Fighter] RETURNED fighter:', fighter);
        return fighter;
    };

    return F;

}(jQuery));

