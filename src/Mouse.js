(function() {

    var loadCursors = function(cursorList) {
        for (var crsName in cursorList) {
            var crs = cursorList[crsName];
            crs.img = new Image();
            crs.img.onload = function() { crs.loaded = true; };
            crs.img.src = crs.src;
        }
    }

    Gry.Mouse = Class.extend({
        init: function() {
            this.x = 0;
            this.y = 0;
            this.overMap = false;

            //  TODO    Modes:
            //          -   place{what(icon)} -> small 32x32 icon *outside* the upper-right corner
            //          -   destroy
            this.mode = 'normal';

            this.cursor = {
                normal: { src: 'img/cursor.normal.64x64.png', loaded: false, img: null }
            };

            loadCursors(this.cursor);
        },

        onEnterMap: function(e) { this.overMap = true; },
        onLeaveMap: function(e) { this.overMap = false; },
        onMoveOverMap: function(e) { this.x = e.offsetX; this.y = e.offsetY; },

        drawCursor: function(ctx) {
            var crs = this.cursor[this.mode];
            if (!crs.loaded) return;
            ctx.drawImage(crs.img, this.x-31, this.y-31);  //  64x64 cursors
        }
    });

}());

