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
                console.log('[AddHero] Added hero:', H);
            },

            AddFighter: function(stat) {
                stat.unitIdx = fighters.length;
                var F = new Gry.Fighter(this, stat);
                fighters.push(F);
            },

            StartLoop: function() {
                console.log('[StartLoop]');
                isTicking = true;

                ticker = setInterval(function() { tick(); }, frameTime); // TODO RAF
                //tick();
                return this;
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

            boxBodyDef: function(posW, bType, bData) {
                var bd = new b2BodyDef();
                bd.type = bType;
                bd.userData = bData;
                bd.position.Set(posW.x, posW.y);
                return bd;
            },

            boxFixtDef: function(hdimW) {
                var fd = new b2FixtureDef();
                fd.density      = 1.0;
                fd.friction     = 1.0;
                fd.restitution  = 0.00001;

                fd.shape = new b2PolygonShape();
                fd.shape.SetAsBox(hdimW.w, hdimW.h);
                return fd;
            },

            //  Create a default box
            //  - at world position posW{x,y}
            //  - with half world scale size hdimW{w,h}
            //  - with body type bType
            //  - with user data bData
            boxBody: function(posW, hdimW, bData) {
                //console.log('[boxBody] posW, hdimW, bData:', posW, hdimW, bData);
                var b = Gry.World.CreateBody(this.boxBodyDef(posW, b2Body.b2_dynamicBody, bData));
                b.CreateFixture(this.boxFixtDef(hdimW));
                b.SetLinearDamping(6);  //  FIXME   Magic number!
                return b;
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

        //  uA, uB: units
        //  Returns: ap{bA,bB,pA,pB,dx,dy,R2} action pack
        //  - ap.dx, ay.dy: X/Y components of distance from A to B in world coordinates (signed!)
        //  - ap.R2: squared distance between A and B in world coordinates
        var createForcePack = function(uA, uB) {
            //console.log('[createForcePack] uA, uB:', uA, uB);
            //console.log('[createForcePack] uA.b{x,y}, uB.b{x,y}:', uA.body.GetPosition().x, uA.body.GetPosition().y, uB.body.GetPosition().x, uB.body.GetPosition().y);

            var bA = uA.body;
            var bB = uB.body;
            var pA = bA.GetPosition();
            var pB = bB.GetPosition();
            //console.log('[createForcePack] pA{x,y}, pB{x,y}:', pA.x, pA.y, pB.x, pB.y);

            var dx = pB.x-pA.x;
            var dy = pB.y-pA.y;
            var R2 = dx*dx + dy*dy;

            var fp = { bA: bA, bB: bB, pA:pA, pB:pB, dx:dx, dy:dy, R2:R2 };
            //console.log('[createForcePack] fp:', fp);
            //console.log('[createForcePack] fp.pA{x,y}, fp.pB{x,y}:', fp.pA.x, fp.pA.y, fp.pB.x, fp.pB.y);
            //console.log('[createForcePack] fp.dx, fp.dy:', fp.dx, fp.dy);
            return fp;
        };

        //  TODO    Generalize forces
        //  XXX     How does all this, below, fit with collision detection?
        //
        //  Current hack:
        //  -   hero ---> flag: flag[flagName].force(b,ap)
        //  -   hero <--> hero: hard-coded; (C,ap)
        //  -   fighter ---> fighter: fighterModes[fighterMode].toFighter(fa,fb)
        //  -   fighter ---> hero: fighterModes[fighterMode].toHero(fa,hb)

        //  XXX hero-specific forces?
        //  -   hero.flags[flagId][unitType][fidx]()
        //  -   hero.units[unitType][fidx]()
        //  -   hero.hero[heroName][fidx]()
        //  XXX global forces
        //  XXX team specific forces
        //  XXX unit type specific forces (e.g. flags, fighterMode)

        //  User data for all entities:
        //
        //  var udWall = {
        //      t: 'wall'                   //  fixed; XXX wall types ???
        //  };
        //
        //  var udHero = {
        //      t: 'hero',                  //  fixed
        //      n: "heroName",              //  user-defined, but *UNIQUE*, and not a "system type"
        //      i: unitIdx                  //  unit index in units[udUnit.t][i] (instead of fighters[])
        //  };
        //
        //  var udUnit = {
        //      t: "unitType",              //  fighter
        //      i: unitIdx                  //  unit index in units[udUnit.t][i] (instead of fighters[])
        //  };

        //  ?   Loop through bodies, check type (.t)
        //  ?   hero ---> flag: flag[flagName].force(b,ap)
        //  -   hero <--> hero: hard-coded; (C,ap)
        //  -   fighter ---> fighter: fighterModes[fighterMode].toFighter(fa,fb)
        //  -   fighter ---> hero: fighterModes[fighterMode].toHero(fa,hb)

        //  Assuming unit!
        //  Load full unit objects
        //      var thisUnit = units[thisUd.t][thisUd.i];
        //      var thatUnit = units[thatUd.t][thatUd.i];

        //  forcePack{bA,bB,pA,pB,dx,dy,R2}
        //      var forcePack = createForcePack(thisUnit, thatUnit); // TODO Formerly known as createForcePack()

        //  force[][][fidx](uA,uB,ap) is a 3D array of force functions
        //  -   A force function should calculate the size of the force vector, and apply it (sym/asym)
        //  -   fcidx is the force chain index => order of application of forces
        //  ?   How could this be used for shields, extra hit, remote weapons, etc?
        //
        //      var ForceChain = force[thisUnit.type][thatUnit.type];
        //      var ForceFunc = ForceChain[fidx]; // for each fidx in ForceChain
        //      var F = ForceFunc(thisUnit, thatUnit, forcePack);

        var applyForces = function() {
            var nHeroes = heroes.length;
            var nFighters = fighters.length;
            var i, j;
            //console.log('[applyForces] nHeroes, heroes:', nHeroes, heroes);
            //console.log('[applyForces] nFighters, fighters:', nFighters, fighters);

            for (i = 0; i < nHeroes; ++i) {
                var heroA = heroes[i];
                if (heroA === null) continue;
                //console.log('[applyForces] heroA:', heroA);
                //console.log('[applyForces] heroA.x, heroA.y:', heroA.mapPos.x, heroA.mapPos.y);
                //console.log('[applyForces] heroA.body{x,y}:', heroA.body.GetPosition().x, heroA.body.GetPosition().y);

                var orbs = heroA.orbs;
                for (var orbName in orbs) {
                    var orbB = orbs[orbName];
                    //console.log('[applyForces] orbName, orbB:', orbName, orbB);
                    //console.log('[applyForces] orbB.x, orbB.y:', orbB.mapPos.x, orbB.mapPos.y);
                    //console.log('[applyForces] orbB.body{x,y}:', orbB.body.GetPosition().x, orbB.body.GetPosition().y);
                    var orbForce = Gry.OrbType[orbName].force;
                    if (typeof orbForce === 'function' && orbB !== null) {
                        var fp = createForcePack(heroA, orbB);
                        applyForce(orbForce(fp), fp);
                        //console.log('[applyForces] heroA.x, heroA.y:', heroA.mapPos.x, heroA.mapPos.y);
                        //console.log('[applyForces] heroA.body{x,y}:', heroA.body.GetPosition().x, heroA.body.GetPosition().y);
                    }
                    else {
                        throw 'Bad orb: '+orbB;
                    }
                }

                for (j = i+1; j < nHeroes; ++j) {
                    var heroB = heroes[j];
                    if (heroB === null) continue;
                    var bodyB = heroB.body;

                    var ap = createForcePack(heroA, heroB);
                    //var F = 100/ap.R2;
                    var F = -2/ap.R2;
                    applyForce({ sym: 'ab', size: F }, fp);
                }
            }

            for (i = 0; i < nFighters; ++i) {
                var thisFighter = fighters[i];
                if (thisFighter === null) continue;
                var fm = Gry.Fighter.MODE[thisFighter.fighterMode];
                //console.log('[applyForces] i, thisFighter, fm:', i, thisFighter, fm);

                for (j = 0; j < nHeroes; ++j) {
                    var thatHero = heroes[j];
                    if (thatHero === null) continue;

                    var forceFunc = null;
                    if (thisFighter.team === thatHero.team) {
                        forceFunc = fm.toOwnHero;
                    }
                    else {
                        forceFunc = fm.toEnemyHero;
                    }

                    if (typeof forceFunc === 'function') {
                        var fp = createForcePack(thisFighter, thatHero);
                        applyForce(forceFunc(thatHero, fp), fp);
                    }
                }

                for (j = 0; j < nFighters; ++j) {
                    if (j === i) continue;
                    var thatFighter = fighters[j];
                    if (thatFighter === null) continue;

                    var forceFunc = null;
                    if (thisFighter.team === thatFighter.team) {
                        forceFunc = fm.toOwnFighter;
                    }
                    else {
                        forceFunc = fm.toEnemyFighter;
                    }

                    if (typeof forceFunc === 'function') {
                        forceFunc(thisFighter, thatFighter);
                    }
                }
            }
        };

        var scaledTeamColor = function(team, scale) {
            //console.log('[scaledTeamColor] team, scale:', team, scale);
            var colorValue = Math.floor(255*scale);
            colorValue = colorValue < 0 ? 0
                       : colorValue > 255 ? 255
                       : colorValue;
            var hexColorValue = (colorValue < 16 ? '0' : '') + colorValue.toString(16);
            //console.log('[scaledTeamColor] colorValue, hexColorValue:', colorValue, hexColorValue);
            var c = '#'+team.replace(/0/g, '00').replace(/x/g, hexColorValue);
            //console.log('[scaledTeamColor] c:', c);
            return c;
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
                canvasCtx.fillStyle = scaledTeamColor(hero.team, 1);
                canvasCtx.strokeStyle = scaledTeamColor(hero.team, 1);

                var orbs = hero.orbs;
                for (var orbName in orbs) {
                    var orb = orbs[orbName];
                    if (orb !== null) {
                        var orbDraw = Gry.OrbType[orbName].draw;
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
                canvasCtx.fillStyle = scaledTeamColor(hero.team, health);
                canvasCtx.strokeStyle = scaledTeamColor(hero.team, 1);
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
                canvasCtx.fillStyle = scaledTeamColor(fighter.team, health);
                canvasCtx.strokeStyle = scaledTeamColor(fighter.team, 1);
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
            var udA = contact.GetFixtureA().GetBody().GetUserData();
            var udB = contact.GetFixtureB().GetBody().GetUserData();
            //console.log('[ContactListener.PostSolve] udA, udB:', udA, udB);
            if (typeof udA === 'object' && typeof udB === 'object') {
                var unitA = udA.unitType === 'hero' ? heroes[udA.unitIdx]
                          : udA.unitType === 'fighter' ? fighters[udA.unitIdx]
                          : undefined;
                var unitB = udB.unitType === 'hero' ? heroes[udB.unitIdx]
                          : udB.unitType === 'fighter' ? fighters[udB.unitIdx]
                          : undefined;
                //console.log('[ContactListener.PostSolve] unitA, unitB:', unitA, unitB);
                if (typeof unitA === 'object' && typeof unitB === 'object') {
                    if (unitA.team !== unitB.team) {
                        var hit = impulse.normalImpulses[0];
                        //console.log('[ContactListener.PostSolve] hit:', hit);
                        unitA.HP -= hit;
                        unitB.HP -= hit;
                        //console.log('[ContactListener.PostSolve] AFTER HIT / unitA, unitB:', unitA, unitB, hit);
                    }
                }
            }
        };
        Gry.World.SetContactListener(listener);

        //console.log('[Phx] return G:', G);
        return G;
    };

    return GPhx;

})();
