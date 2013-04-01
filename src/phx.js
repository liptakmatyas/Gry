/*
 *  TODO    UI elements for all teams
 *          -   hero HP display
 *          -   flags: enable/disable
 *          -   fighter count
 *          -   fighterMode dropdown
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
 */
(function() {

//  Make sure we're alone
if (typeof Gry !== 'undefined') {
    throw 'Global variable Gry already defined'
}

//  Create our single global entry point
Gry = {

    System: function(conf) {
        console.log('[System] conf:', conf);
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
        var worldScale = conf.worldScale;
        var viewDimW = null;

        var FPS = 30;
        var frameTime = 1000/FPS;
        var isTicking = false;
        var ticker = null;

        var heroes = [];
        var fighters = [];

        /*
         *  Helpers
         */

        //  Box2D aliases
        var b2Vec2 = Box2D.Common.Math.b2Vec2;
        var b2AABB = Box2D.Collision.b2AABB;
        var b2BodyDef = Box2D.Dynamics.b2BodyDef;
        var b2Body = Box2D.Dynamics.b2Body;
        var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
        var b2Fixture = Box2D.Dynamics.b2Fixture;
        var b2World = Box2D.Dynamics.b2World;
        var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
        var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
        var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
        var b2ContactListener = Box2D.Dynamics.b2ContactListener;

        //  Scale dimension d{w,h} to world dimensions
        var scaleDim2W = function(d) {
            return { w: d.w/worldScale, h: d.h/worldScale };
        };

        //  Scale dimension d{w,h} to map dimensions
        var scaleDim2M = function(d) {
            return { w: d.w*worldScale, h: d.h*worldScale };
        };

        //  Scale position p{x,y} to world coordinates
        var scalePos2W = function(p) {
            return { x: p.x/worldScale, y: p.y/worldScale };
        };

        //  Scale position p{x,y} to map coordinates
        var scalePos2M = function(p) {
            return { x: Math.floor(p.x*worldScale), y: Math.floor(p.y*worldScale) };
        };

        //  Create a default box
        //  - at world position posW{x,y}
        //  - with half world scale size hdimW{w,h}
        //  - with body type bType
        //  - with user data bData
        var createBox = function(posW, hdimW, bType, bData) {
            console.log('[createBox] posW, hdimW, bType, bData:', posW, hdimW, bType, bData);
            bodyDef.type = bType;
            bodyDef.userData = bData;
            bodyDef.position.Set(posW.x, posW.y);
            fixtDef.shape = new b2PolygonShape();
            fixtDef.shape.SetAsBox(hdimW.w, hdimW.h);

            var b = world.CreateBody(bodyDef);
            b.CreateFixture(fixtDef);
            b.SetLinearDamping(6);
            return b;
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
        viewDimW = scaleDim2W({ w: viewWidth, h: viewHeight });
        var horizWallHdim = scaleDim2W({ w: viewWidth/2, h: 15 });
        var vertWallHdim = scaleDim2W({ w: 15, h: viewHeight/2 });
        createBox(scalePos2W({ x:viewWidthHalf, y:viewHeight }), horizWallHdim, b2Body.b2_staticBody);
        createBox(scalePos2W({ x:viewWidthHalf, y:0 }), horizWallHdim, b2Body.b2_staticBody);
        createBox(scalePos2W({ x:0, y:viewHeightHalf }), vertWallHdim, b2Body.b2_staticBody);
        createBox(scalePos2W({ x:viewWidth, y:viewHeightHalf }), vertWallHdim, b2Body.b2_staticBody);

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
                    return 3*ap.R2;
                },
                draw: function(pos) {
                    canvasCtx.beginPath();
                    canvasCtx.arc(pos.x, pos.y, 10, 0, 2*Math.PI, false);
                    canvasCtx.fill();
                }
            }
        };

        //  TODO    fighterMode should be set by player commands
        //var fighterMode = 'fight';
        var fighterMode = 'shield';
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

        var applyForces = function() {
            var nHeroes = heroes.length;
            var nFighters = fighters.length;
            var i, j;

            for (i = 0; i < nHeroes; ++i) {
                var heroA = heroes[i];
                if (heroA === null) continue;
                var bodyA = heroA.body;

                //  Apply forces to flags
                for (var flagName in heroA.flags) {
                    var flagTarget = heroA.flags[flagName];
                    if (flagTarget !== null && typeof flag[flagName].force === 'function') {
                        //  flagTarget{x,y} is stored in map coordinates, need world coordinates
                        flagTarget = scalePos2W(flagTarget);
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

                    //  Hero--hero force: repel
                    //  TODO    Make this depend on hero stats (~charge)
                    var F = -5/ap.R2;

                    applySymForce(bodyA, bodyB, F, ap);
                }
            }

            //  Apply forces to fighters according to 'fighterMode'
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
            var dim = scaleDim2M({ w: vert[1].x-vert[0].x, h: vert[2].y-vert[1].y });
            var cPos = scalePos2M(body.GetPosition());
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
                    console.log('[updateView] hero DIED:', hero);
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
                    console.log('[updateView] fighter DIED:', fighter);
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

        var G = {

            //  Random position within 80% of given dimensions
            //  d{w,h} -> p{x,y}
            RndPos: function(d) {
                console.log('[RndPos] d:', d);
                var p = { x: (0.1+Math.random()*0.8)*d.w, y: (0.1+Math.random()*0.8)*d.h };
                console.log('[RndPos] p:', p);
                return p;
            },

            //  Map dimensions
            //  () -> d{w,h}
            MapDim: function() {
                //  TODO    The map should be bigger than the view
                return { w: viewWidth, h: viewHeight };
            },

            AddHero: function(stat) {
                console.log('[AddHero] stat:', stat);
                var H = {
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
                        avoid: G.RndPos(G.MapDim()),
                        moveTo: G.RndPos(G.MapDim())
                    }
                };
                var size = 10*H.level;
                H.body = createBox(scalePos2W(H.mapPos), scaleDim2W({ w: size, h: size }), b2Body.b2_dynamicBody,
                        { unitType: 'hero', unitIdx: heroes.length });

                console.log('[AddHero] H:', H);
                heroes.push(H);
                console.log('[AddHero] Updated list of heroes:', heroes);
            },

            AddFighter: function(stat) {
                console.log('[AddFighter] stat:', stat);
                var F = {
                    HP: stat.HP,
                    maxHP: stat.maxHP,
                    body: null,
                    mapPos: {
                        x: stat.mapPos.x,
                        y: stat.mapPos.y
                    },
                    fighterMode: stat.fighterMode,
                    team: stat.team
                };
                F.body = createBox(scalePos2W(F.mapPos), scaleDim2W({ w: 3, h: 3 }), b2Body.b2_dynamicBody,
                        { unitType: 'fighter', unitIdx: fighters.length });

                console.log('[AddFighter] F:', F);
                fighters.push(F);
                console.log('[AddFighter] Updated list of fighters:', fighters);
            },

            StartLoop: function() {
                console.log('[StartLoop]');
                isTicking = true;

                ticker = setInterval(function() { tick(); }, frameTime); // TODO RAF
                //tick();
                return this;
            }

        };

        //console.log('[System] return G:', G);
        return G;
    },

};

})();
