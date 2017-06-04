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
    GameController.prototype.onGetTroops = function (data) {
        if (data.type != "error") {
            this.updateTroops(data.data);
            this.troopsGot = true;
        }
        else {
            throw new Error(data.data);
        }
    };
    GameController.prototype.updateTroops = function (troops) {
        var troopsById = [];
        for (var _i = 0, troops_1 = troops; _i < troops_1.length; _i++) {
            var troop = troops_1[_i];
            troopsById[troop.troop] = troop;
        }
        for (var _a = 0, _b = this.game.playerTroops; _a < _b.length; _a++) {
            var troop = _b[_a];
            GameController.updateTroop(troop, troopsById[troop.troop.id]);
        }
        for (var _c = 0, _d = this.game.opponentTroops; _c < _d.length; _c++) {
            var troop = _d[_c];
            GameController.updateTroop(troop, troopsById[troop.troop.id]);
        }
    };
    GameController.updateTroop = function (dst, src) {
        dst.x = src.x;
        dst.y = src.y;
        dst.hp = src.hp;
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
        if (!this.troopsGetSent) {
            var sendResponse = this.getTroops();
            if (sendResponse != null) {
                this.troopsGetSent = true;
            }
        }
        if (this.joined && this.troopsGot) {
            this.updateInGame();
        }
    };
    GameController.prototype.updateInGame = function () {
        //console.log("technically in game")
    };
    GameController.prototype.render = function () {
    };
    return GameController;
}());
