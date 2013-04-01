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

        var FPS = 10;
        var frameTime = 1000/FPS;
        var isTicking = false;
        var ticker = null;

        var heroes = [];

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
            return { x: p.x*worldScale, y: p.y*worldScale };
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
        fixtDef.friction = 0.9;
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
            debugDraw.SetFillAlpha(0.5);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            world.SetDebugDraw(debugDraw);
        }

        var updateView = function() {
            var nHeroes = heroes.length;
            var i;

            //  Update all heroes
            for (i = 0; i < nHeroes; ++i) {
                var hero = heroes[i];

                // We rely on having exactly one fixture: a rectangle (square)!
                var body = hero.body;
                var fixt = body.GetFixtureList();
                var vert = fixt.GetShape().GetVertices();
                var dim = scaleDim2M({ w: vert[1].x-vert[0].x, h: vert[2].y-vert[1].y });
                var cPos = scalePos2M(body.GetPosition());
                hero.box = {
                    x: cPos.x-dim.w/2,
                    y: cPos.y-dim.h/2,
                    w: dim.w,
                    h: dim.h
                };
                hero.mapPos = cPos;
            }

            //  Draw visible heroes
            for (i = 0; i < nHeroes; ++i) {
                var hero = heroes[i];
                console.log('[updateView] i, hero:', i, hero);
                var box = hero.box;
                canvasCtx.fillStyle = hero.team;
                console.log('[updateView] canvasCtx:', canvasCtx);
                canvasCtx.fillRect(box.x, box.y, box.w, box.h);
            }
        };

        var tick = function() { 
            console.log('[tick]', heroes);
            //this._applyForces();
            world.Step(1/FPS, 10, 10);
            updateView();
            if (isDebugMode) {
                world.DrawDebugData();
            }
            world.ClearForces();
        };

        var G = {

            //  Random position within 80% of given dimensions
            //  d{w,h} -> p{x,y}
            RndPos: function(d) {
                console.log('[RndPos] d:', d);
                var p = { x: Math.random()*0.8*d.w, y: Math.random()*0.8*d.h };
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
                var H = {
                    body: null,
                    mapPos: {
                        x: stat.mapPos.x,
                        y: stat.mapPos.y
                    },
                    team: stat.team,
                    flag: {
                        avoid: null,
                        moveTo: null,
                    }
                };
                H.body = createBox(scalePos2W(H.mapPos), scaleDim2W({ w: 10, h: 10 }), b2Body.b2_dynamicBody, H);

                console.log('[AddHero] H:', H);
                heroes.push(H);
                console.log('[AddHero] Updated list of heroes:', heroes);
            },

            ListHeroes: function() {
                var n = heroes.length;
                console.log('Heroes:');
                for (var i = 0; i < n; ++i) { console.log(heroes[i]); }
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
