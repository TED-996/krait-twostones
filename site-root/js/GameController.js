var GameController = (function () {
    function GameController(game) {
        this.game = game;
        this.networking = new WegasNetworking();
        this.joined = false;
    }
    GameController.prototype.join = function () {
        var result = this.networking.sendJoin();
        if (result == null) {
            return null;
        }
        result.setOnComplete(this.onJoin.bind(this));
        return result;
    };
    GameController.prototype.onJoin = function () {
        this.joined = true;
    };
    GameController.prototype.getTroops = function () {
        var result = this.networking.sendGetTroops();
        if (result == null) {
            return null;
        }
        result.setOnComplete(this.onGetTroops.bind(this));
        return result;
    };
    GameController.prototype.onGetTroops = function (troops) {
        this.troopsGot = true;
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
    };
    GameController.prototype.render = function () {
    };
    return GameController;
}());
