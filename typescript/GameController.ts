class GameController {
    private game : WegasGame;
    private networking : WegasNetworking;

    private joined : boolean;
    private joinSent : boolean;

    private troopsGot : boolean;
    private troopsGetSet : boolean;


    constructor(game: WegasGame) {
        this.game = game;
        this.networking = new WegasNetworking();
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

    private onGetTroops(troops : any) {
        this.troopsGot = true;
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
        if (this.joined ){
            this.updateInGame();
        }
    }

    private updateInGame() {

    }

    public render() {
    }
}
