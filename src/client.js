$(document).ready(function() {

    var G = Gry.System({
        viewId: 'viewDiv',
        worldScale: 30,
        isDebugMode: false
    });

    var teamsInGame = [
        { color: '#800',    fighterMode: 'shield' },
        { color: '#080',    fighterMode: 'shield' },
        { color: '#008',    fighterMode: 'shield' }
    ];

    var i, n = teamsInGame.length;
    var nFighters = 50;
    for (i = 0; i < n; ++i) {
        var team = teamsInGame[i];
        var hero = G.AddHero({
            team: team.color,
            mapPos: G.RndPos(G.MapDim())
        });
        for (j = 0; j < nFighters; ++j) {
            var fighter = G.AddFighter({
                team: team.color,
                fighterMode: team.fighterMode,
                mapPos: G.RndPos(G.MapDim())
            });
        }
    }

    G.StartLoop();

});

