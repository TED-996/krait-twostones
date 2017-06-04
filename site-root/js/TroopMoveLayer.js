var TroopMoveLayer = (function () {
    function TroopMoveLayer() {
        this.tiles = [];
    }
    TroopMoveLayer.prototype.buildTiles = function (map, troop, onClick) {
        this.tiles = [];
        var x = troop.x;
        var y = troop.y;
        this.addTiles({ x: x, y: y }, map, troop.troop.moveRange, onClick);
    };
    TroopMoveLayer.prototype.addTiles = function (coord, map, range, onClick) {
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
                this.addTile(current, onClick);
            }
            if (currentDist < range) {
                for (var _i = 0, _a = Tile.getNeighbours(current); _i < _a.length; _i++) {
                    var next = _a[_i];
                    if (map.isAccessible(next)) {
                        var idx = next.y * map.width + next.x;
                        if (!visited[idx]) {
                            visited[idx] = true;
                            queue[qE++] = { c: next, d: currentDist + 1 };
                        }
                    }
                }
            }
        }
    };
    TroopMoveLayer.prototype.addTile = function (coord, onClick) {
        var tile = new Tile(coord.x, coord.y, 12, 5);
        tile.onClick = function () { return onClick(coord); };
        this.tiles.push(tile);
    };
    TroopMoveLayer.prototype.clear = function () {
        this.tiles = [];
    };
    TroopMoveLayer.prototype.getTiles = function () {
        return this.tiles;
    };
    return TroopMoveLayer;
}());
