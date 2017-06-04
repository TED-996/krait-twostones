/// <reference path="node_modules/@types/phaser/phaser.d.ts" />

interface TileSource {
    getTiles() : Tile[];
}

interface SortedTileSource {
    getSortedTiles() : Tile[];
}


class ImmutableTileSource implements TileSource, SortedTileSource {
    tiles : Tile[];

    constructor(tiles: Tile[]) {
        this.tiles = TileSourceUtils.sort(tiles);
    }

    getTiles(): Tile[] {
        return this.tiles;
    }

    getSortedTiles(): Tile[] {
        return this.tiles;
    }

}

class SortingTileSource implements SortedTileSource, TileSource {
    source : TileSource;

    constructor(source : TileSource){
        this.source = source;
    }

    getTiles(): Tile[] {
        return this.source.getTiles();
    }

    getSortedTiles(): Tile[] {
        return TileSourceUtils.sort(this.source.getTiles());
    }
}

class TileSourceUtils {
    static sort(src: Tile[]) : Tile[]{
        return src.sort(TileSourceUtils.tileComparator);
    }

    static concatSort(sources : TileSource[]) : Tile[]{
        if (sources.length == 0){
            return [];
        }
        if (sources.length == 1){
            return TileSourceUtils.sort(sources[0].getTiles());
        }
        return TileSourceUtils.concatMerge(
            sources.map(s => new ImmutableTileSource(s.getTiles()))); //ImmutableTileSource first sorts them
    }

    static concatMerge(sources : SortedTileSource[]) : Tile[] {
        if (sources.length == 0){
            return [];
        }
        if (sources.length == 1){
            return sources[0].getSortedTiles();
        }

        let result = [];
        let tileSources = sources.map(t => t.getSortedTiles().concat([])).filter(t => t.length != 0);
        let source = tileSources[0];
        while(tileSources.length != 0){
            let next = tileSources[0][0];
            source = tileSources[0];

            let idx = 1;
            while(idx < tileSources.length){
                if (TileSourceUtils.tileComparator(tileSources[idx][0], next) == -1){
                    next = tileSources[idx][0];
                    source = tileSources[idx];
                }
                idx++;
            }

            result.push(source.shift());
            if (source.length == 0){
                tileSources.splice(tileSources.indexOf(source), 1);
            }
        }

        return result;
    }

    static tileComparator(t1 : Tile, t2: Tile) : number{
        if (t1.y != t2.y){
            return t1.y > t2.y ? 1 : -1;
        }
        if (t1.x != t2.x){
            return t1.x > t2.x ? 1 : -1;
        }
        if (t1.zIndex != t2.tileIndex){
            return t1.zIndex > t2.zIndex ? 1 : -1;
        }
        if (t1.tileIndex != t2.tileIndex){
            return t1.tileIndex > t2.tileIndex ? 1 : -1; //prevent any kind of flickering
        }
        return 0; //They are equal
    }
}


class TileRenderer {
    sources : SortedTileSource[];
    tileset : Tileset;
    spriteBatch : Phaser.SpriteBatch;


    constructor(immutableSources : TileSource[],
                sortedSources : SortedTileSource[],
                mutableSources : TileSource[],
                tileset : Tileset,
                group : Phaser.Group){
        this.sources =
            [<SortedTileSource>new ImmutableTileSource(TileSourceUtils.concatSort(immutableSources))]
                .concat(sortedSources).concat(mutableSources.map(s => new SortingTileSource(s)));

        this.tileset = tileset;
        this.spriteBatch = group.add(new Phaser.SpriteBatch(group.game, group, "tiles", true));
        //this.spriteBatch.cacheAsBitmap = true;
        this.spriteBatch.fixedToCamera = false;
        this.init();
    }

    private init() : void {
        this.update();
    }

    public update() : void{
        this.spriteBatch.removeAll();
        let tileWidth = this.tileset.tileWidth;
        let tileHeight = this.tileset.tileHeight;
        let hexSizeLength = tileHeight / 2;

        for (let t  of TileSourceUtils.concatMerge(this.sources)){
            this.spriteBatch.create(
                t.x * tileWidth + ((t.y % 2 == 0) ? 0 : (tileWidth / 2)),
                t.y * tileHeight * 3 / 4,
                this.tileset.sourceImage,
                t.tileIndex
            ).anchor = new Phaser.Point(0.5, 0.5);
        }
    }
}