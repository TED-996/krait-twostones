class TroopMoveLayer implements TileSource {
    tiles : Tile[];

    constructor() {
        this.tiles = [];
    }

    buildTiles(map : GameMap, troop : GameTroop) : void {
        this.tiles = [];

        let x = troop.x;
        let y = troop.y;


    }

    getTiles(): Tile[] {
        return this.tiles;
    }
}
