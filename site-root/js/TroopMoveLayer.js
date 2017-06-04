var TroopMoveLayer = (function () {
    function TroopMoveLayer() {
        this.tiles = [];
    }
    TroopMoveLayer.prototype.buildTiles = function (map, troop) {
        this.tiles = [];
        var x = troop.x;
        var y = troop.y;
        this.addTiles({ x: x, y: y }, map, troop.troop.moveRange);
    };
    TroopMoveLayer.prototype.addTiles = function (coord, map, range) {
        if (range <= 0) {
            return;
        }
        var queue = [{ c: coord, d: 0 }];
        var qS = 0;
        var qE = 1;
        var visited = [];
        visited[coord.y * map.width + coord.x] = true;
        while (qS < qE) {
            var current = queue[qS].c;
            var currentDist = queue[qS].d;
            qS++;
            if (currentDist != 0) {
                this.addTile(current);
            }
            if (currentDist < range) {
                for (var _i = 0, _a = Tile.getNeighbours(current).filter(function (c) { return map.isAccessible(c); }); _i < _a.length; _i++) {
                    var next = _a[_i];
                    var idx = next.y * map.width + next.x;
                    if (!visited[idx]) {
                        visited[idx] = true;
                        queue[qE++] = { c: next, d: currentDist + 1 };
                    }
                }
            }
        }
    };
    TroopMoveLayer.prototype.addTile = function (coord) {
        this.tiles.push(new Tile(coord.x, coord.y, 12, 5));
    };
    TroopMoveLayer.prototype.clear = function () {
        this.tiles = [];
    };
    TroopMoveLayer.prototype.getTiles = function () {
        return this.tiles;
    };
    return TroopMoveLayer;
}());
