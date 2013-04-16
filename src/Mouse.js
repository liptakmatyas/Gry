(function() {

    Gry.Mouse = Class.extend({
        init: function() {
            this.x = 0;
            this.y = 0;
            this.overMap = false;

            this.mode = 'normal';
            this.cursor = {
                normal:         { src: 'img/cursor.normal.64x64.png', loaded: false, img: null },
                SetOrbTarget:   { src: 'img/cursor.placeOrb.64x64.png', loaded: false, img: null },
                SetOrbTail:     { src: 'img/cursor.placeTail.64x64.png', loaded: false, img: null }
            };

            Gry.assetMgr.loadAssetList(this.cursor);
        },

        onEnterMap: function(e) { this.overMap = true; return false; },
        onLeaveMap: function(e) { this.overMap = false; return false; },
        onMoveOverMap: function(e) { this.x = e.offsetX; this.y = e.offsetY; return false; },

        setMode: function(mode) { this.mode = mode; },

        DrawCursor: function(ctx) {
            var crs = this.cursor[this.mode];
            if (!crs.loaded) return;
            ctx.drawImage(crs.img, this.x-31, this.y-31);  //  64x64 cursors
        }
    });

}());

