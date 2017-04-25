/// <reference path="node_modules/@types/phaser/phaser.d.ts" />
/// <reference path="ajax_raw.ts"/>
import Game = Phaser.Game;
class Tile {
    x : number;
    y : number;
    tileIndex : number;
    zIndex : number;

    constructor(x: number, y: number, tileIndex: number, zIndex: number) {
        this.x = x;
        this.y = y;
        this.tileIndex = tileIndex;
        this.zIndex = zIndex;
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

class Map {
    // add here!
    tileset : Tileset;
    height : number;
    width : number;
    tileArray : Array<Tile>;
    tileCount : number;


    constructor(map_url){
        let map_data = ajax_raw_sync(map_url);
        let map_json = JSON.parse(map_data);
        let tempTileset = JSON.parse(map_json.tilesets);
        this.tileset = new Tileset(tempTileset.image,tempTileset.firstgid,tempTileset.columns,tempTileset.spacing,tempTileset.tileheight,tempTileset.tilewidth);
        this.height = map_json.height;
        this.width = map_json.width;
        this.tileCount = tempTileset.tilecount;
        let tempData = JSON.parse(JSON.parse(map_json).layers[0]).data;
        for(var idx = 0;idx < this.tileCount;idx++){
            let tempTile = new Tile(idx % this.width, idx / this.width, tempData[idx], 0);
            this.tileArray.push(tempTile);
        }
        
        // map_json e efectiv un obiect JS (nu dictionar)
        // de exemplu, in {"abc": "def", "zzz": "23"}, json.parse("...").abc = "def" (nu "abc", ["abc"], etc
        // seteaza membri (nu uita sa-i adaugi sus), construieste this.tileset
        // in typescript e important "this.", altfel nu merge

    }

    public getTiles() : Tile[] {
        return this.tileArray;
    }
}