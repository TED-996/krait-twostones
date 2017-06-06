var TroopAttackLayer = (function () {
    function TroopAttackLayer(game) {
        this.tiles = [];
        this.game = game;
    }
    TroopAttackLayer.prototype.buildTiles = function (map, troop, onClick) {
        this.tiles = [];
        var x = troop.x;
        var y = troop.y;
        this.addTiles({ x: x, y: y }, map, troop.troop.atkRange, onClick);
    };
    TroopAttackLayer.prototype.addTiles = function (coord, map, range, onClick) {
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
            if (this.isEnemy(current)) {
                this.addTile(current, true, onClick);
            }
            else if (currentDist != 0 && map.isAccessible(current)) {
                this.addTile(current, false, null);
            }
            if (currentDist < range) {
                for (var _i = 0, _a = Tile.getNeighbours(current); _i < _a.length; _i++) {
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
    TroopAttackLayer.prototype.isEnemy = function (coord) {
        var troop = this.game.loadedTroops.getByPosition(coord.x, coord.y);
        return troop != null && troop.isEnemy;
    };
    TroopAttackLayer.prototype.addTile = function (coord, isActive, onClick) {
        var tileIdx = isActive ? 12 + 3 * 16 : 12 + 7 * 16;
        var tile = new Tile(coord.x, coord.y, tileIdx, 6);
        if (onClick != null) {
            tile.onClick = function () { return onClick(coord); };
        }
        this.tiles.push(tile);
    };
    TroopAttackLayer.prototype.clear = function () {
        this.tiles = [];
    };
    TroopAttackLayer.prototype.getTiles = function () {
        return this.tiles;
    };
    return TroopAttackLayer;
}());
