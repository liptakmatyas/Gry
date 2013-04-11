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

//  TODO    Change to Gry.Phx
Gry.System = (function() {

    var S = function(conf) {
        console.log('[System] conf:', conf);

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

        var world = null;
        var bodyDef = null;
        var fixtDef = null;
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
                var H = Gry.Hero(this, stat);
                heroes.push(H);
                console.log('[Gry.AddHero] Added hero:', H);
            },

            AddFighter: function(stat) {
                stat.unitIdx = fighters.length;
                var F = Gry.Fighter(this, stat);
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

            //  Create a default box
            //  - at world position posW{x,y}
            //  - with half world scale size hdimW{w,h}
            //  - with body type bType
            //  - with user data bData
            createBox: function(posW, hdimW, bType, bData) {
                //console.log('[createBox] posW, hdimW, bType, bData:', posW, hdimW, bType, bData);
                bodyDef.type = bType;
                bodyDef.userData = bData;
                bodyDef.position.Set(posW.x, posW.y);
                fixtDef.shape = new b2PolygonShape();
                fixtDef.shape.SetAsBox(hdimW.w, hdimW.h);

                var b =  world.CreateBody(bodyDef);
                b.CreateFixture(fixtDef);
                b.SetLinearDamping(6);
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

        world = new b2World(new b2Vec2(0, 0), true);
        bodyDef = new b2BodyDef();
        fixtDef = new b2FixtureDef();
        fixtDef.density = 1;
        fixtDef.friction = 1;
        fixtDef.restitution = 0.00001;

        //  wall thickness = 30
        viewDimW = G.scaleDim2W({ w: viewWidth, h: viewHeight });
        var horizWallHdim = G.scaleDim2W({ w: viewWidth/2, h: 15 });
        var vertWallHdim = G.scaleDim2W({ w: 15, h: viewHeight/2 });
        G.createBox(G.scalePos2W({ x:viewWidthHalf, y:viewHeight }), horizWallHdim, b2Body.b2_staticBody);
        G.createBox(G.scalePos2W({ x:viewWidthHalf, y:0 }), horizWallHdim, b2Body.b2_staticBody);
        G.createBox(G.scalePos2W({ x:0, y:viewHeightHalf }), vertWallHdim, b2Body.b2_staticBody);
        G.createBox(G.scalePos2W({ x:viewWidth, y:viewHeightHalf }), vertWallHdim, b2Body.b2_staticBody);

        if (isDebugMode) {
            debugDraw = new b2DebugDraw();
            debugDraw.SetSprite(canvasCtx);
            debugDraw.SetDrawScale(worldScale);
            debugDraw.SetFillAlpha(0.9);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            world.SetDebugDraw(debugDraw);
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

        //  body: Box2D body
        //  F: absolute force; float
        //  ap{dx,dy,R2}: action pack
        var applyAsymForce = function(body, F, ap) {
            //console.log('[applyAsymForce] body, F, ap:', body, F, ap);
            body.ApplyForce(FVec(F, ap.dx, ap.dy), body.GetWorldCenter());
        };

        //  A, B: Box2D bodies
        //  F: absolute force; float
        //  ap{dx,dy,R2}: action pack
        var applySymForce = function(A, B, F, ap) {
            //console.log('[applySymForce] A, B, F, ap:', A, B, F, ap);
            var FA = FVec(F, ap.dx, ap.dy);
            var FB = FVec(-F, ap.dx, ap.dy);
            //console.log('[applySymForce] FA, FB:', FA, FB);
            A.ApplyForce(FA, A.GetWorldCenter());
            B.ApplyForce(FB, B.GetWorldCenter());
        };

        //  pA{x,y}, pB{x,y}: positions of the Box2D bodies
        //  Returns: ap{dx,dy,R2} action pack
        //  - ap.dx, ay.dy: X/Y components of distance from A to B in world coordinates (signed!)
        //  - ap.R2: squared distance between A and B in world coordinates
        var createActionPack = function(pA, pB) {
            //console.log('[createActionPack] pA, pB:', pA, pB);
            var dx = pB.x-pA.x;
            var dy = pB.y-pA.y;
            var R2 = dx*dx + dy*dy;
            //console.log('[createActionPack] dx, dy, R2:', dx, dy, R2);
            return { dx:dx, dy:dy, R2:R2 };
        };

        //  Forces between heroes and their flags.
        //  All functions have the same parameters:
        //  body: Box2D body of hero
        //  ap{dx,dy,R2}: action pack
        var flag = {
            'avoid': {
                force: function(body, ap) {
                    return -3/ap.R2;
                },
                draw: function(pos) {
                    canvasCtx.beginPath();
                    canvasCtx.arc(pos.x, pos.y, 10, 0, 2*Math.PI, false);
                    canvasCtx.stroke();
                }
            },
            'moveTo': {
                force: function(body, ap) {
                    return 1*ap.R2;
                },
                draw: function(pos) {
                    canvasCtx.beginPath();
                    canvasCtx.arc(pos.x, pos.y, 10, 0, 2*Math.PI, false);
                    canvasCtx.fill();
                }
            }
        };

        var shieldRadius = 1;
        var fighterModes = {
            'shield': {
                toHero: function(thisFighter, thatHero) {
                    //  Own hero: attracts with radius
                    //  other heroes: neutral
                    if (thisFighter.team === thatHero.team) {
                        var thisBody = thisFighter.body;
                        var ap = createActionPack(thisBody.GetPosition(), thatHero.body.GetPosition());
                        var F = 8*(ap.R2-shieldRadius*thatHero.level);
                        applyAsymForce(thisBody, F, ap);
                    }
                },
                toFighter: function(thisFighter, thatFighter) {
                    //  Own team's fighters: neutral
                    //  other fighters: attract
                    if (thisFighter.team !== thatFighter.team) {
                        var thisBody = thisFighter.body;
                        var thatBody = thatFighter.body;
                        var ap = createActionPack(thisBody.GetPosition(), thatBody.GetPosition());
                        var F = 0.5/ap.R2;
                        applyAsymForce(thisBody, F, ap);
                    }
                }
            },

            'fight': {
                toHero: function(thisFighter, thatHero) {
                    //  Own hero: neutral
                    //  other heroes: attract
                    if (thisFighter.team !== thatHero.team) {
                        var thisBody = thisFighter.body;
                        var ap = createActionPack(thisBody.GetPosition(), thatHero.body.GetPosition());
                        var F = 4/ap.R2;
                        applyAsymForce(thisBody, F, ap);
                    }
                },
                toFighter: function(thisFighter, thatFighter) {
                    //  Own team's fighters: neutral
                    //  other fighters: attract
                    if (thisFighter.team !== thatFighter.team) {
                        var thisBody = thisFighter.body;
                        var thatBody = thatFighter.body;
                        var ap = createActionPack(thisBody.GetPosition(), thatBody.GetPosition());
                        var F = 1/ap.R2;
                        applyAsymForce(thisBody, F, ap);
                    }
                }
            }
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
        //      n: "heroName",              //  user-defined, but *UNIQUE*, and not a "system type" (wall, fighter, ...)
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
        //      var forcePack = createForcePack(thisUnit, thatUnit); // TODO Formerly known as createActionPack()

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
                var bodyA = heroA.body;

                for (var flagName in heroA.flags) {
                    var flagTarget = heroA.flags[flagName];
                    if (flagTarget !== null && typeof flag[flagName].force === 'function') {
                        //  flagTarget{x,y} is stored in map coordinates, need world coordinates
                        flagTarget = G.scalePos2W(flagTarget);
                        var ap = createActionPack(bodyA.GetPosition(), flagTarget);
                        var F = flag[flagName].force(bodyA, ap);
                        applyAsymForce(bodyA, F, ap);
                    }
                }

                for (j = i+1; j < nHeroes; ++j) {
                    var heroB = heroes[j];
                    if (heroB === null) continue;
                    var bodyB = heroB.body;

                    var ap = createActionPack(bodyA.GetPosition(), bodyB.GetPosition());
                    //var F = 100/ap.R2;
                    var F = -2/ap.R2;
                    applySymForce(bodyA, bodyB, F, ap);
                }
            }

            for (i = 0; i < nFighters; ++i) {
                var thisFighter = fighters[i];
                if (thisFighter === null) continue;
                var fm = fighterModes[thisFighter.fighterMode];

                for (j = 0; j < nHeroes; ++j) {
                    var thatHero = heroes[j];
                    if (thatHero === null) continue;
                    var forceFunc = fm.toHero;
                    if (typeof forceFunc === 'function') {
                        forceFunc(thisFighter, thatHero);
                    }
                }

                for (j = 0; j < nFighters; ++j) {
                    if (j === i) continue;
                    var thatFighter = fighters[j];
                    if (thatFighter === null) continue;
                    var forceFunc = fm.toFighter;
                    if (typeof forceFunc === 'function') {
                        forceFunc(thisFighter, thatFighter);
                    }
                }
            }
        };

        //  u{body} -> u{body,box{hW,hH,a},mapPos{x,y}}
        //
        //  NOTE:   Assumes having exactly one fixture: a rectangle.
        //          (Units are squares at the moment.)
        var updateUnit = function(u) {
            //console.log('[updateUnit] PREVIOUS u:', u);
            var body = u.body;
            var fixt = body.GetFixtureList();
            var vert = fixt.GetShape().GetVertices();
            var dim = G.scaleDim2M({ w: vert[1].x-vert[0].x, h: vert[2].y-vert[1].y });
            var cPos = G.scalePos2M(body.GetPosition());
            u.box = {
                hW: dim.w/2,
                hH: dim.h/2,
                a: body.GetAngle()
            };
            u.mapPos = { x: cPos.x, y: cPos.y };
            //console.log('[updateUnit] UPDATED u:', u);
            return u;
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
                if (hero.HP > 0) {
                    updateUnit(hero);
                } else {
                    console.log('[updateView] DIED index, hero:', i, hero);
                    if (i === 0) { updatePanels(); }
                    world.DestroyBody(hero.body);
                    heroes[i] = null;
                }
            }

            for (i = 0; i < nFighters; ++i) {
                var fighter = fighters[i];
                if (fighter === null) continue;
                if (fighter.HP > 0) {
                    updateUnit(fighter);
                } else {
                    //console.log('[updateView] DIED index, fighter:', i, fighter);
                    world.DestroyBody(fighter.body);
                    fighters[i] = null;
                }
            }

            //  Draw flags
            canvasCtx.lineWidth = 2;
            for (i = 0; i < nHeroes; ++i) {
                var hero = heroes[i];
                if (hero === null) continue;
                canvasCtx.fillStyle = scaledTeamColor(hero.team, 1);
                canvasCtx.strokeStyle = scaledTeamColor(hero.team, 1);

                for (var flagName in hero.flags) {
                    var flagTarget = hero.flags[flagName];
                    if (flagTarget !== null && typeof flag[flagName].draw === 'function') {
                        //  flagTarget{x,y} is stored in map coordinates
                        //console.log('[updateView] DRAW / flagName, flagTarget:', flagName, flagTarget);
                        flag[flagName].draw(flagTarget);
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
            var $heroHP = $('#heroHP');
            if (plrHero !== null) {
                $heroHP.text(Math.ceil(plrHero.HP)+'/'+plrHero.maxHP);
            }
            else {
                $heroHP.text('R.I.P.');
            }
        };

        var tick = function() { 
            //console.log('[tick]', heroes);
            applyForces();
            world.Step(1/FPS, 10, 10);
            if (!isDebugMode) {
                canvasCtx.clearRect(0, 0, viewWidth, viewHeight);
            } else {
                world.DrawDebugData();
                canvasCtx.globalAlpha = 0.5;
            }
            updateView();
            updatePanels();
            world.ClearForces();
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
        world.SetContactListener(listener);


        //console.log('[System] return G:', G);
        return G;
    };

    return S;

})();
