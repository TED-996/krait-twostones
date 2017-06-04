class GameTroop {
    troop : Troop; //din troops.ts
    x : number;
    y : number;
    hp : number;
    isEnemy : boolean;
    game : WegasGame;


    constructor(troop: Troop, game : WegasGame, networking : WegasNetworking,
                x: number, y: number, isEnemy : boolean, hp: number = null) {
        this.troop = troop;
        this.troop.recompute();

        this.x = x;
        this.y = y;
        this.isEnemy = isEnemy;

        this.game = game;

        if (hp != null) {
            this.hp = hp;
        } else {
            this.hp = troop.maxHp;
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
        let result = new Tile(this.x, this.y, tileIndex, 10);
        result.onClick = this.onTroopClick.bind(this);

        return result;
    }

    public deactivate() {
        //this.move(this.x - 1, this.y);
    }

    public activate() {
        //this.move(this.x + 1, this.y);
        this.spawn_range(this.game.map, this.troop.moveRange)
    }

    public move(x: number, y: number) {
        let from = {x: this.x, y: this.y};
        let to = {x: x, y: y};
        let responseWait = this.game.networking.sendMove(from, to);

        if (responseWait != null) {
            this.x = x;
            this.y = y;
            this.game.setRenderDirty();

            let self = this;
            responseWait.setOnComplete((data) => self.onMoveResponse(data, from, to));
        }
    }

    public onMoveResponse(data : any, from : {x: number, y: number}, to : {x: number, y: number}){
        if (data.type != "ok"){
            this.x = from.x;
            this.y = from.y;
            this.game.setRenderDirty();
        }
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