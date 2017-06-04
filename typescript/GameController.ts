class GameController {
    private game : WegasGame;
    private networking : WegasNetworking;

    private joined : boolean;
    private joinSent : boolean;

    constructor(game: WegasGame) {
        this.game = game;
        this.networking = new WegasNetworking();
        this.joined = false;
    }

    public join() : WebsocketResponseWaitItem {
        let self = this;
        let result = this.networking.sendJoin();
        if (result == null){
            return null;
        }

        result.setOnComplete(() => self.onJoin());

        return result
    }

    private onJoin() {
        this.joined = true;
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
        if (this.joined){
            this.updateInGame();
        }
    }

    private updateInGame() {
        console.log("in game!");
    }

    public render() {
    }
}
