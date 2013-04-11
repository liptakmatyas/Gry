Gry.Hero = (function($) {

    var H = function(GSys, stat) {
        //console.log('[Hero.New] stat:', stat);
        var size = 10*stat.level;
        var hero = Gry.Unit(GSys, {
            unitType: 'hero',
            unitIdx: stat.unitIdx,

            team: stat.team,
            HP: stat.HP,
            maxHP: stat.maxHP,
            level: stat.level,
            flags: {
                avoid: stat.flagPos.avoid,
                moveTo: stat.flagPos.moveTo
            },

            body: null,
            symbol: stat.symbol,
            mapPos: { x: stat.mapPos.x, y: stat.mapPos.y },
            imgW: size,
            imgH: size
        });

        //console.log('[Hero.New] RETURNED hero:', hero);
        return hero;
    };

    return H;

}(jQuery));

