$(document).ready(function() {

    var G = Gry.System({
        viewId: 'viewDiv',
        worldScale: 30,
        isDebugMode: false
    });

    var teamsInGame = [ 'red', 'blue' ];
    var i, n = teamsInGame.length;
    for (i = 0; i < n; ++i) {
        var hero = G.AddHero({
            team: teamsInGame[i],
            mapPos: G.RndPos(G.MapDim())
        });
    }

    G.StartLoop();

});

