class TroopMoveLayer implements TileSource {
    tiles : Tile[];

    constructor() {
        this.tiles = [];
    }

    buildTiles(map : GameMap, troop : GameTroop) : void {
        this.tiles = [];

        let x = troop.x;
        let y = troop.y;

        this.addTiles({x: x, y: y}, map, troop.troop.moveRange);
    }

    private addTiles(coord : Coord, map : GameMap, range : number){
        if (range <= 0){
            return;
        }
        let queue = [{c: coord, d: 0}];
        let qS = 0;
        let qE = 1;

        let visited = [];
        visited[coord.y * map.width + coord.x] = true;

        while(qS < qE) {
            let current = queue[qS].c;
            let currentDist = queue[qS].d;
            qS++;

            if (currentDist != 0){
                this.addTile(current);
            }

            if (currentDist < range) {
                for (let next of Tile.getNeighbours(current).filter(c => map.isAccessible(c))) {
                    let idx = next.y * map.width + next.x;
                    if (!visited[idx]) {
                        visited[idx] = true;
                        queue[qE++] = {c: next, d: currentDist + 1};
                    }
                }
            }
        }
    }

    private addTile(coord: Coord) {
        this.tiles.push(new Tile(coord.x, coord.y, 12, 5));
    }

    clear() {
        this.tiles = [];
    }

    getTiles(): Tile[] {
        return this.tiles;
    }
}
