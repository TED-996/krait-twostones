class Flag {
    isOwn : boolean;
    x : number;
    y : number;

    carryingTroop : GameTroop;

    constructor(isOwn: boolean, x: number, y: number, carryingTroop: GameTroop) {
        this.isOwn = isOwn;
        this.x = x;
        this.y = y;
        this.carryingTroop = carryingTroop;
    }

    getTile() : Tile {
        let tileIdx;
        if (this.isOwn){
            tileIdx = 28;
        }
        else{
            tileIdx = 44;
        }

        if (this.carryingTroop != null){
            this.x = this.carryingTroop.x;
            this.y = this.carryingTroop.y;
            tileIdx += 4 * 16;
        }

        return new Tile(this.x, this.y, tileIdx, 8);
    }
}

interface FlagTransportObject {
    is_own : boolean;
    x : number;
    y : number;
    carrying_troop? : number;
}


class FlagManager implements TileSource {
    ownFlag : Flag;
    opponentFlag : Flag;
    game : WegasGame;

    constructor(game : WegasGame) {
        this.ownFlag = new Flag(true, -1, -2, null);
        this.opponentFlag = new Flag(false, -1, -2, null);
        this.game = game;
    }

    update(data: FlagTransportObject[]) {
        for (let flag of data){
            if (flag.is_own){
                this.updateFlag(this.ownFlag, flag);
            }
            else{
                this.updateFlag(this.opponentFlag, flag);
            }
        }
    }

    private updateFlag(dst: Flag, src: FlagTransportObject) {
        dst.x = src.x;
        dst.y = src.y;
        dst.isOwn = src.is_own;

        if (src.carrying_troop != null){ //or undefined
            dst.carryingTroop = this.game.loadedTroops.getById(src.carrying_troop)
        }
        else{
            dst.carryingTroop = null;
        }
    }


    getTiles(): Tile[] {
        return [this.ownFlag.getTile(), this.opponentFlag.getTile()];
    }
}