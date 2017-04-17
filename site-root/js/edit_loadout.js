var jquery_1 = require("jquery");
function statsToStrings(maxHp, dmg, atkRange, moveRange) {
    return ["HP: " + maxHp, "DMG: " + dmg, "Atk Range: " + atkRange, "Move Range: " + moveRange];
}
var TroopClass = (function () {
    function TroopClass(name, description, baseHp, baseDmg, baseAtkRange, baseMoveRange) {
        this.name = name;
        this.description = description;
        this.baseHp = baseHp;
        this.baseDmg = baseDmg;
        this.baseAtkRange = baseAtkRange;
        this.baseMoveRange = baseMoveRange;
        this.stats = statsToStrings(baseHp, baseDmg, baseAtkRange, baseMoveRange);
    }
    TroopClass.fromObj = function (obj) {
        var name = obj.name;
        if (TroopClass.classDb[name]) {
            return TroopClass.classDb[name];
        }
        else {
            var result = new TroopClass(obj.name, obj.description, obj.hp, obj.dmg, obj.aRange, obj.mRange);
            TroopClass.classDb[name] = result;
            return result;
        }
    };
    TroopClass.classDb = {};
    return TroopClass;
})();
var Modifier = (function () {
    function Modifier(id, name, maxHp, dmg, atkRange, moveRange) {
        this.id = id;
        this.name = name;
        this.maxHpMod = maxHp;
        this.dmgMod = dmg;
        this.atkRangeMod = atkRange;
        this.moveRangeMod = moveRange;
        this.stats = statsToStrings(maxHp, dmg, atkRange, moveRange);
    }
    Modifier.fromObj = function (obj) {
        var id = obj.id;
        if (Modifier.modifierDb[id]) {
            return Modifier.modifierDb[id];
        }
        else {
            var result = new Modifier(obj.id, obj.name, obj.maxHp, obj.dmg, obj.atkRange, obj.moveRange);
            Modifier.modifierDb[id] = result;
            return result;
        }
    };
    Modifier.modifierDb = {};
    return Modifier;
})();
var Skin = (function () {
    function Skin(filename) {
        this.filename = filename;
        this.name = this.filename;
        this.description = "";
        this.stats = [];
    }
    return Skin;
})();
var Troop = (function () {
    function Troop(id, troopClass, skin, modifiers, maxHp, dmg, atkRange, moveRange) {
        this.id = id;
        this.troopClass = troopClass;
        this.skin = skin;
        this.modifiers = modifiers;
        this.maxHp = maxHp;
        this.dmg = dmg;
        this.atkRange = atkRange;
        this.moveRange = moveRange;
    }
    Troop.prototype.recompute = function () {
        this.maxHp = Math.max(this.recompute_one(this.troopClass.baseHp, function (mod) { return mod.maxHpMod; }), 1);
        this.dmg = this.recompute_one(this.troopClass.baseDmg, function (mod) { return mod.dmgMod; });
        this.atkRange = this.recompute_one(this.troopClass.baseAtkRange, function (mod) { return mod.atkRangeMod; });
        this.moveRange = this.recompute_one(this.troopClass.baseMoveRange, function (mod) { return mod.moveRangeMod; });
    };
    Troop.prototype.recompute_one = function (base, extract_func) {
        var mul_percent = 100;
        for (var _i = 0, _a = this.modifiers; _i < _a.length; _i++) {
            var mod = _a[_i];
            mul_percent += extract_func(mod);
        }
        return Math.max(Math.round(base * mul_percent / 100), 0);
    };
    Troop.fromObj = function (obj) {
        var className = obj.className;
        var troopClass = TroopClass.classDb[className];
        var modifierIds = obj.modifiers;
        var modifiers = modifierIds.map(function (id) {
            return Modifier.modifierDb[id];
        });
        return new Troop(obj.id, troopClass, obj.skin, modifiers, obj.maxHp, obj.dmg, obj.atkRange, obj.moveRange);
    };
    return Troop;
})();
var Loadout = (function () {
    function Loadout(id, owner, troops) {
        this.id = id;
        this.owner = owner;
        this.troops = troops;
    }
    Loadout.fromObj = function (obj) {
        return new Loadout(obj.id, obj.owner, obj.troops.map(Troop.fromObj));
    };
    return Loadout;
})();
var AllOptions = (function () {
    function AllOptions(troopClassOptions, modifierOptions, skinOptions) {
        this.troopClassOptions = troopClassOptions;
        this.modifierOptions = modifierOptions;
        this.skinOptions = skinOptions;
    }
    AllOptions.fromObj = function (obj) {
        return new AllOptions(TroopClassOptions.fromObj(obj.troopClasses), //TOOD: use map
        ModifierOptions.fromObj(obj.modifiers), SkinOptions.fromObj(obj.skins) //TOOD: implement formObj on skin
        );
    };
    return AllOptions;
})();
var options = AllOptions.fromObj(JSON.parse(jquery_1["default"]("#available-json").html()));
var loadout = Loadout.fromObj(JSON.parse(jquery_1["default"]("#loadout-json").html()));
var ClassSlot = (function () {
    function ClassSlot() {
    }
    ClassSlot.prototype.getOptions = function () {
        return options.troopClassOptions;
    };
    return ClassSlot;
})();
//# sourceMappingURL=edit_loadout.js.map