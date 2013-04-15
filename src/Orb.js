(function() {

    var orbBodyDef = function(posW, bType) {
        var bd = new b2BodyDef();
        bd.type = bType;
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

    var orbBody = function(GSys, orb) {
        var posW = GSys.scalePos2W(orb.mapPos);
        var b = Gry.World.CreateBody(orbBodyDef(posW, b2Body.b2_staticBody));

        var radiusW = GSys.scaleLen2W(orb.radius);
        b.CreateFixture(orbFixtDef(radiusW));

        return b;
    };

    Gry.Orb = Gry.Entity.extend({
        init: function(GSys, orb) {

            this._super(GSys, {
                entityType: Gry.EntityType.ORB,
                body: orbBody(GSys, orb),
                mapPos: { x: orb.mapPos.x, y: orb.mapPos.y },
                mapDim: { w: 2*orb.radius, h: 2*orb.radius }
            });

            this.hero = orb.hero;
            this.id = orb.id;
            this.team = orb.team;
            this.type = orb.type;
            this.creatorChain = orb.creatorChain;
            this.creatorChainTS = orb.creatorChainTS;
            this.radiusM = orb.radius;
            this.radiusW = GSys.scaleLen2W(orb.radius);
        }
    });

}());

