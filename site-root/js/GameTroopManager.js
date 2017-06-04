var GameTroop = (function () {
    function GameTroop(troop, x, y, isEnemy, hp) {
        if (hp === void 0) { hp = null; }
        this.troop = troop;
        this.troop.recompute();
        this.x = x;
        this.y = y;
        this.isEnemy = isEnemy;
        if (hp == null) {
            this.hp = troop.maxHp;
        }
        else {
            this.hp = hp;
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
        var result = new Tile(this.x, this.y, tileIndex, 1);
        result.onClick = this.onTroopClick.bind(this);
        return result;
    };
    GameTroop.prototype.deactivate = function () {
        this.x -= 1;
        this.game.setRenderDirty();
    };
    GameTroop.prototype.activate = function () {
        this.x += 1;
        this.game.setRenderDirty();
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
