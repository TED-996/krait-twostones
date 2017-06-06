var Flag = (function () {
    function Flag(isOwn, x, y, carryingTroop) {
        this.isOwn = isOwn;
        this.x = x;
        this.y = y;
        this.carryingTroop = carryingTroop;
    }
    Flag.prototype.getTile = function () {
        var tileIdx;
        if (this.isOwn) {
            tileIdx = 28;
        }
        else {
            tileIdx = 44;
        }
        if (this.carryingTroop != null) {
            this.x = this.carryingTroop.x;
            this.y = this.carryingTroop.y;
            tileIdx += 4 * 16;
        }
        return new Tile(this.x, this.y, tileIdx, 8);
    };
    return Flag;
}());
var FlagManager = (function () {
    function FlagManager(game) {
        this.ownFlag = new Flag(true, -1, -2, null);
        this.opponentFlag = new Flag(false, -1, -2, null);
        this.game = game;
    }
    FlagManager.prototype.update = function (data) {
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var flag = data_1[_i];
            if (flag.is_own) {
                this.updateFlag(this.ownFlag, flag);
            }
            else {
                this.updateFlag(this.opponentFlag, flag);
            }
        }
    };
    FlagManager.prototype.updateFlag = function (dst, src) {
        dst.x = src.x;
        dst.y = src.y;
        dst.isOwn = src.is_own;
        if (src.carrying_troop != null) {
            dst.carryingTroop = this.game.loadedTroops.getById(src.carrying_troop);
        }
        else {
            dst.carryingTroop = null;
        }
    };
    FlagManager.prototype.getTiles = function () {
        return [this.ownFlag.getTile(), this.opponentFlag.getTile()];
    };
    return FlagManager;
}());
