class GameTroop {
    troop : Troop; //din troops.ts
    x : number;
    y : number;
    hp : number;
    isEnemy : number;
    game : WegasGame;


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

    private onTroopClick(){
        this.game.onTroopClick(this);
    }

    public getTile() : Tile {
        let tileIndex : number;
        if (this.isEnemy){
            tileIndex = 13;
        }
        else{
            tileIndex = 14;
        }
        let result = new Tile(this.x, this.y, tileIndex, 1);
        result.onClick = this.onTroopClick.bind(this);

        return result;
    }

    public deactivate() {

    }

    public activate() {
        this.x += 1;
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