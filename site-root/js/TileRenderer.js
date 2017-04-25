/// <reference path="node_modules/@types/phaser/phaser.d.ts" />
var ImmutableTileSource = (function () {
    function ImmutableTileSource(tiles) {
        this.tiles = TileSourceUtils.sort(tiles);
    }
    ImmutableTileSource.prototype.getTiles = function () {
        return this.tiles;
    };
    ImmutableTileSource.prototype.getSortedTiles = function () {
        return this.tiles;
    };
    return ImmutableTileSource;
}());
var SortingTileSource = (function () {
    function SortingTileSource(source) {
        this.source = source;
    }
    SortingTileSource.prototype.getTiles = function () {
        return this.source.getTiles();
    };
    SortingTileSource.prototype.getSortedTiles = function () {
        return TileSourceUtils.sort(this.source.getTiles());
    };
    return SortingTileSource;
}());
var TileSourceUtils = (function () {
    function TileSourceUtils() {
    }
    TileSourceUtils.sort = function (src) {
        return src.sort(TileSourceUtils.tileComparator);
    };
    TileSourceUtils.concatSort = function (sources) {
        if (sources.length == 0) {
            return [];
        }
        if (sources.length == 1) {
            return TileSourceUtils.sort(sources[0].getTiles());
        }
        return TileSourceUtils.concatMerge(sources.map(function (s) { return new ImmutableTileSource(s.getTiles()); })); //ImmutableTileSource first sorts them
    };
    TileSourceUtils.concatMerge = function (sources) {
        if (sources.length == 0) {
            return [];
        }
        if (sources.length == 1) {
            return sources[0].getSortedTiles();
        }
        var result = [];
        var tileSources = sources.map(function (t) { return t.getSortedTiles(); }).filter(function (t) { return t.length != 0; });
        var source = tileSources[0];
        var next = tileSources[0][0];
        while (tileSources.length != 0) {
            source = tileSources[0];
            var idx = 1;
            while (idx < tileSources.length) {
                if (TileSourceUtils.tileComparator(tileSources[idx][0], next) == -1) {
                    next = tileSources[idx][0];
                    source = tileSources[idx];
                }
            }
            result.push(source.shift());
            if (source.length == 0) {
                delete tileSources[tileSources.indexOf(source)];
            }
        }
        return result;
    };
    TileSourceUtils.tileComparator = function (t1, t2) {
        if (t1.y != t2.y) {
            return t1.y > t2.y ? 1 : -1;
        }
        if (t1.x != t2.x) {
            return t1.x > t2.x ? 1 : -1;
        }
        if (t1.zIndex != t2.tileIndex) {
            return t1.zIndex > t2.zIndex ? 1 : -1;
        }
        if (t1.tileIndex != t2.tileIndex) {
            return t1.tileIndex > t2.tileIndex ? 1 : -1; //prevent any kind of flickering
        }
        return 0; //They are equal
    };
    return TileSourceUtils;
}());
var TileRenderer = (function () {
    function TileRenderer(immutableSources, sortedSources, mutableSources, tileset, game) {
        this.sources =
            [new ImmutableTileSource(TileSourceUtils.concatSort(immutableSources))]
                .concat(sortedSources).concat(mutableSources.map(function (s) { return new SortingTileSource(s); }));
        this.tileset = tileset;
        this.spriteBatch = game.add.spriteBatch(null, "tiles", true);
        this.spriteBatch.cacheAsBitmap = true;
        this.init();
    }
    TileRenderer.prototype.init = function () {
        this.update();
    };
    TileRenderer.prototype.update = function () {
        this.spriteBatch.removeAll();
        var tileWidth = this.tileset.tileWidth;
        var tileHeight = this.tileset.tileHeight;
        var hexSizeLength = tileHeight / 2;
        for (var _i = 0, _a = TileSourceUtils.concatMerge(this.sources); _i < _a.length; _i++) {
            var t = _a[_i];
            this.spriteBatch.create(t.x * tileWidth + (t.y % 2 == 0 ? 0 : tileWidth / 2), t.y * hexSizeLength, this.tileset.sourceImage, t.tileIndex);
        }
    };
    return TileRenderer;
}());
