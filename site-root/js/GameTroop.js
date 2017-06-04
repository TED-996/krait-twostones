var GameTroop = (function () {
    function GameTroop(troop, game, networking, x, y, isEnemy, hp) {
        if (hp === void 0) { hp = null; }
        this.troop = troop;
        this.troop.recompute();
        this.x = x;
        this.y = y;
        this.isEnemy = isEnemy;
        this.game = game;
        if (hp != null) {
            this.hp = hp;
        }
        else {
            this.hp = troop.maxHp;
        }
    }
    GameTroop.prototype.onTroopClick = function () {
        this.game.onTroopClick(this);
    };
    GameTroop.prototype.getTile = function () {
        var tileIndex;
        if (this.isEnemy) {
            tileIndex = 13;
        }
        else {
            tileIndex = 14;
        }
        var result = new Tile(this.x, this.y, tileIndex, 10);
        result.onClick = this.onTroopClick.bind(this);
        return result;
    };
    GameTroop.prototype.deactivate = function () {
        //this.move(this.x - 1, this.y);
    };
    GameTroop.prototype.activate = function () {
        //this.move(this.x + 1, this.y);
        this.spawn_range(this.game.map, this.troop.moveRange);
    };
    GameTroop.prototype.move = function (x, y) {
        var from = { x: this.x, y: this.y };
        var to = { x: x, y: y };
        var responseWait = this.game.networking.sendMove(from, to);
        if (responseWait != null) {
            this.x = x;
            this.y = y;
            this.game.setRenderDirty();
            var self_1 = this;
            responseWait.setOnComplete(function (data) { return self_1.onMoveResponse(data, from, to); });
        }
    };
    GameTroop.prototype.onMoveResponse = function (data, from, to) {
        if (data.type != "ok") {
            this.x = from.x;
            this.y = from.y;
            this.game.setRenderDirty();
        }
    };
    return GameTroop;
}());
var GameTroopManager = (function () {
    function GameTroopManager(troops) {
        this.troops = troops;
    }
    GameTroopManager.prototype.getTiles = function () {
        return this.troops.map(function (t) { return t.getTile(); });
    };
    return GameTroopManager;
}());
