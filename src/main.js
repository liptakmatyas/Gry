(function($) {

    var ready = false;

    var $ctrlPanel = null;

/*
    var $colonyHeader = null;
    var $colonyTab = null;
    var $heroTab = null;
    var $swarmTab = null;
    var $arsenalTab = null;
    var $shopTab = null;

    $colonyTab = $('#colonyTab');
    $heroTab = $('#heroTab');
    $swarmTab = $('#swarmTab');
    $arsenalTab = $('#arsenalTab');
    $shopTab = $('#shopTab');
*/

    var GryFrag = Gry.Frag;

    $(document).ready(function() {
        var G = Gry.Phx({
            viewId: 'viewDiv',
            worldScale: 30,
            isDebugMode: false
        });

        var nFighters = 10;
        var teamsInGame = [
            { color: 'x00',    heroLevel: 1,   fighterMode: 'fight' }
        ,   { color: '0x0',    heroLevel: 1,   fighterMode: 'shield' }
        ,   { color: '00x',    heroLevel: 1,   fighterMode: 'shield' }
        ];

        var i, n = teamsInGame.length;
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

        var teamColorName = 'red';
        var teamName = 'Red';

        var css_normalHeader = teamColorName+'-normal';

        //  -----

        var amount = 99;
        var itemName = 'helm';
        var itemDesc = 'Description of helm';
        var goldCost = 1234;
        var manaCost = 5678;

        var CPFrag =
            GryFrag.imgLabel('colonyHeader', 'colony', teamName, 'Huge') +

            GryFrag.tab('colonyTab', 'colony', 'COLONY',
                GryFrag.hpBox('colonyHP', '123456', '999999') +
                GryFrag.goldBox('colonyGold', '1234', '9999') +
                GryFrag.manaBox('colonyMana', '12', '99')
            ) +

            GryFrag.tab('heroTab', 'hero', 'HERO',
                GryFrag.imgLabel('heroHP', 'hp', '123456/999999') +
                '<div class="statRow">' +
                    GryFrag.imgLabel('heroLevel', 'level', 999, 'Small') +
                    GryFrag.imgLabel('heroXP', 'level', 123456, 'Small') +
                    '<div class="dmgshd">' +
                        GryFrag.imgLabel('heroDamage', 'damage', 123.45, 'Small') +
                        GryFrag.imgLabel('heroShield', 'shield', 999.99, 'Small') +
                    '</div>' +
                '</div>' +
                '<div id="heroFlags">' +
                    GryFrag.imgButton('avoidFlag', 'avoid') +
                    GryFrag.imgButton('moveToFlag', 'moveto') +
                    GryFrag.imgButton('attackFlag', 'attack') +
                '</div>'
            ) +

            GryFrag.tab('swarmTab', 'swarm', 'SWARMS',
                '<div id="swarmList">' +
                    GryFrag.imgButton('fighterSwarm', 'fighter') +
                    GryFrag.imgButton('goliathSwarm', 'goliath') +
                '</div>'
            ) +

            GryFrag.tab('arsenalTab', 'arsenal', 'ARSENAL',
                '<div id="weaponList">' +
                    GryFrag.imgButton('rocketButton', 'rocket') +
                    GryFrag.imgButton('orbiterCannonButton', 'orbiter-canon') +
                '</div>'
            ) +

            GryFrag.tab('shopTab', 'shop', 'SHOP',
                '<div id="shopBox">' +
                    GryFrag.shopItem(amount, itemName, itemDesc, goldCost, manaCost) +
                '</div>'
            );

        //  -----

        $ctrlPanel = $('#controlPanel').append(CPFrag);

        $('#colonyHeader').addClass(css_normalHeader);

        $('div.tabHeader')
            .addClass(css_normalHeader)
            .click(function() {
                $(this).next('.tabContent').toggle();
            });

        //  -----

        G.StartLoop();

        ready = true;
    });

})(jQuery)

