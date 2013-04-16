(function() {

    Gry.ItemType.TREASURE = 'treasure';

    var treasureIcon = {
        'red-crystal':      { src: 'img/crystal.red-normal-32x32.png', loaded: false, img: null },
        'red-diamond':      { src: 'img/diamond.red-normal-32x32.png', loaded: false, img: null },
        'red-emerald':      { src: 'img/emerald.red-normal-32x32.png', loaded: false, img: null },
        'green-crystal':    { src: 'img/crystal.green-normal-32x32.png', loaded: false, img: null },
        'green-diamond':    { src: 'img/diamond.green-normal-32x32.png', loaded: false, img: null },
        'green-emerald':    { src: 'img/emerald.green-normal-32x32.png', loaded: false, img: null },
        'blue-crystal':     { src: 'img/crystal.blue-normal-32x32.png', loaded: false, img: null },
        'blue-diamond':     { src: 'img/diamond.blue-normal-32x32.png', loaded: false, img: null },
        'blue-emerald':     { src: 'img/emerald.blue-normal-32x32.png', loaded: false, img: null },
    };

    var treasureIconNames = [];
    for (var n in treasureIcon) {
        if (treasureIcon.hasOwnProperty(n)) treasureIconNames.push(n);
    }

    Gry.Treasure = Gry.Item.extend({
        init: function(GSys, treasure) {
            Gry.assetMgr.loadAssetList(treasureIcon);

            this._super(GSys, {
                entityType: Gry.Entity.ITEM,
                itemType: Gry.ItemType.TREASURE,
                itemIdx: treasure.itemIdx,
                team: treasure.team,
                mapPos: treasure.mapPos,
                mapDim: { w: 32, h: 32 }
            });

            this.collected = false;
            this.price = 100;
            this.XP = 5;
            this.pickIcon();
        },

        pickIcon: function() {
            var iconIdx = Math.floor(Math.random()*treasureIconNames.length);
            this.image = treasureIcon[treasureIconNames[iconIdx]].img;
        },

        force: function() { return 0; },

        draw: function(canvasCtx) {
            canvasCtx.save();
            canvasCtx.translate(this.mapPos.x, this.mapPos.y);
            canvasCtx.rotate(this.box.a);
            canvasCtx.drawImage(this.image, -this.box.hW, -this.box.hH);
            canvasCtx.restore();
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

