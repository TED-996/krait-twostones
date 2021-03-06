var GameTroop = (function () {
    function GameTroop(troop, game, x, y, isEnemy, hp) {
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
        this.isMirrored = this.isEnemy;
    }
    GameTroop.prototype.onTroopClick = function () {
        this.game.onTroopClick(this);
    };
    GameTroop.prototype.getTile = function () {
        var tileIndex;
        if (this.isEnemy) {
            tileIndex = GameTroop.enemyTiles[this.troop.troopClass.name];
        }
        else {
            tileIndex = GameTroop.playerTiles[this.troop.troopClass.name];
        }
        var result = new Tile(this.x, this.y, tileIndex, 10, this.isMirrored);
        result.onClick = this.onTroopClick.bind(this);
        return result;
    };
    GameTroop.prototype.onInitialPlace = function () {
        this.isMirrored = (this.x > this.game.map.width / 2);
    };
    GameTroop.prototype.deactivate = function () {
        this.game.troopMoveLayer.clear();
        this.game.troopAttackLayer.clear();
        this.game.setRenderDirty();
    };
    GameTroop.prototype.activate = function () {
        this.game.troopMoveLayer.buildTiles(this.game.map, this, this.onMoveClick.bind(this));
        this.game.troopAttackLayer.buildTiles(this.game.map, this, this.onAttackClick.bind(this));
        this.game.setRenderDirty();
    };
    GameTroop.prototype.onMoveClick = function (to) {
        this.move(to.x, to.y);
        this.game.deactivateTroop();
    };
    GameTroop.prototype.onAttackClick = function (to) {
        this.attack(to.x, to.y);
        this.game.deactivateTroop();
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
    GameTroop.prototype.attack = function (x, y) {
        var from = { x: this.x, y: this.y };
        var to = { x: x, y: y };
        var responseWait = this.game.networking.sendAttack(from, to);
        if (responseWait != null) {
            var self_2 = this;
            responseWait.setOnComplete(function (data) { return self_2.onAttackResponse(data, from, to); });
        }
    };
    //noinspection JSUnusedLocalSymbols
    GameTroop.prototype.onMoveResponse = function (data, from, to) {
        if (data.type != "ok") {
            this.x = from.x;
            this.y = from.y;
            this.game.setRenderDirty();
        }
    };
    //noinspection JSUnusedLocalSymbols
    GameTroop.prototype.onAttackResponse = function (data, from, to) {
    };
    return GameTroop;
}());
GameTroop.playerTiles = {
    "Runner": 15,
    "Infantry": 29,
    "Tank": 30,
    "Archer": 31
};
GameTroop.enemyTiles = {
    "Runner": 61,
    "Infantry": 45,
    "Tank": 46,
    "Archer": 47
};
var GameTroopManager = (function () {
    function GameTroopManager(troops) {
        this.troops = troops;
    }
    GameTroopManager.prototype.getTiles = function () {
        return this.troops.map(function (t) { return t.getTile(); });
    };
    GameTroopManager.prototype.getById = function (id) {
        for (var _i = 0, _a = this.troops; _i < _a.length; _i++) {
            var troop = _a[_i];
            if (troop.troop.id == id) {
                return troop;
            }
        }
        return null;
    };
    GameTroopManager.prototype.getByPosition = function (x, y) {
        for (var _i = 0, _a = this.troops; _i < _a.length; _i++) {
            var troop = _a[_i];
            if (troop.x == x && troop.y == y) {
                return troop;
            }
        }
        return null;
    };
    return GameTroopManager;
}());
