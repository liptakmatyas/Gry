/*
 *  TODO    UI elements for all teams
 *          -   hero HP display
 *          -   flags: enable/disable
 *          -   fighter count
 *          -   fighterMode dropdown
 *  TODO    remove null (i.e. dead) units from arrays
 *          -   heroes[], fighters[]
 *  TODO    more than one hero per team
 *          -   fighters need to be attached to one hero
 *          -   choose "image" (i.e. Unicode char)
 *              -   http://www.fileformat.info/info/unicode/category/So/list.htm
 *              -   U+25A2 ... U+25A9
 *          -   flags should also display the hero's character
 *  TODO    mouse handling
 *          -   placing/moving/removing flags
 *  TODO    multiple flags per hero
 *          -   assign weights for flags
 *  TODO    make forces depend on unit stats
 *          -   like mass for gravity
 *          -   causes hit points to relate to stats!
 *  TODO    use pre-rendering
 *          -   flags, background
 */

Gry.Phx = (function() {

    var GPhx = function(conf) {
        //console.log('[Phx] conf:', conf);

        Gry.worldScale = conf.worldScale;

        var isDebugMode = conf.isDebugMode;
        var debugDraw = null;

        var viewId = conf.viewId;
        var $viewDiv = null;
        var viewWidth = null;
        var viewWidthHalf = null;
        var viewHeight = null;
        var viewHeightHalf = null;

        var canvasId = viewId+'_canvas';
        var $canvas = null;
        var canvasCtx = null;

        var viewDimW = null;

        var FPS = 30;
        var frameTime = 1000/FPS;
        var isTicking = false;
        var ticker = null;

        var heroes = [];
        var fighters = [];

        var G = {

            //  Map dimensions
            //  () -> d{w,h}
            MapDim: function() {
                //  TODO    The map should be bigger than the view
                return { w: viewWidth, h: viewHeight };
            },

            AddHero: function(stat) {
                stat.unitIdx = heroes.length;
                var H = new Gry.Hero(this, stat);
                heroes.push(H);
                //console.log('[AddHero] H.x, H.y:', H.mapPos.x, H.mapPos.y);
                //console.log('[AddHero] H.body{x,y}:', H.body.GetPosition().x, H.body.GetPosition().y);
                //console.log('[AddHero] Added hero:', H);
                return H;
            },

            AddFighter: function(stat) {
                stat.unitIdx = fighters.length;
                var F = new Gry.Fighter(this, stat);
                fighters.push(F);
                return F;
            },

            StartLoop: function() {
                console.log('[StartLoop]');
                isTicking = true;

                ticker = setInterval(function() { tick(); }, frameTime); // TODO RAF
                //tick();
                return this;
            },

            //  Scale length to world size
            scaleLen2W: function(l) {
                return l/Gry.worldScale;
            },

            //  Scale length to map size
            scaleLen2M: function(l) {
                return Math.floor(l*Gry.worldScale);
            },

            //  Scale dimension d{w,h} to world dimensions
            scaleDim2W: function(d) {
                return { w: d.w/Gry.worldScale, h: d.h/Gry.worldScale };
            },

            //  Scale dimension d{w,h} to map dimensions
            scaleDim2M: function(d) {
                return { w: d.w*Gry.worldScale, h: d.h*Gry.worldScale };
            },

            //  Scale position p{x,y} to world coordinates
            scalePos2W: function(p) {
                return { x: p.x/Gry.worldScale, y: p.y/Gry.worldScale };
            },

            //  Scale position p{x,y} to map coordinates
            scalePos2M: function(p) {
                return { x: Math.floor(p.x*Gry.worldScale), y: Math.floor(p.y*Gry.worldScale) };
            },

        };

        /*
         *  Setup DOM
         */

        $viewDiv = $('#'+viewId);
        viewWidth = $viewDiv.width();
        viewHeight = $viewDiv.height();
        viewWidthHalf = viewWidth/2;
        viewHeightHalf = viewHeight/2;

        $canvas = $('<canvas id="'+canvasId+'" width="'+viewWidth+'" height="'+viewHeight+'"></canvas>');
        $canvas.css({
            'position': 'absolute',
            'left': '0',
            'top': '0',
            'border': 'none',
            'border-collapse': 'collapse',
            'padding': '0',
            'margin': '0',
            'background-color': '#FFF',
            /*'opacity': ( isDebugMode ? '0.6' : '0.01' )*/
        });
        canvasCtx = $canvas[0].getContext("2d");
        $viewDiv.append($canvas);

        /*
         *  Setup Box2D
         */

        Gry.World = new b2World(new b2Vec2(0, 0), true);

        var wallThickness = 30;
        var horizWallDim = { w: viewWidth, h: wallThickness };
        var vertWallDim = { w: wallThickness, h: viewHeight };
        new Gry.Wall(G, {
            wallIdx: 0,
            mapPos: { x: viewWidthHalf, y: viewHeight },
            mapDim: horizWallDim
        });
        new Gry.Wall(G, {
            wallIdx: 1,
            mapPos: { x: viewWidthHalf, y: 0 },
            mapDim: horizWallDim
        });
        new Gry.Wall(G, {
            wallIdx: 2,
            mapPos: { x: 0, y: viewHeightHalf },
            mapDim: vertWallDim
        });
        new Gry.Wall(G, {
            wallIdx: 3,
            mapPos: { x: viewWidth, y: viewHeightHalf },
            mapDim: vertWallDim
        });

        if (isDebugMode) {
            debugDraw = new b2DebugDraw();
            debugDraw.SetSprite(canvasCtx);
            debugDraw.SetDrawScale(Gry.worldScale);
            debugDraw.SetFillAlpha(0.9);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            Gry.World.SetDebugDraw(debugDraw);
        }

        //  F: absolute force size, without direction; float
        //  dx,dy: X/Y components of force direction; floats
        //  Returns v{x,y} with absolute size F, pointing to (dx;dy)
        var FVec = function(F, dx, dy) {
            var v = new b2Vec2(dx, dy);
            v.Normalize();
            v.x *= F;
            v.y *= F;
            return v;
        };

        //  applyForce(bodyA,bodyB,F,fp): Apply calculated force
        //  -   F{sym,size}: force symmetry and size
        //  -   fp{bA,bB,pA,pB,dx,dy,R2}: force pack
        var applyForce = function(F, fp) {
            //console.log('[applyForce] F, fp:', F, fp);

            var bodyA = fp.bA;
            var bodyB = fp.bB;

            if (F.sym === 'a') {
                bodyA.ApplyForce(FVec(F.size, fp.dx, fp.dy), bodyA.GetWorldCenter());
            }
            else if (F.sym === 'b') {
                bodyB.ApplyForce(FVec(F.size, fp.dx, fp.dy), bodyB.GetWorldCenter());
            }
            else if (F.sym === 'ab') {
                bodyA.ApplyForce(FVec(F.size, fp.dx, fp.dy), bodyA.GetWorldCenter());
                bodyB.ApplyForce(FVec(-F.size, fp.dx, fp.dy), bodyB.GetWorldCenter());
            }
            else {
                throw 'Bad symmetry: '+F.sym;
            }
        };

        //  eA, eB: entities
        //  Returns: ap{eA,eB,tA,tB,bA,bB,pA,pB,dx,dy,R2} action pack
        //  <-  .eA, .eB: entities
        //  <-  .tA, .tB: unit/entity types for force selection
        //  <-  .bA, .bB: Box2D bodies
        //  <-  .pA, .pB: world positions
        //  <-  .dx, .dy: X/Y components of distance from A to B in world scale (signed!)
        //  <-  .R2: squared distance between A and B in world scale
        var createForcePack = function(eA, eB) {
            //console.log('[createForcePack] eA, eB:', eA, eB);

            var bA = eA.body;
            var bB = eB.body;
            var pA = bA.GetPosition();
            var pB = bB.GetPosition();
            var dx = pB.x-pA.x;
            var dy = pB.y-pA.y;

            var fp = {
                eA: eA,
                eB: eB,
                tA: eA.entityType !== 'unit' ? eA.entityType : eA.unitType,
                tB: eB.entityType !== 'unit' ? eB.entityType : eB.unitType,
                bA: bA,
                bB: bB,
                pA: pA,
                pB: pB,
                dx: dx,
                dy: dy,
                R2: dx*dx + dy*dy
            };

            //console.log('[createForcePack] fp:', fp);
            return fp;
        };

        //  XXX hero-specific forces?
        //  -   hero.flags[flagId][unitType][fidx]()
        //  -   hero.units[unitType][fidx]()
        //  -   hero.hero[heroName][fidx]()
        //  XXX global forces
        //  XXX team specific forces

        var activeForces = function(fp) {
            var TYPE_SPECIFIC_FORCES = {
                'hero': {
                    'hero':     function(fp) { return function(fp) { return { sym: 'a', size: -2/fp.R2 }; }; },
                    'orb':      function(fp) { return fp.eB.force.bind(fp.eB); }
                },
                'fighter': {
                    'fighter':  function(fp) { return Gry.FighterMode[fp.eA.fighterMode].toFighter; },
                    'hero':     function(fp) { return Gry.FighterMode[fp.eA.fighterMode].toHero; }
                }
            };

            var forceSetA = TYPE_SPECIFIC_FORCES[fp.tA];
            if (typeof forceSetA !== 'object' || forceSetA === null) return null;
            var forceSetB = forceSetA[fp.tB];
            if (typeof forceSetB !== 'function') return null;
            var forces = forceSetB(fp);
            return ((typeof forces === 'function') ? forces : null);
        };

        var applyForcesFrom = function(entityA, entityB) {
            var fp = createForcePack(entityA, entityB);
            var forceFunc = activeForces(fp);
            if (typeof forceFunc !== 'function') return;
            var F = forceFunc(fp);
            if (F !== null) applyForce(F, fp);
        };

        var applyForces = function() {
            var nHeroes = heroes.length;
            var nFighters = fighters.length;
            var i, j;

            for (i = 0; i < nHeroes; ++i) {
                var thisHero = heroes[i];
                if (thisHero === null) continue;
                var orbs = thisHero.orbs;
                var nOrbs = orbs.length;
                for (j = 0; j < nOrbs; ++j) {
                    var thatOrb = orbs[j];
                    if (thatOrb === null) continue;
                    applyForcesFrom(thisHero, thatOrb);
                }
                for (j = 0; j < nHeroes; ++j) {
                    if (j === i) continue;
                    var thatHero = heroes[j];
                    if (thatHero === null) continue;
                    applyForcesFrom(thisHero, thatHero);
                }
            }

            for (i = 0; i < nFighters; ++i) {
                var thisFighter = fighters[i];
                if (thisFighter === null) continue;
                for (j = 0; j < nHeroes; ++j) {
                    var thatHero = heroes[j];
                    if (thatHero === null) continue;
                    applyForcesFrom(thisFighter, thatHero);
                }
                for (j = 0; j < nFighters; ++j) {
                    if (j === i) continue;
                    var thatFighter = fighters[j];
                    if (thatFighter === null) continue;
                    applyForcesFrom(thisFighter, thatFighter);
                }
            }
        };

        var updateView = function() {
            var nHeroes = heroes.length;
            var nFighters = fighters.length;
            var i;

            for (i = 0; i < nHeroes; ++i) {
                var hero = heroes[i];
                if (hero === null) continue;
                //console.log('[updateView] hero.x, hero.y:', hero.mapPos.x, hero.mapPos.y);
                //console.log('[updateView] hero.body{x,y}:', hero.body.GetPosition().x, hero.body.GetPosition().y);

                if (hero.HP > 0) {
                    hero.updateMapPosDim();
                } else {
                    //console.log('[updateView] DIED index, hero:', i, hero);
                    if (i === 0) { updatePanels(); }
                    Gry.World.DestroyBody(hero.body);
                    heroes[i] = null;
                }
            }

            for (i = 0; i < nFighters; ++i) {
                var fighter = fighters[i];
                if (fighter === null) continue;
                if (fighter.HP > 0) {
                    fighter.updateMapPosDim();
                } else {
                    //console.log('[updateView] DIED index, fighter:', i, fighter);
                    Gry.World.DestroyBody(fighter.body);
                    fighters[i] = null;
                }
            }

            //  Draw orbs
            canvasCtx.lineWidth = 2;
            for (i = 0; i < nHeroes; ++i) {
                var hero = heroes[i];
                if (hero === null) continue;
                canvasCtx.fillStyle = Gry.scaledTeamColor(hero.team, 1);
                canvasCtx.strokeStyle = Gry.scaledTeamColor(hero.team, 1);

                var orbs = hero.orbs;
                var nOrbs = orbs.length;
                for (j = 0; j < nOrbs; ++j) {
                    var orb = orbs[j];
                    if (orb !== null) {
                        if (typeof orb.draw !== 'function') { throw 'orb.draw is not a function'; }
                        orb.draw(canvasCtx, orb.mapPos);
                    }
                }

            }

            canvasCtx.lineWidth = 1;
            canvasCtx.textAlign = 'center';
            canvasCtx.textBaseline = 'middle';

            //  Draw visible heroes
            for (i = 0; i < nHeroes; ++i) {
                var hero = heroes[i];
                if (hero === null) continue;
                var box = hero.box;
                var mapPos = hero.mapPos;
                var cx = mapPos.x;
                var cy = mapPos.y;
                var health = hero.HP/hero.maxHP;

                canvasCtx.font = (2*box.hH)+'pt sans-serif';
                canvasCtx.fillStyle = Gry.scaledTeamColor(hero.team, health);
                canvasCtx.strokeStyle = Gry.scaledTeamColor(hero.team, 1);
                canvasCtx.save();
                canvasCtx.translate(cx, cy);
                canvasCtx.rotate(box.a);
                canvasCtx.fillText(hero.symbol, 0, -2*hero.level);
                canvasCtx.strokeText(hero.symbol, 0, -2*hero.level);
                canvasCtx.restore();
            }

            //  Draw visible fighters
            for (i = 0; i < nFighters; ++i) {
                var fighter = fighters[i];
                if (fighter === null) continue;
                var box = fighter.box;
                var mapPos = fighter.mapPos;
                var cx = mapPos.x;
                var cy = mapPos.y;
                var health = fighter.HP/fighter.maxHP;

                canvasCtx.save();
                canvasCtx.translate(cx, cy);
                canvasCtx.rotate(box.a);
                canvasCtx.fillStyle = Gry.scaledTeamColor(fighter.team, health);
                canvasCtx.strokeStyle = Gry.scaledTeamColor(fighter.team, 1);
                canvasCtx.fillRect(-box.hW, -box.hH, 2*box.hW, 2*box.hH);
                canvasCtx.strokeRect(-box.hW, -box.hH, 2*box.hW, 2*box.hH);
                canvasCtx.restore();
            }
        };

        var updatePanels = function() {
            var plrHeroIdx = 0;
            var plrHero = heroes[plrHeroIdx];
            if (typeof plrHero !== 'undefined') {
                var $heroHP = $('#heroHP');
                if (plrHero !== null) {
                    $heroHP.text(Math.ceil(plrHero.HP)+'/'+plrHero.maxHP);
                }
                else {
                    $heroHP.text('R.I.P.');
                }
            }
        };

        var tick = function() {
            //console.log('[tick]', heroes);
            applyForces();
            Gry.World.Step(1/FPS, 10, 10);
            if (!isDebugMode) {
                canvasCtx.clearRect(0, 0, viewWidth, viewHeight);
            } else {
                Gry.World.DrawDebugData();
                canvasCtx.globalAlpha = 0.4;
            }
            updateView();
            updatePanels();
            Gry.World.ClearForces();
            //console.log('[tick] END', heroes);
        };

        var listener = new b2ContactListener;

        listener.PostSolve = function(contact, impulse) {
            //  The entities are attached as user data
            var eA = contact.GetFixtureA().GetBody().GetUserData();
            var eB = contact.GetFixtureB().GetBody().GetUserData();

            //  Damage
            if (eA.team !== eB.team) {  //  No friendly fire
                var hit = impulse.normalImpulses[0];
                eA.HP -= hit;
                eB.HP -= hit;
            }
        };

        Gry.World.SetContactListener(listener);

        return G;
    };

    return GPhx;

})();
