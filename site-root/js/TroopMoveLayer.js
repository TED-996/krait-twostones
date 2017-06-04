var TroopMoveLayer = (function () {
    function TroopMoveLayer() {
        this.tiles = [];
    }
    TroopMoveLayer.prototype.buildTiles = function (map, troop) {
        this.tiles = [];
        var x = troop.x;
        var y = troop.y;
    };
    TroopMoveLayer.prototype.getTiles = function () {
        return this.tiles;
    };
    return TroopMoveLayer;
}());
