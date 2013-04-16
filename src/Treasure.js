(function() {

    Gry.ItemType.TREASURE = 'treasure';

    var treasureIcon = {
        'crystal': { src: 'img/crystal.32x32.png', loaded: false, img: null },
        'diamond': { src: 'img/diamond.32x32.png', loaded: false, img: null },
        'emerald': { src: 'img/emerald.32x32.png', loaded: false, img: null },
    };

    var treasureIconNames = [];
    for (var n in treasureIcon) {
        if (treasureIcon.hasOwnProperty(n)) treasureIconNames.push(n);
    }

    Gry.Treasure = Gry.Item.extend({
        init: function(GSys, treasure) {
            this._super(GSys, {
                entityType: Gry.Entity.ITEM,
                itemType: Gry.ItemType.TREASURE,
                itemIdx: treasure.itemIdx,
                team: treasure.team,
                mapPos: treasure.mapPos,
                mapDim: { w: 32, h: 32 }
            });

            Gry.assetMgr.loadAssetList(treasureIcon);
            this.pickIcon();
        },

        pickIcon: function() {
            var iconIdx = Math.floor(Math.random()*treasureIconNames.length);
            this.image = treasureIcon[treasureIconNames[iconIdx]].img;
        },

        force: function() { return 0; },

        draw: function(canvasCtx) {
            canvasCtx.drawImage(this.image, this.mapPos.x-this.box.hW, this.mapPos.y-this.box.hH);
        },

        //  NOTE:   Assumes having exactly one fixture: a rectangle.
        //          (Items are squares at the moment.)
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

