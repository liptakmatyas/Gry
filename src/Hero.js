Gry.Hero = (function($) {

    var H = function(GSys, stat) {
        console.log('[Hero.New] stat:', stat);
        var hero = {
            symbol: stat.symbol,
            level: stat.level,
            HP: stat.HP,
            maxHP: stat.maxHP,
            body: null,
            mapPos: {
                x: stat.mapPos.x,
                y: stat.mapPos.y
            },
            team: stat.team,
            flags: {
                avoid: stat.flagPos.avoid,
                moveTo: stat.flagPos.moveTo
            }
        };

        var size = 10*hero.level;
        hero.body = GSys.createBox(GSys.scalePos2W(hero.mapPos),
                    GSys.scaleDim2W({ w: size, h: size }),
                    b2Body.b2_dynamicBody,
                    { unitType: 'hero', unitIdx: stat.unitIdx });

        console.log('[Hero.New] RETURNED hero:', hero);
        return hero;
    };

    return H;

}(jQuery));

