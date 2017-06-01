var GameController = (function () {
    function GameController(game) {
        this.game = game;
        this.networking = new WegasNetworking();
        this.joined = false;
    }
    GameController.prototype.join = function () {
        var self = this;
        var result = this.networking.sendJoin();
        result.setOnComplete(function () { return self.onJoin(); });
        this.joinSent = true;
        return result;
    };
    GameController.prototype.onJoin = function () {
        this.joined = true;
    };
    GameController.prototype.disconnect = function (reason) {
        this.networking.sendDisconnect(reason);
    };
    GameController.prototype.update = function () {
        if (!this.joinSent) {
            this.join();
        }
        if (this.joined) {
            this.updateInGame();
        }
    };
    GameController.prototype.updateInGame = function () {
    };
    GameController.prototype.render = function () {
    };
    return GameController;
}());
