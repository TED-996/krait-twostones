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
        result.setOnComplete(() => self.onJoin());

        this.joinSent = true;
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
            this.join();
        }
        if (this.joined){
            this.updateInGame();
        }
    }

    private updateInGame() {
        
    }

    public render() {
    }
}
