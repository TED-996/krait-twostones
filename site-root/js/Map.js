/// <reference path="node_modules/@types/phaser/phaser.d.ts" />
/// <reference path="ajax_raw.ts"/>
var Game = Phaser.Game;
var Rectangle = Phaser.Rectangle;
var Tile = (function () {
    function Tile(x, y, tileIndex, zIndex, mirrored) {
        if (mirrored === void 0) { mirrored = false; }
        this.x = x;
        this.y = y;
        this.tileIndex = tileIndex;
        this.zIndex = zIndex;
        this.mirrored = mirrored;
        this.onClick = null;
    }
    Tile.getTileNeighbours = function (tile) {
        return this.getNeighbours({ x: tile.x, y: tile.y });
    };
    Tile.getNeighbours = function (c) {
        var offset = (c.y % 2 == 1 ? 1 : 0);
        return [
            { x: c.x - 1 + offset, y: c.y - 1 },
            { x: c.x + offset, y: c.y - 1 },
            { x: c.x - 1, y: c.y },
            { x: c.x + 1, y: c.y },
            { x: c.x - 1 + offset, y: c.y + 1 },
            { x: c.x + offset, y: c.y + 1 },
        ];
    };
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
        this.bounds = new Rectangle(0, -this.tileset.tileHeight / 4, this.width * this.tileset.tileWidth - this.tileset.tileWidth / 2, ((this.height - 1) * this.tileset.tileHeight * 3 / 4) + this.tileset.tileHeight / 2);
        for (var idx = 0; idx < this.tileCount; idx++) {
            var tempTile = new Tile(idx % this.width, Math.floor(idx / this.width), tempData[idx] - this.tileset.firstIndex, 0);
            this.tileArray.push(tempTile);
        }
    }
    GameMap.prototype.getTiles = function () {
        return this.tileArray;
    };
    GameMap.prototype.isValidCoord = function (coord) {
        return coord.x >= 0 && coord.y >= 0 && coord.x < this.width && coord.y < this.height;
    };
    GameMap.prototype.getTile = function (coord) {
        if (!this.isValidCoord(coord)) {
            return null;
        }
        else {
            return this.tileArray[coord.y * this.height + coord.x];
        }
    };
    GameMap.prototype.isAccessible = function (coord) {
        if (coord.x <= 0 || coord.y <= 0 || coord.x >= this.width - 1 || coord.y >= this.height - 1) {
            return false;
        }
        var tile = this.getTile(coord);
        if (tile == null) {
            return false;
        }
        var tileIdx = tile.tileIndex;
        return tileIdx != 76;
    };
    return GameMap;
}());
