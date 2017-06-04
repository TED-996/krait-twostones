/// <reference path="node_modules/@types/phaser/phaser.d.ts" />
/// <reference path="ajax_raw.ts"/>
import Game = Phaser.Game;
import Rectangle = Phaser.Rectangle;


interface Coord {
    x : number;
    y : number;
}

class Tile {
    x : number;
    y : number;
    tileIndex : number;
    zIndex : number;
    mirrored : boolean;
    onClick : () => void;

    constructor(x: number, y: number, tileIndex: number, zIndex: number, mirrored : boolean = false) {
        this.x = x;
        this.y = y;
        this.tileIndex = tileIndex;
        this.zIndex = zIndex;
        this.mirrored = mirrored;
        this.onClick = null;
    }

    public static getTileNeighbours(tile : Tile) : Coord[] {
        return this.getNeighbours({x: tile.x, y: tile.y});
    }

    public static getNeighbours(c : Coord) : Coord[] {
        let offset = (c.y % 2 == 1 ? 1 : 0);

        return [
            {x: c.x - 1 + offset, y: c.y - 1},
            {x: c.x + offset,     y: c.y - 1},
            {x: c.x - 1,          y: c.y},
            {x: c.x + 1,          y: c.y},
            {x: c.x - 1 + offset, y: c.y + 1},
            {x: c.x + offset,     y: c.y + 1},
        ];
    }
}


class Tileset {
    sourceImage : string; // tilesets[i].image
    firstIndex : number; // firstgid
    nrColumns : number; // columns
    spacing : number;
    tileHeight : number;
    tileWidth : number;

    constructor(sourceImage: string, firstIndex: number, nrColumns: number, spacing: number, tileHeight: number, tileWidth: number) {
        this.sourceImage = sourceImage;
        this.firstIndex = firstIndex;
        this.nrColumns = nrColumns;
        this.spacing = spacing;
        this.tileHeight = tileHeight;
        this.tileWidth = tileWidth;
    }

    public load(game : Phaser.Game) : void {
        game.load.spritesheet(this.sourceImage, "/map/" + this.sourceImage, this.tileWidth,
            this.tileHeight, -1, 0, this.spacing, 0);
    }
}

class GameMap {
    // add here!
    tileset : Tileset;
    height : number;
    width : number;
    tileArray : Array<Tile>;
    tileCount : number;
    bounds : Rectangle;


    constructor(map_url){
        let map_data = ajax_raw_sync(map_url);
        let map_json = JSON.parse(map_data);
        this.tileset = new Tileset(
            map_json.tilesets[0].image,
            map_json.tilesets[0].firstgid,
            map_json.tilesets[0].columns,
            map_json.tilesets[0].spacing,
            map_json.tilesets[0].tileheight,
            map_json.tilesets[0].tilewidth);
        this.height = map_json.height;
        this.width = map_json.width;
        this.tileCount = map_json.layers[0].data.length;
        let tempData = map_json.layers[0].data;
        this.tileArray = [];
        this.bounds = new Rectangle(
            0,
            -this.tileset.tileHeight / 4,
            this.width * this.tileset.tileWidth - this.tileset.tileWidth / 2,
            ((this.height - 1) * this.tileset.tileHeight * 3 / 4) + this.tileset.tileHeight / 2);

        for(let idx = 0; idx < this.tileCount; idx++){
            let tempTile = new Tile(idx % this.width,
                Math.floor(idx / this.width), tempData[idx] - this.tileset.firstIndex, 0);
            this.tileArray.push(tempTile);

        }

    }

    public getTiles() : Tile[] {
        return this.tileArray;
    }

    public isValidCoord(coord : Coord) : boolean {
        return coord.x >= 0 && coord.y >= 0 && coord.x < this.width && coord.y < this.height;
    }

    public getTile(coord : Coord) : Tile{
        if (!this.isValidCoord(coord)){
            return null;
        }
        else {
            return this.tileArray[coord.y * this.height + coord.x];
        }
    }

    public isAccessible(coord : Coord) : boolean {
        if (coord.x <= 0 || coord.y <= 0 || coord.x >= this.width - 1 || coord.y >= this.height - 1){
            return false;
        }
        let tile = this.getTile(coord);
        if (tile == null){
            return false;
        }
        let tileIdx = tile.tileIndex;

        return tileIdx != 76;
    }
}