(function() {

    var orbRangeFixtDef = function(radius) {
        var fd = new b2FixtureDef();
        fd.density      = 1.0;
        fd.friction     = 1.0;
        fd.restitution  = 0.00001;

        fd.shape = new b2CircleShape(radius);

        fd.isSensor             = true;
        fd.filter.categoryBits  = Gry.EntityCategory.ORB;
        fd.filter.maskBits      = Gry.EntityCategory.HERO;

        return fd;
    };

    Gry.PathOrb = Gry.Orb.extend({
        //  ->  GSys:           The main Gry system object
        //  ->  orbStat:        Orb parameters
        init: function(GSys, orbStat) {
            this._super(GSys, orbStat);
            
            this.rangeM = orbStat.range;
            this.rangeW = GSys.scaleLen2W(orbStat.range);
            this.rangeW2 = this.rangeW * this.rangeW;

            this.jump = false;
            this.tail = (typeof orbStat.tail === 'object' ? orbStat.tail : null);;
            
            this.body.CreateFixture(orbRangeFixtDef(this.rangeW));
        },

        AddTail: function(mapPos) {
            if (this.tail) this.tail.push(mapPos);
            else this.tail = [mapPos];
        },

        force: function(fp) {
            return (fp.R2 >= this.rangeW2 ? { sym: 'a', size: 50 } : null);
        },

        draw: function(canvasCtx) {
            //console.log('[ORB.moveTo.draw] pos:', pos);

            //  Jump to next location if the hero reached this one,
            //  and we have path points left
            //
            //  FIXME   If the hero is in the intersection of the old and new orb's range,
            //          no new BeginContact is generated (?) and thus the new orb will never be hit,
            //          so the hero gets stuck.
            if (this.jump) {
                var nextPos = undefined;
                if (this.tail) { nextPos = this.tail.shift(); }
                if (typeof nextPos === 'undefined') {
                    this.hero.RemoveOrbId(this.id);
                    return;
                }

                this.mapPos = nextPos;
                var newWorldPos = this.GSys.scalePos2W(this.mapPos);
                var v = new b2Vec2(newWorldPos.x, newWorldPos.y);
                this.body.SetPosition(v);
                this.jump = false;
            }

            //  Render tail
            var tail = this.tail;
            if (tail) {
                var nTail = tail.length;
                if (nTail) {
                    canvasCtx.save();
                    for (var i = 0; i < nTail; ++i) {
                        var tPos = tail[i];
                        var alpha = 0.5*((nTail-i)/nTail);
                        canvasCtx.fillStyle = Gry.scaledTeamColor(this.team, 1, alpha);
                        canvasCtx.beginPath();
                        canvasCtx.arc(tPos.x, tPos.y, this.radiusM, 0, 2*Math.PI, false);
                        canvasCtx.fill();
                    }
                    canvasCtx.restore();
                }
            }

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

