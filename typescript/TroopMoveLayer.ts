class TroopMoveLayer implements TileSource {
    tiles : Tile[];
    private visited : boolean[];

    constructor() {
        this.tiles = [];
    }

    buildTiles(map : GameMap, troop : GameTroop) : void {
        this.tiles = [];

        let x = troop.x;
        let y = troop.y;

        this.visited = [];
        this.visited[y * map.width + x] = true;

        this.addTiles({x: x, y: y}, map, troop.troop.moveRange);
    }

    private addTiles(coord : Coord, map : GameMap, range : number){
        if (range <= 0){
            return;
        }
        for (coord of Tile.getNeighbours(coord).filter(c => map.isAccessible(c))){
            let idx = coord.y * map.width + coord.x;
            if (!this.visited[idx]){
                this.visited[idx] = true;

                this.addTile(coord);

                this.addTiles(coord, map, range - 1);
            }
        }
    }

    private addTile(coord: Coord) {
        this.tiles.push(new Tile(coord.x, coord.y, 12, 5));
    }

    getTiles(): Tile[] {
        return this.tiles;
    }
}
