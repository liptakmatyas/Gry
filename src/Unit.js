(function() {

    //  The unit type classes register themselves in this object
    Gry.UnitType = {};

    Gry.Unit = Gry.Entity.extend({
        init: function(GSys, unit) {
            //console.log('[Unit.init] INCOMING unit:', unit);

            if (typeof unit !== 'object')               { throw 'No unit stat object'; }
            if (typeof unit.unitType !== 'string' ||
                unit.unitType === '')                   { throw 'No unit type'; }
            if (typeof unit.unitIdx !== 'number')       { throw 'No unit index'; }
            if (typeof unit.team != 'string')           { throw 'No team for unit'; }
            if (typeof unit.HP !== 'number')            { throw 'No unit HP'; }
            if (typeof unit.maxHP !== 'number')         { throw 'No unit max. HP'; }

            //  Body can optionally be overridden by the caller
            if (typeof unit.body !== 'object' || unit.body === null) {
                unit.body = GSys.boxBody(
                    GSys.scalePos2W(unit.mapPos),
                    GSys.scaleDim2W({ w: unit.mapDim.w/2, h: unit.mapDim.h/2 }),
                    { unitType: unit.unitType, unitIdx: unit.unitIdx });
            }

            this._super(GSys, {
                entityType: 'unit',
                body: unit.body,
                mapPos: unit.mapPos,
                mapDim: unit.mapDim
            });

            this.unitType = unit.unitType;
            this.unitIdx = unit.unitIdx;
            this.team = unit.team;
            this.HP = unit.HP;
            this.maxHP = unit.maxHP;
        },

        //  u{body} -> u{body,box{hW,hH,a},mapPos{x,y}}
        //
        //  NOTE:   Assumes having exactly one fixture: a rectangle.
        //          (Units are squares at the moment.)
        updateMapPosDim: function() {
            //console.log('[updateUnit] PREVIOUS this:', this);
            //console.log('[updateMapPosDim] this.x, this.y:', this.mapPos.x, this.mapPos.y);

            var body = this.body;
            //console.log('[updateMapPosDim] body{x,y}:', body.GetPosition().x, body.GetPosition().y);
            var fixt = body.GetFixtureList();
            var vert = fixt.GetShape().GetVertices();
            var dim = this.GSys.scaleDim2M({ w: vert[1].x-vert[0].x, h: vert[2].y-vert[1].y });
            var cPos = this.GSys.scalePos2M(body.GetPosition());
            //console.log('[updateMapPosDim] cPos{x,y}:', cPos.x, cPos.y);
            //console.log('[updateMapPosDim] dim{w,h}:', dim.w, dim.h);

            this.box = {
                hW: dim.w/2,
                hH: dim.h/2,
                a: body.GetAngle()
            };
            this.mapPos = { x: cPos.x, y: cPos.y };

            //console.log('[updateMapPosDim] this.x, this.y:', this.mapPos.x, this.mapPos.y);
        }

    });

}());


