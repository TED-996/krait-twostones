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
        this.tileset = new Tileset(map_json.tilesets.image,map_json.tilesets.firstgid,map_json.tilesets.columns,map_json.tilesets.spacing,map_json.tilesets.tileheight,map_json.tilesets.tilewidth);
        this.height = map_json.height;
        this.width = map_json.width;
        this.tileCount = map_json.layers[0].data.length;
        let tempData = map_json.layers[0].data;
        for(var _i = 0;_i < this.tileCount;_i++){
            let tempTile = new Tile(tempData[_i*3],tempData[_i*3 + 1],tempData[_i*3 + 2],0);
            this.tileArray.push(tempTile);
        }
        
        // map_json e efectiv un obiect JS (nu dictionar)
        // de exemplu, in {"abc": "def", "zzz": "23"}, json.parse("...").abc = "def" (nu "abc", ["abc"], etc
        // seteaza membri (nu uita sa-i adaugi sus), construieste this.tileset
        // in typescript e important "this.", altfel nu merge
    }
}