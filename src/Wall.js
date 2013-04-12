(function() {

    var wallBodyDef = function(posW, bType, bData) {
        var bd = new b2BodyDef();
        bd.type = bType;
        bd.userData = bData;
        bd.position.Set(posW.x, posW.y);
        return bd;
    };

    var wallFixtDef = function(hdimW) {
        var fd = new b2FixtureDef();
        fd.density      = 1.0;
        fd.friction     = 1.0;
        fd.restitution  = 0.00001;

        fd.shape = new b2PolygonShape();
        fd.shape.SetAsBox(hdimW.w, hdimW.h);
        return fd;
    };

    //  Create a default wall
    //  - at world position posW{x,y}
    //  - with half world scale size hdimW{w,h}
    //  - with body type bType
    //  - with user data bData
    var wallBody = function(posW, hdimW, bData) {
        //console.log('[wallBody] posW, hdimW, bData:', posW, hdimW, bData);
        var b = Gry.World.CreateBody(wallBodyDef(posW, b2Body.b2_staticBody, bData));
        b.CreateFixture(wallFixtDef(hdimW));
        b.SetLinearDamping(6);  //  FIXME   Magic number!
        return b;
    };

    Gry.Wall = Gry.Entity.extend({
        init: function(GSys, wall) {
            //console.log('[Wall.init] INCOMING wall:', wall);
            this._super(GSys, {
                entityType: Gry.EntityType.WALL,
                body: wallBody(
                    GSys.scalePos2W(wall.mapPos),
                    GSys.scaleDim2W({ w: wall.mapDim.w/2, h: wall.mapDim.h/2 }),
                    //  FIXME   unitType is just a hack here for collision detection / damage
                    { unitType: 'wall', wallIdx: wall.wallIdx }),
                mapPos: { x: wall.mapPos.x, y: wall.mapPos.y },
                mapDim: { w: wall.mapDim.w, h: wall.mapDim.h }
            });

            this.wallIdx = wall.wallIdx;
            //console.log('[Wall.init] RETURNED Wall:', this);
        }
    });

}());


