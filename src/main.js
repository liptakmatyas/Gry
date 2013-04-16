(function($) {

    var setupLevel = function(G) {
        var nFighters = 30;
        var nTreasure = 5;
        var teamsInGame = [
            { color: 'x00',    heroLevel: 1,   fighterMode: 'shield' }
        ,   { color: '0x0',    heroLevel: 1,   fighterMode: 'shield' }
        ,   { color: '00x',    heroLevel: 1,   fighterMode: 'shield' }
        ];

        var i, n = teamsInGame.length;
        for (i = 0; i < n; ++i) {
            var team = teamsInGame[i];
            var maxHP = team.heroLevel*100;

            var hero = G.AddHero({
                symbol: String.fromCharCode(parseInt('25A3', 16)),
                XP: 0,
                level: team.heroLevel,
                gold: 0,
                HP: maxHP,
                maxHP: maxHP,
                team: team.color,
                fighterMode: team.fighterMode,
                mapPos: Gry.rndPos(G.MapDim())
            });
            if (team.color === 'x00') {
                Gry.plr = { hero: hero };
            }

            /*
            var orb = new Gry.PathOrb(G, {
                id:     'track',
                type:   'path',
                team:   hero.team,
                radius: 10,
                range:  30,
                mapPos: Gry.rndPos(G.MapDim()),
                tail:   [ Gry.rndPos(G.MapDim()), Gry.rndPos(G.MapDim()), Gry.rndPos(G.MapDim()) ]
            });
            hero.AddOrb(orb);
            */

            /*
            var jumpy = function(hero, orbType) {
                (function(hero, orbId, orbType) {
                    var on = false;
                    var intv = 1000;
                    var jumpy = function(hero, orbId, orbType) {
                        if (on) {
                            hero.RemoveOrbId(orbId);
                            on = false;
                        }
                        else {
                            var orb = (orbType === 'avoid'      ? new Gry.AvoidOrb(G, { id: orbId, team: hero.team, radius: 10, range: 100*Math.random(), type: orbType, mapPos: Gry.rndPos(G.MapDim()) })
                                    : (orbType === 'moveTo'     ? new Gry.MoveToOrb(G, { id: orbId, team: hero.team, radius: 10, range: 50*Math.random(), type: orbType, mapPos: Gry.rndPos(G.MapDim()) })
                                    : null));
                            hero.AddOrb(orb);
                            on = true;
                        }
                        if (hero.HP > 0) { setTimeout(function() { jumpy(hero, orbId, orbType) }, intv); }
                    };
                    setTimeout(function() { jumpy(hero, orbId, orbType) }, intv);
                }(hero, 'jumpy_'+orbType, orbType));
            };
            jumpy(hero, 'moveTo');

            (function(hero) {
                setTimeout(function() { jumpy(hero, 'avoid'); }, 500);
            }(hero));
            */

            for (j = 0; j < nFighters; ++j) {
                var maxHP = 50;
                G.AddFighter(hero, {
                    team: team.color,
                    HP: maxHP,
                    maxHP: maxHP,
                    mapPos: Gry.rndPos(G.MapDim())
                });
            }

            for (j = 0; j < nTreasure; ++j) {
                G.AddTreasure({
                    team: team.color,
                    mapPos: Gry.rndPos(G.MapDim())
                });
            }
        }
    };

    $(document).ready(function() {
        Gry.assetMgr = new Gry.AssetManager();
        Gry.gui = new Gry.GUI('viewDiv');
        Gry.gui.setupControlPanelDOM('red');

        //  FIXME   Gry.Phx is not a Class yet...
        Gry.phx = Gry.Phx({
            viewId: 'viewDiv',
            worldScale: 30,
            isDebugMode: false
        });
        setupLevel(Gry.phx);
        Gry.phx.StartLoop();
    });

})(jQuery)

