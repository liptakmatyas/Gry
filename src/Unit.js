Gry.Unit = (function($) {

    var U = function(GSys, stat) {
        //console.log('[Unit.New] INCOMING stat:', stat);
        stat.body = GSys.createBox(
                        GSys.scalePos2W(stat.mapPos),
                        GSys.scaleDim2W({ w: stat.imgW, h: stat.imgH }),
                        b2Body.b2_dynamicBody,
                        { unitType: stat.unitType, unitIdx: stat.unitIdx });

        //console.log('[Unit.New] RETURNED stat:', stat);
        return stat;
    };

    return U;

}(jQuery));


