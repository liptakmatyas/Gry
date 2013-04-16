(function() {

    //  The item type classes register themselves in this object
    Gry.ItemType = {};

    var boxBodyDef = function(posW, bType) {
        var bd = new b2BodyDef();
        bd.type = bType;
        bd.position.Set(posW.x, posW.y);
        //  FIXME   Magic numbers!
        bd.linearDamping = 2;
        bd.angularDamping = 1;
        return bd;
    };

    var boxFixtDef = function(hdimW) {
        var fd = new b2FixtureDef();
        fd.density      = 1.0;
        fd.friction     = 1.0;
        fd.restitution  = 0.00001;

        fd.shape = new b2PolygonShape();
        fd.shape.SetAsBox(hdimW.w, hdimW.h);

        fd.filter.categoryBits   = Gry.EntityCategory.ITEM;
        fd.filter.maskBits       = 0xFFFF;

        return fd;
    };

    //  Create a default box
    //  - at world position posW{x,y}
    //  - with half world scale size hdimW{w,h}
    var boxBody = function(posW, hdimW) {
        //var b = Gry.World.CreateBody(boxBodyDef(posW, b2Body.b2_staticBody));
        var b = Gry.World.CreateBody(boxBodyDef(posW, b2Body.b2_dynamicBody));
        var f = boxFixtDef(hdimW);
        b.CreateFixture(f);
        return b;
    };

    Gry.Item = Gry.Entity.extend({
        init: function(GSys, item) {
            if (typeof item !== 'object')               { throw 'No item stat object'; }
            if (typeof item.itemType !== 'string' ||
                item.itemType === '')                   { throw 'No item type'; }
            if (typeof item.itemIdx !== 'number')       { throw 'No item index'; }
            if (typeof item.team != 'string')           { throw 'No team for item'; }

            //  Body can optionally be overridden by the caller
            if (typeof item.body !== 'object' || item.body === null) {
                item.body = boxBody(
                    GSys.scalePos2W(item.mapPos),
                    GSys.scaleDim2W({ w: item.mapDim.w/2, h: item.mapDim.h/2 }));
            }

            this._super(GSys, {
                entityType: 'item',
                body: item.body,
                mapPos: item.mapPos,
                mapDim: item.mapDim
            });

            this.collected = false;
            this.itemType = item.itemType;
            this.itemIdx = item.itemIdx;
            this.team = item.team;
            this.HP = item.HP;
            this.maxHP = item.maxHP;
        },

        //  u{body} -> u{body,box{hW,hH,a},mapPos{x,y}}
        //
        //  NOTE:   Assumes having exactly one fixture: a rectangle.
        updateMapPosDim: function() {
            var body = this.body;
            var fixt = body.GetFixtureList();
            var vert = fixt.GetShape().GetVertices();
            var dim = this.GSys.scaleDim2M({ w: vert[1].x-vert[0].x, h: vert[2].y-vert[1].y });
            var cPos = this.GSys.scalePos2M(body.GetPosition());

            this.box = {
                hW: dim.w/2,
                hH: dim.h/2,
                a: body.GetAngle()
            };
            this.mapPos = { x: cPos.x, y: cPos.y };
        }

    });

}());


