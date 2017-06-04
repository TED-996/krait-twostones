class GameTroop {
    troop : Troop; //din troops.ts
    x : number;
    y : number;
    hp : number;
    isEnemy : number;


    constructor(troop: Troop, x: number, y: number, isEnemy : number, hp: number = null) {
        this.troop = troop;
        this.troop.recompute();

        this.x = x;
        this.y = y;
        this.isEnemy = isEnemy;
        if (hp == null){
            this.hp = troop.maxHp;
        }
        else {
            this.hp = hp;
        }
    }

    public getTile() : Tile {
        let tileIndex : number;
        if (this.isEnemy){
            tileIndex = 13;
        }
        else{
            tileIndex = 14;
        }
        return new Tile(this.x, this.y, tileIndex, 1); //TODO: tile index? from troop.skin.filename i guess
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

interface GameTroopTransferObject {
    id : number,
    match : number,
    troop : number,
    x : number,
    y : number,
    hp : number,
    respawn : number
}