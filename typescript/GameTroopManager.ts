class GameTroop {
    troop : Troop; //din troops.ts
    x : number;
    y : number;
    hp : number;


    constructor(troop: Troop, x: number, y: number, hp: number = null) {
        this.troop = troop;
        this.troop.recompute();

        this.x = x;
        this.y = y;
        if (hp == null){
            this.hp = troop.maxHp;
        }
        else {
            this.hp = hp;
        }
    }

    public getTile() : Tile {
        return new Tile(this.x, this.y, 1, 1); //TODO: tile index? from troop.skin.filename i guess
    }
}


class GameTroopManager implements TileSource {
    troops : GameTroop[];

    constructor(troops: GameTroop[]) {
        this.troops = troops;
    }

    getTiles(): Tile[] {
        return this.troops.map(t => t.getTile());
    }
}