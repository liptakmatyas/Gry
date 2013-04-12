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

    Gry.OrbType = {
        'avoid': {
            force: function(fp) { return { sym: 'a', size: -400/fp.R2 }; },

            draw: function(canvasCtx, pos) {
                //console.log('[ORB.avoid.draw] pos:', pos);
                canvasCtx.beginPath();
                canvasCtx.arc(pos.x, pos.y, 10, 0, 2*Math.PI, false);
                canvasCtx.stroke();
            }
        },

        'moveTo': {
            force: function(fp) { return { sym: 'a', size: 0.8*fp.R2 }; },

            draw: function(canvasCtx, pos) {
                //console.log('[ORB.moveTo.draw] pos:', pos);
                canvasCtx.beginPath();
                canvasCtx.arc(pos.x, pos.y, 10, 0, 2*Math.PI, false);
                canvasCtx.fill();
            }
        }
    };


    Gry.Orb = Gry.Entity.extend({
        init: function(GSys, orb) {
            //console.log('[Orb.New] INCOMING orb:', orb);

            this._super(GSys, {
                entityType: Gry.EntityType.ORB,
                body: orbBody(GSys.scalePos2W(orb.mapPos), 10, { orbType: orb.orbType, orbIdx: orb.orbIdx }),
                mapPos: { x: orb.mapPos.x, y: orb.mapPos.y },
                mapDim: { w: 20, h: 20 }
            });

            this.id = orb.id;
            this.type = orb.type;
            this.orbIdx = orb.orbIdx;
            this.radius = 10;
            this.draw = Gry.OrbType[orb.type].draw;
        }
    });

}());


