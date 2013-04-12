(function() {

    var orbBodyDef = function(posW, bType, bData) {
        var bd = new b2BodyDef();
        bd.type = bType;
        bd.userData = bData;
        bd.position.Set(posW.x, posW.y);
        return bd;
    };

    var orbFixtDef = function(radius) {
        var fd = new b2FixtureDef();
        fd.density      = 1.0;
        fd.friction     = 1.0;
        fd.restitution  = 0.00001;

        fd.shape = new b2CircleShape(radius);

        fd.filter.categoryBits  = Gry.EntityCategory.ORB;
        fd.filter.maskBits      = 0;

        return fd;
    };

    var orbBody = function(posW, radius, bData) {
        //console.log('[orbBody] posW, radius, bData:', posW, radius, bData);
        var b = Gry.World.CreateBody(orbBodyDef(posW, b2Body.b2_staticBody, bData));
        b.CreateFixture(orbFixtDef(radius/Gry.worldScale));
        //b.SetLinearDamping(6);  //  FIXME   Magic number!
        return b;
    };

    //
    //  Orb types
    //
    //  these are the available orbs for the heroes.
    //
    //  -   .force(body, fp): forces between heroes and their orbs
    //      -   body: box2d body of hero
    //      -   fp{dx,dy,r2}: force pack
    //
    //  -   .draw(pos): rendering orb
    //      -   pos{x,y}: position of center of orb
    //

    Gry.Orb = Gry.Entity.extend({
        init: function(GSys, orb) {
            //console.log('[Orb.New] INCOMING orb:', orb);

            var radiusW = GSys.scaleLen2W(orb.radius);
            this._super(GSys, {
                entityType: Gry.EntityType.ORB,
                body: orb.body || orbBody(GSys.scalePos2W(orb.mapPos), radiusW, { orbType: orb.orbType, orbIdx: orb.orbIdx }),
                mapPos: { x: orb.mapPos.x, y: orb.mapPos.y },
                mapDim: { w: 2*orb.radius, h: 2*orb.radius }
            });

            this.id = orb.id;
            this.team = orb.team;
            this.type = orb.type;
            this.orbIdx = orb.orbIdx;
            this.radiusM = orb.radius;
            this.radiusW = radiusW;
        }
    });

}());


