var GameController = (function () {
    function GameController(game) {
        this.game = game;
        this.networking = new WegasNetworking();
        this.joined = false;
    }
    GameController.prototype.join = function () {
        var self = this;
        var result = this.networking.sendJoin();
        if (result == null) {
            return null;
        }
        result.setOnComplete(function () { return self.onJoin(); });
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
            var joinResponse = this.join();
            if (joinResponse != null) {
                this.joinSent = true;
            }
        }
        if (this.joined) {
            this.updateInGame();
        }
    };
    GameController.prototype.updateInGame = function () {
        console.log("in game!");
    };
    GameController.prototype.render = function () {
    };
    return GameController;
}());
