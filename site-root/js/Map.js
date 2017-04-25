/// <reference path="node_modules/@types/phaser/phaser.d.ts" />
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
        // map_json e efectiv un obiect JS (nu dictionar)
        // de exemplu, in {"abc": "def", "zzz": "23"}, json.parse("...").abc = "def" (nu "abc", ["abc"], etc
        // seteaza membri (nu uita sa-i adaugi sus), construieste this.tileset
        // in typescript e important "this.", altfel nu merge
    }
    return Map;
}());
