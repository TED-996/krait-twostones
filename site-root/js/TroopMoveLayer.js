var TroopMoveLayer = (function () {
    function TroopMoveLayer() {
        this.tiles = [];
    }
    TroopMoveLayer.prototype.buildTiles = function (map, troop) {
        this.tiles = [];
        var x = troop.x;
        var y = troop.y;
        this.visited = [];
        this.visited[y * map.width + x] = true;
        this.addTiles({ x: x, y: y }, map, troop.troop.moveRange);
    };
    TroopMoveLayer.prototype.addTiles = function (coord, map, range) {
        if (range <= 0) {
            return;
        }
        for (var _i = 0, _a = Tile.getNeighbours(coord).filter(function (c) { return map.isAccessible(c); }); _i < _a.length; _i++) {
            coord = _a[_i];
            var idx = coord.y * map.width + coord.x;
            if (!this.visited[idx]) {
                this.visited[idx] = true;
                this.addTile(coord);
                this.addTiles(coord, map, range - 1);
            }
        }
    };
    TroopMoveLayer.prototype.addTile = function (coord) {
        this.tiles.push(new Tile(coord.x, coord.y, 12, 5));
    };
    TroopMoveLayer.prototype.getTiles = function () {
        return this.tiles;
    };
    return TroopMoveLayer;
}());
