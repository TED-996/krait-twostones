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
var GameMap = (function () {
    function GameMap(map_url) {
        var map_data = ajax_raw_sync(map_url);
        var map_json = JSON.parse(map_data);
        this.tileset = new Tileset(map_json.tilesets[0].image, map_json.tilesets[0].firstgid, map_json.tilesets[0].columns, map_json.tilesets[0].spacing, map_json.tilesets[0].tileheight, map_json.tilesets[0].tilewidth);
        this.height = map_json.height;
        this.width = map_json.width;
        this.tileCount = map_json.layers[0].data.length;
        var tempData = map_json.layers[0].data;
        this.tileArray = [];
        for (var idx = 0; idx < this.tileCount; idx++) {
            var tempTile = new Tile(idx % this.width, Math.floor(idx / this.width), tempData[idx], 0);
            this.tileArray.push(tempTile);
        }
    }
    GameMap.prototype.getTiles = function () {
        return this.tileArray;
    };
    return GameMap;
}());
