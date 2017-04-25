/// <reference path="node_modules/@types/phaser/phaser.d.ts" />
/// <reference path="ajax_raw.ts"/>
var Game = Phaser.Game;
var Tile = (function () {
    function Tile(x, y, tileIndex, zIndex) {
        this.x = x;
        this.y = y;
        this.tileIndex = tileIndex;
        this.zIndex = zIndex;
    }
    return Tile;
}());
var Tileset = (function () {
    function Tileset(sourceImage, firstIndex, nrColumns, spacing, tileHeight, tileWidth) {
        this.sourceImage = sourceImage;
        this.firstIndex = firstIndex;
        this.nrColumns = nrColumns;
        this.spacing = spacing;
        this.tileHeight = tileHeight;
        this.tileWidth = tileWidth;
    }
    return Tileset;
}());
var Map = (function () {
    function Map(map_url) {
        var map_data = ajax_raw_sync(map_url);
        var map_json = JSON.parse(map_data);
        this.tileset = new Tileset(map_json.tilesets.image, map_json.tilesets.firstgid, map_json.tilesets.columns, map_json.tilesets.spacing, map_json.tilesets.tileheight, map_json.tilesets.tilewidth);
        this.height = map_json.height;
        this.width = map_json.width;
        this.tileCount = map_json.layers[0].data.length;
        var tempData = map_json.layers[0].data;
        for (var _i = 0; _i < this.tileCount; _i++) {
            var tempTile = new Tile(tempData[_i * 3], tempData[_i * 3 + 1], tempData[_i * 3 + 2], 0);
            this.tileArray.push(tempTile);
        }
        // map_json e efectiv un obiect JS (nu dictionar)
        // de exemplu, in {"abc": "def", "zzz": "23"}, json.parse("...").abc = "def" (nu "abc", ["abc"], etc
        // seteaza membri (nu uita sa-i adaugi sus), construieste this.tileset
        // in typescript e important "this.", altfel nu merge
    }
    return Map;
}());
