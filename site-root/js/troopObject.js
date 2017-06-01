
/// <reference path= "ajax_raw.ts" />
/// <reference path = "node_modules/@type/phaser/phaser.d.ts"/>
/// <reference path = "Map.js"/>

var TroopStats = (function () {
    function TroopStats(id, name, description, maxHp, atkRange, moveRange, minLevel) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.maxHp = maxHp;
        this.atkRange = atkRange;
        this.moveRange = moveRange;
        this.minLevel = minLevel;
    }
    return TroopStats;
})

var Troop = (function () {
    function Troop(Tile, TroopStats){
        this.Tile = Tile;
        this.TroopStats = TroopStats;
    }

    Troop.prototype.getTile() = function() {
        this.Tile.zIndex = 1;
        return this.Tile;
    };

    return Troop;
}) 