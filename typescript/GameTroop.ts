class GameTroop {
    troop : Troop; //din troops.ts
    x : number;
    y : number;
    hp : number;
    isEnemy : boolean;
    game : WegasGame;

    static playerTiles : {[className : string] : number} = {
        "Runner": 15,
        "Infantry": 29,
        "Tank": 30,
        "Archer": 31
    };
    static enemyTiles : {[className : string] : number} = {
        "Runner": 61,
        "Infantry": 45,
        "Tank": 46,
        "Archer": 47
    };

    constructor(troop: Troop, game : WegasGame,
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
            tileIndex = GameTroop.enemyTiles[this.troop.troopClass.name];
        }
        else{
            tileIndex = GameTroop.playerTiles[this.troop.troopClass.name];
        }
        let result = new Tile(this.x, this.y, tileIndex, 10, this.isEnemy);
        result.onClick = this.onTroopClick.bind(this);

        return result;
    }

    public deactivate() {
        this.game.troopMoveLayer.clear();
        this.game.setRenderDirty();
    }

    public activate() {
        this.game.troopMoveLayer.buildTiles(this.game.map, this, this.onMoveClick.bind(this));
        this.game.setRenderDirty();
    }

    private onMoveClick(to : Coord) {
        this.move(to.x, to.y);
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

    //noinspection JSUnusedLocalSymbols
    public onMoveResponse(data : any, from : Coord, to : Coord){
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