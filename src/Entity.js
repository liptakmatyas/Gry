(function() {

    Gry.EntityType = {
        WALL:   'wall',
        UNIT:   'unit',
        HERO:   'hero',
        ORB:    'orb'
    };

    Gry.EntityCategory = {
        WALL:   0x0001,
        UNIT:   0x0002,
        HERO:   0x0004,
        ORB:    0x0008
    };

    Gry.Entity = Class.extend({
        init: function(GSys, e) {
            if (typeof e !== 'object')              { throw 'No entity info'; }
            if (typeof e.entityType !== 'string')   { throw 'No entity type'; }
            if (typeof e.body !== 'object')         { throw 'No entity body'; }
            if (typeof e.mapPos !== 'object')       { throw 'No entity map position'; }
            if (typeof e.mapPos.x !== 'number' ||
                typeof e.mapPos.y !== 'number')     { throw 'Bad entity map position'; }
            if (typeof e.mapDim !== 'object')       { throw 'No entity map dimension'; }
            if (typeof e.mapDim.w !== 'number' ||
                typeof e.mapDim.h !== 'number')     { throw 'Bad entity map dimension'; }

            this.GSys = GSys;
            this.entityType = e.entityType;
            this.body =  e.body;
            this.mapPos = { x: e.mapPos.x, y: e.mapPos.y },
            this.mapDim = { w: e.mapDim.w, h: e.mapDim.h }
        }

    });

})();

