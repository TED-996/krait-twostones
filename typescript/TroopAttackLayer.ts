class TroopAttackLayer implements TileSource {
    tiles : Tile[];
    game : WegasGame;

    constructor(game : WegasGame) {
        this.tiles = [];
        this.game = game;
    }

    buildTiles(map : GameMap, troop : GameTroop, onClick : (c: Coord) => void) : void {
        this.tiles = [];

        let x = troop.x;
        let y = troop.y;

        this.addTiles({x: x, y: y}, map, troop.troop.atkRange, onClick);
    }

    private addTiles(coord : Coord, map : GameMap, range : number, onClick : (c : Coord) => void){
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

            if (this.isEnemy(current)){
                this.addTile(current, true, onClick);
            }
            else if (currentDist != 0 && map.isAccessible(current)){
                this.addTile(current, false, null);
            }

            if (currentDist < range) {
                for (let next of Tile.getNeighbours(current)) {
                    let idx = next.y * map.width + next.x;
                    if (!visited[idx]) {
                        visited[idx] = true;
                        queue[qE++] = {c: next, d: currentDist + 1};
                    }
                }
            }
        }
    }

    private isEnemy(coord: Coord) {
        let troop = this.game.loadedTroops.getByPosition(coord.x, coord.y);
        return troop != null && troop.isEnemy;
    }

    private addTile(coord: Coord, isActive : boolean, onClick : (c : Coord) => void) {
        let tileIdx = isActive? 12 + 3 * 16 : 12 + 7 * 16;
        let tile = new Tile(coord.x, coord.y, tileIdx, 6);
        if (onClick != null){
            tile.onClick = () => onClick(coord);
        }
        this.tiles.push(tile);
    }

    clear() {
        this.tiles = [];
    }

    getTiles(): Tile[] {
        return this.tiles;
    }
}
