(function() {

    Gry.AssetManager = Class.extend({
        init: function() {
        },

        loadAssetList: function(assetList) {
            for (var assetName in assetList) {
                var asset = assetList[assetName];
                if (!asset.loaded) {
                    asset.img = new Image();
                    asset.img.onload = function(asset) {
                        return function() { asset.loaded = true; };
                    }(asset);
                    asset.img.src = asset.src;
                }
            }
        }

    });

}());

