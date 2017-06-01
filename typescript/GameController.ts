class GameController {
    private game : WegasGame;
    private networking : WegasNetworking;

    constructor(game: WegasGame) {
        this.game = game;
        this.networking = new WegasNetworking();
    }

    public join() : WebsocketResponseWaitItem {
        let self = this;
        let result = this.networking.sendJoin()
        result.setOnComplete(() => self.onJoin()); //TODO: wait for approval
        return result
    }

    private onJoin() {

    }
}
