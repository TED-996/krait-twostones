class GameController {
    private game : WegasGame;
    private networking : WegasNetworking;

    private joined : boolean;
    private joinSent : boolean;

    private troopsGot : boolean;
    private troopsGetSent : boolean;

    public inTurn : boolean;


    constructor(game: WegasGame) {
        this.game = game;
        this.networking = game.networking;
        this.joined = false;

        this.networking.onMessage = this.onServerMessage.bind(this);

        this.inTurn = false;
    }

    public onServerMessage(msg : NetworkingMessage){

    }

    public join() : WebsocketResponseWaitItem {
        let result = this.networking.sendJoin();
        if (result == null){
            return null;
        }

        result.setOnComplete(this.onJoin.bind(this));

        return result
    }

    private onJoin(data : NetworkingMessage) {
        this.joined = true;
        this.inTurn = data.data.in_turn;
        this.game.updateEndTurn(this.inTurn);
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

            this.onTroopsInitialPlace();
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

    private onTroopsInitialPlace() {
        for (let troop of this.game.playerTroops){
            troop.onInitialPlace();
        }
        for (let troop of this.game.opponentTroops){
            troop.onInitialPlace();
        }
    }

    public disconnect(reason : string) : void {
        this.networking.sendDisconnect(reason);
    }

    public sendEndTurn() {
        if (!this.inTurn){
            return;
        }

        let result = this.networking.sendEndTurn();
        if (result == null){
            return null;
        }

        result.setOnComplete(this.onEndTurnComplete.bind(this));
    }

    public onEndTurnComplete(data : NetworkingMessage){
        if (data.type != "error"){
            this.game.updateEndTurn(false);
        }
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

