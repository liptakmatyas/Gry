(function() {

    Gry.MoveToOrb = Gry.Orb.extend({
        init: function(GSys, orbStat) {
            this._super(GSys, orbStat);
            this.rangeM = orbStat.range;
            this.rangeW = GSys.scaleLen2W(orbStat.range);
            this.rangeW2 = this.rangeW * this.rangeW;
        },

        force: function(fp) {
            return (fp.R2 >= this.rangeW2 ? { sym: 'a', size: fp.R2 } : null);
        },

        draw: function(canvasCtx) {
            //console.log('[ORB.moveTo.draw] pos:', pos);

            //  Render orb range
            canvasCtx.save();
            canvasCtx.fillStyle = Gry.scaledTeamColor(this.team, 0.5, 0.1);
            canvasCtx.strokeStyle = Gry.scaledTeamColor(this.team, 1, 0.2);
            canvasCtx.beginPath();
            canvasCtx.arc(this.mapPos.x, this.mapPos.y, this.rangeM, 0, 2*Math.PI, false);
            canvasCtx.fill();
            canvasCtx.stroke();
            canvasCtx.restore();

            //  Render orb
            canvasCtx.beginPath();
            canvasCtx.arc(this.mapPos.x, this.mapPos.y, this.radiusM, 0, 2*Math.PI, false);
            canvasCtx.fill();
        }

    });

}());

