var GameController = (function () {
    function GameController(game) {
        this.game = game;
        this.networking = new WegasNetworking();
    }
    GameController.prototype.join = function () {
        var self = this;
        var result = this.networking.sendJoin();
        result.setOnComplete(function () { return self.onJoin(); }); //TODO: wait for approval
        return result;
    };
    GameController.prototype.onJoin = function () {
    };
    return GameController;
}());
