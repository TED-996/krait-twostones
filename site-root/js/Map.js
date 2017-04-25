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
    Tileset.prototype.load = function (game) {
        game.load.spritesheet(this.sourceImage, "/map/" + this.sourceImage, this.tileWidth, this.tileHeight, -1, 0, this.spacing, 0);
    };
    return Tileset;
}());
var Map = (function () {
    function Map(map_url) {
        var map_data = ajax_raw_sync(map_url);
        var map_json = JSON.parse(map_data);
        var tempTileset = JSON.parse(map_json.tilesets);
        this.tileset = new Tileset(tempTileset.image, tempTileset.firstgid, tempTileset.columns, tempTileset.spacing, tempTileset.tileheight, tempTileset.tilewidth);
        this.height = map_json.height;
        this.width = map_json.width;
        this.tileCount = tempTileset.tilecount;
        var tempData = JSON.parse(JSON.parse(map_json).layers[0]).data;
        for (var idx = 0; idx < this.tileCount; idx++) {
            var tempTile = new Tile(idx % this.width, idx / this.width, tempData[idx], 0);
            this.tileArray.push(tempTile);
        }
        // map_json e efectiv un obiect JS (nu dictionar)
        // de exemplu, in {"abc": "def", "zzz": "23"}, json.parse("...").abc = "def" (nu "abc", ["abc"], etc
        // seteaza membri (nu uita sa-i adaugi sus), construieste this.tileset
        // in typescript e important "this.", altfel nu merge
    }
    Map.prototype.getTiles = function () {
        return this.tileArray;
    };
    return Map;
}());
