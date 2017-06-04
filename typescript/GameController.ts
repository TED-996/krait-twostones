class GameController {
    private game : WegasGame;
    private networking : WegasNetworking;

    private joined : boolean;
    private joinSent : boolean;

    private troopsGot : boolean;
    private troopsGetSent : boolean;


    constructor(game: WegasGame) {
        this.game = game;
        this.networking = game.networking;
        this.joined = false;
    }

    public join() : WebsocketResponseWaitItem {
        let result = this.networking.sendJoin();
        if (result == null){
            return null;
        }

        result.setOnComplete(this.onJoin.bind(this));

        return result
    }

    private onJoin() {
        this.joined = true;
    }

    public getTroops() : WebsocketResponseWaitItem {
        let result = this.networking.sendGetTroops();
        if (result == null){
            return null;
        }

        result.setOnComplete(this.onGetTroops.bind(this));

        return result;
    }

    private onGetTroops(data : any) {
        if (data.type != "error") {
            this.updateTroops(data.data);
            this.troopsGot = true;
        }
        else {
            throw new Error(data.data);
        }
    }

    private updateTroops(troops : GameTroopTransferObject[]) {
        let troopsById : GameTroopTransferObject[] = [];

        for (let troop of troops){
            troopsById[troop.troop] = troop
        }

        for (let troop of this.game.playerTroops){
            GameController.updateTroop(troop, troopsById[troop.troop.id]);
        }
        for (let troop of this.game.opponentTroops){
            GameController.updateTroop(troop, troopsById[troop.troop.id]);
        }
        this.game.setRenderDirty();
    }

    private static updateTroop(dst: GameTroop, src: GameTroopTransferObject) {
        dst.x = src.x;
        dst.y = src.y;
        dst.hp = src.hp;
    }

    public disconnect(reason : string) : void {
        this.networking.sendDisconnect(reason);
    }

    public update() {
        if (!this.joinSent){
            let joinResponse = this.join();
            if (joinResponse != null){
                this.joinSent = true;
            }
        }
        if (!this.troopsGetSent){
            let sendResponse = this.getTroops();
            if (sendResponse != null){
                this.troopsGetSent = true;
            }
        }
        if (this.joined && this.troopsGot){
            this.updateInGame();
        }
    }

    private updateInGame() {
        //console.log("technically in game")
    }

    public render() {
    }
}

