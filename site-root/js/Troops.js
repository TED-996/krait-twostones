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
            var result = new TroopClass(obj.name, obj.description, obj.maxHp, obj.dmg, obj.atkRange, obj.moveRange);
            TroopClass.classDb[name] = result;
            return result;
        }
    };
    return TroopClass;
}());
TroopClass.classDb = {};
var Modifier = (function () {
    function Modifier(id, name, maxHp, dmg, atkRange, moveRange) {
        this.id = id;
        this.name = name;
        this.maxHpMod = maxHp;
        this.dmgMod = dmg;
        this.atkRangeMod = atkRange;
        this.moveRangeMod = moveRange;
        this.stats = statsToStrings(maxHp, dmg, atkRange, moveRange);
        this.description = this.name + ": " + this.stats.join(", ");
    }
    Modifier.fromObj = function (obj) {
        if (obj === null) {
            return null;
        }
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
    return Modifier;
}());
Modifier.modifierDb = {};
var Skin = (function () {
    function Skin(filename) {
        this.filename = filename;
        this.name = this.filename;
        this.description = "";
        this.stats = [];
    }
    Skin.fromObj = function (obj) {
        return new Skin(obj);
    };
    return Skin;
}());
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
        this.onRecomputeHandlers = [];
        this.recompute();
    }
    Troop.prototype.addOnRecompute = function (handler) {
        this.onRecomputeHandlers.push(handler);
    };
    Troop.prototype.recompute = function () {
        var _this = this;
        this.maxHp = Math.max(this.recompute_one(this.troopClass.baseHp, function (mod) {
            return mod.maxHpMod;
        }), 1);
        this.dmg = this.recompute_one(this.troopClass.baseDmg, function (mod) {
            return mod.dmgMod;
        });
        this.atkRange = this.recompute_one(this.troopClass.baseAtkRange, function (mod) {
            return mod.atkRangeMod;
        });
        this.moveRange = this.recompute_one(this.troopClass.baseMoveRange, function (mod) {
            return mod.moveRangeMod;
        });
        this.onRecomputeHandlers.forEach(function (h) { return h(_this); });
    };
    Troop.prototype.recompute_one = function (base, extract_func) {
        var mul_percent = 100;
        for (var _i = 0, _a = this.modifiers; _i < _a.length; _i++) {
            var mod = _a[_i];
            if (mod != null) {
                mul_percent += extract_func(mod);
            }
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
    Troop.prototype.toTransferObject = function () {
        return {
            id: this.id,
            skin: this.skin.filename || "Tank",
            className: this.troopClass.name,
            description: this.troopClass.description,
            hp: this.maxHp,
            dmg: this.dmg,
            aRange: this.atkRange,
            mRange: this.moveRange,
            modifiers: this.modifiers.map(function (m) {
                if (m == null) {
                    return null;
                }
                else {
                    return m.id;
                }
            })
        };
    };
    return Troop;
}());
var Loadout = (function () {
    function Loadout(id, owner, troops) {
        this.id = id;
        this.owner = owner;
        this.troops = troops;
    }
    Loadout.fromObj = function (obj) {
        return new Loadout(obj.loadoutId, obj.owner, obj.troops.map(Troop.fromObj));
    };
    Loadout.prototype.toTransferObject = function () {
        return {
            owner: this.owner,
            loadoutId: this.id,
            troops: this.troops.map(function (t) { return t.toTransferObject(); })
        };
    };
    return Loadout;
}());
var AllOptions = (function () {
    function AllOptions(troopClassOptions, modifierOptions, skinOptions) {
        this.troopClassOptions = troopClassOptions;
        this.modifierOptions = modifierOptions;
        this.skinOptions = skinOptions;
    }
    AllOptions.fromObj = function (obj) {
        return new AllOptions(obj.troopClasses.map(TroopClass.fromObj), obj.modifiers.map(Modifier.fromObj), obj.skins.map(Skin.fromObj));
    };
    AllOptions.loadAjax = function () {
        return AllOptions.fromObj(JSON.parse(ajax_raw_sync("/get_options")));
    };
    return AllOptions;
}());
