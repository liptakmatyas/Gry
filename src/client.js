$(document).ready(function() {

    var G = Gry.System({
        viewId: 'viewDiv',
        worldScale: 30,
        isDebugMode: false
    });

    var teamsInGame = [
        { color: 'x00',    heroLevel: 1,   fighterMode: 'shield' },
        { color: '0x0',    heroLevel: 1,   fighterMode: 'fight' },
        { color: '00x',    heroLevel: 1,   fighterMode: 'fight' }
    ];

    var i, n = teamsInGame.length;
    var nFighters = 50;
    for (i = 0; i < n; ++i) {
        var team = teamsInGame[i];
        var maxHP = team.heroLevel*100;
        var hero = G.AddHero({
            symbol: String.fromCharCode(parseInt('25A3', 16)),
            level: team.heroLevel,
            HP: maxHP,
            maxHP: maxHP,
            team: team.color,
            mapPos: Gry.rndPos(G.MapDim()),
            flagPos: {
                avoid: Gry.rndPos(G.MapDim()),
                moveTo: Gry.rndPos(G.MapDim())
            }
        });
        for (j = 0; j < nFighters; ++j) {
            var maxHP = 50;
            var fighter = G.AddFighter({
                team: team.color,
                HP: maxHP,
                maxHP: maxHP,
                fighterMode: team.fighterMode,
                mapPos: Gry.rndPos(G.MapDim())
            });
        }
    }

    G.StartLoop();

});

