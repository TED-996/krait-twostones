class GameController {
    private game : WegasGame;
    private networking : WegasNetworking;
    private joined : boolean;

    constructor(game: WegasGame) {
        this.game = game;
        this.networking = new WegasNetworking();
        this.joined = false;
    }

    public join() : WebsocketResponseWaitItem {
        let self = this;
        let result = this.networking.sendJoin();
        result.setOnComplete(() => self.onJoin()); //TODO: wait for approval
        return result
    }

    private onJoin() {
        this.joined = true;
    }
}
