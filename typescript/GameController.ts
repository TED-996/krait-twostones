///<reference path="Networking.ts"/>
///<reference path="Flags.ts"/>
class GameController {
    private game : WegasGame;
    private networking : WegasNetworking;

    private joined : boolean;
    private joinSent : boolean;

    private troopsGot : boolean;
    private troopsGetSent : boolean;

    private flagsGot : boolean;
    private flagsGetSent : boolean;

    private scoreGot : boolean;
    private scoreGetSent : boolean;

    public inTurn : boolean;

    private messageHandlersByType : {[key: string] : (data? : any) => void};

    constructor(game: WegasGame) {
        this.game = game;
        this.networking = game.networking;
        this.networking.onMessage = this.onServerMessage.bind(this);

        this.inTurn = false;

        this.joined = false;
        this.troopsGot = false;
        this.flagsGot = false;
        this.scoreGot = false;

        this.joinSent = false;
        this.troopsGetSent = false;
        this.flagsGetSent = false;
        this.scoreGetSent = false;

        this.messageHandlersByType = {
            "your_turn": this.onYourTurn.bind(this),
            "get_matchtroops": this.onGetTroops.bind(this),
            "get_flags": this.onGetFlags.bind(this),
            "get_score": this.onGetScore.bind(this),
            "end_game": this.onEndGame.bind(this)
        };
    }

    public onServerMessage(msg : NetworkingMessage){
        this.messageHandlersByType[msg.type](msg.data);
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

    public initGetTroops() : WebsocketResponseWaitItem {
        let result = this.networking.sendGetTroops();
        if (result == null){
            return null;
        }

        result.setOnComplete(this.onInitGetTroops.bind(this));

        return result;
    }

    private onInitGetTroops(data : any) {
        if (data.type != "error") {
            this.updateTroops(data.data);
            this.troopsGot = true;

            this.onTroopsInitialPlace();
        }
        else {
            throw new Error(data.data);
        }
    }

    private demandGetTroops() : WebsocketResponseWaitItem {
        let result = this.networking.sendGetTroops();
        if (result == null){
            return null;
        }

        result.setOnComplete(this.onInitGetTroops.bind(this));

        return result;
    }

    private onDemandGetTroops(data : NetworkingMessage) {
        if (data.type != "error") {
            this.updateTroops(data.data);
            this.troopsGot = true;
        }
        else {
            throw new Error(data.data);
        }
    }

    private onGetTroops(data : any) {
        this.updateTroops(data);
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

    private initUpdateFlags() : WebsocketResponseWaitItem {
        let result = this.networking.sendGetFlags();
        if (result == null){
            return null;
        }

        result.setOnComplete(this.onInitUpdateFlags.bind(this));

        return result;
    }

    private onInitUpdateFlags(data : NetworkingMessage){
        if (data.type == "error"){
            throw new Error(data.data);
        }

        this.game.flags.update(data.data);
        this.game.setRenderDirty();
    }

    private onGetFlags(data : FlagTransportObject[]){
        this.game.flags.update(data);
        this.game.setRenderDirty();
    }

    private initGetScore() : WebsocketResponseWaitItem {
        let result = this.networking.sendGetScore();
        if (result == null){
            return null;
        }

        result.setOnComplete(this.onInitGetScore.bind(this));

        return result;
    }

    private onInitGetScore(data){
        if (data.type == "error"){
            throw new Error(data.data);
        }
        else{
            this.onGetScore(data.data);
        }
    }

    private onGetScore(data : {mine: number, theirs: number}) {
        this.game.scoreLabel.setText(String(data["mine"])+" : "+ String(data["theirs"]))
    }

    private onTroopsInitialPlace() {
        for (let troop of this.game.playerTroops){
            troop.onInitialPlace();
        }
        for (let troop of this.game.opponentTroops){
            troop.onInitialPlace();
        }

        this.game.onInitialPlace();
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
            this.inTurn = false;
        }
        else{
            this.inTurn = true;
        }
    }

    public onEndGame(data : any) {
        this.game.onEndGame();
    }

    public onYourTurn(){
        this.game.updateEndTurn(true);
        this.inTurn = true;
    }

    public update() {
        if (!this.joinSent){
            let joinResponse = this.join();
            if (joinResponse != null){
                this.joinSent = true;
            }
        }
        if (!this.troopsGetSent){
            let sendResponse = this.initGetTroops();
            if (sendResponse != null){
                this.troopsGetSent = true;
            }
        }
        if (!this.flagsGetSent){
            let sendResponse = this.initUpdateFlags();
            if (sendResponse != null){
                this.flagsGetSent = true;
            }
        }
        if (!this.scoreGetSent){
            let sendResponse = this.initGetScore();
            if (sendResponse != null){
                this.scoreGetSent = true;
            }
        }

        if (this.joined && this.troopsGot && this.flagsGot){
            this.updateInGame();
        }
    }

    private updateInGame() {
        //console.log("technically in game")
    }

    public render() {
    }
}

