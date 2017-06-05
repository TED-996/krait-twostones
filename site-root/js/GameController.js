var GameController = (function () {
    function GameController(game) {
        this.game = game;
        this.networking = game.networking;
        this.joined = false;
        this.networking.onMessage = this.onServerMessage.bind(this);
        this.inTurn = false;
        this.messageHandlersByType = {
            "your_turn": this.onYourTurn.bind(this),
            "get_matchtroops": this.onGetTroops.bind(this)
        };
    }
    GameController.prototype.onServerMessage = function (msg) {
        this.messageHandlersByType[msg.type](msg.data);
    };
    GameController.prototype.join = function () {
        var result = this.networking.sendJoin();
        if (result == null) {
            return null;
        }
        result.setOnComplete(this.onJoin.bind(this));
        return result;
    };
    GameController.prototype.onJoin = function (data) {
        this.joined = true;
        this.inTurn = data.data.in_turn;
        this.game.updateEndTurn(this.inTurn);
    };
    GameController.prototype.initGetTroops = function () {
        var result = this.networking.sendGetTroops();
        if (result == null) {
            return null;
        }
        result.setOnComplete(this.onInitGetTroops.bind(this));
        return result;
    };
    GameController.prototype.onInitGetTroops = function (data) {
        if (data.type != "error") {
            this.updateTroops(data.data);
            this.troopsGot = true;
            this.onTroopsInitialPlace();
        }
        else {
            throw new Error(data.data);
        }
    };
    GameController.prototype.demandGetTroops = function () {
        var result = this.networking.sendGetTroops();
        if (result == null) {
            return null;
        }
        result.setOnComplete(this.onInitGetTroops.bind(this));
        return result;
    };
    GameController.prototype.onDemandGetTroops = function (data) {
        if (data.type != "error") {
            this.updateTroops(data.data);
            this.troopsGot = true;
        }
        else {
            throw new Error(data.data);
        }
    };
    GameController.prototype.onGetTroops = function (data) {
        this.updateTroops(data);
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
        this.game.setRenderDirty();
    };
    GameController.updateTroop = function (dst, src) {
        dst.x = src.x;
        dst.y = src.y;
        dst.hp = src.hp;
    };
    GameController.prototype.onTroopsInitialPlace = function () {
        for (var _i = 0, _a = this.game.playerTroops; _i < _a.length; _i++) {
            var troop = _a[_i];
            troop.onInitialPlace();
        }
        for (var _b = 0, _c = this.game.opponentTroops; _b < _c.length; _b++) {
            var troop = _c[_b];
            troop.onInitialPlace();
        }
    };
    GameController.prototype.disconnect = function (reason) {
        this.networking.sendDisconnect(reason);
    };
    GameController.prototype.sendEndTurn = function () {
        if (!this.inTurn) {
            return;
        }
        var result = this.networking.sendEndTurn();
        if (result == null) {
            return null;
        }
        result.setOnComplete(this.onEndTurnComplete.bind(this));
    };
    GameController.prototype.onEndTurnComplete = function (data) {
        if (data.type != "error") {
            this.game.updateEndTurn(false);
            this.inTurn = false;
        }
        else {
            this.inTurn = true;
        }
    };
    GameController.prototype.onYourTurn = function () {
        this.game.updateEndTurn(true);
        this.inTurn = true;
    };
    GameController.prototype.update = function () {
        if (!this.joinSent) {
            var joinResponse = this.join();
            if (joinResponse != null) {
                this.joinSent = true;
            }
        }
        if (!this.troopsGetSent) {
            var sendResponse = this.initGetTroops();
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
