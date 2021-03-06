class GameTroop {
    troop : Troop; //din troops.ts
    x : number;
    y : number;
    hp : number;
    isEnemy : boolean;
    game : WegasGame;
    isMirrored : boolean;

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
        this.isMirrored = this.isEnemy;
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
        let result = new Tile(this.x, this.y, tileIndex, 10, this.isMirrored);
        result.onClick = this.onTroopClick.bind(this);

        return result;
    }

    public onInitialPlace() {
        this.isMirrored = (this.x > this.game.map.width / 2);
    }

    public deactivate() {
        this.game.troopMoveLayer.clear();
        this.game.troopAttackLayer.clear();
        this.game.setRenderDirty();
    }

    public activate() {
        this.game.troopMoveLayer.buildTiles(this.game.map, this, this.onMoveClick.bind(this));
        this.game.troopAttackLayer.buildTiles(this.game.map, this, this.onAttackClick.bind(this));
        this.game.setRenderDirty();
    }

    private onMoveClick(to : Coord) {
        this.move(to.x, to.y);
        this.game.deactivateTroop();
    }

    private onAttackClick(to : Coord){
        this.attack(to.x, to.y);
        this.game.deactivateTroop();
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

    public attack(x : number, y : number) {
        let from = {x: this.x, y: this.y};
        let to = {x: x, y: y};
        let responseWait = this.game.networking.sendAttack(from, to);

        if (responseWait != null) {
            let self = this;
            responseWait.setOnComplete((data) => self.onAttackResponse(data, from, to));
        }
    }

    //noinspection JSUnusedLocalSymbols
    private onMoveResponse(data : any, from : Coord, to : Coord){
        if (data.type != "ok"){
            this.x = from.x;
            this.y = from.y;
            this.game.setRenderDirty();
        }
    }

    //noinspection JSUnusedLocalSymbols
    private onAttackResponse(data: NetworkingMessage, from: Coord, to: Coord) {
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

    getById(id: number) : GameTroop {
        for (let troop of this.troops){
            if (troop.troop.id == id){
                return troop;
            }
        }
        return null;
    }

    getByPosition(x : number, y : number) : GameTroop {
        for (let troop of this.troops){
            if (troop.x == x && troop.y == y){
                return troop;
            }
        }
        return null;
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