(function() {

    var wallBodyDef = function(posW, bType) {
        var bd = new b2BodyDef();
        bd.type = bType;
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
    var wallBody = function(posW, hdimW) {
        var b = Gry.World.CreateBody(wallBodyDef(posW, b2Body.b2_staticBody));
        b.CreateFixture(wallFixtDef(hdimW));
        return b;
    };

    Gry.Wall = Gry.Entity.extend({
        init: function(GSys, wall) {
            this._super(GSys, {
                entityType: Gry.EntityType.WALL,
                body: wallBody(
                    GSys.scalePos2W(wall.mapPos),
                    GSys.scaleDim2W({ w: wall.mapDim.w/2, h: wall.mapDim.h/2 })),
                mapPos: { x: wall.mapPos.x, y: wall.mapPos.y },
                mapDim: { w: wall.mapDim.w, h: wall.mapDim.h }
            });

            this.wallIdx = wall.wallIdx;
        }
    });

}());


