/// <reference path="node_modules/@types/jquery/index.d.ts" />
//import * as $ from "jquery";
function statsToStrings(maxHp, dmg, atkRange, moveRange) {
    return [maxHp + "/" + dmg + "/" + atkRange + "/" + moveRange];
}
function htmlEscape(literals) {
    var placeholders = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        placeholders[_i - 1] = arguments[_i];
    }
    var result = "";
    // interleave the literals with the placeholders
    for (var i = 0; i < placeholders.length; i++) {
        result += literals[i];
        result += placeholders[i]
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    // add the last literal
    result += literals[literals.length - 1];
    return result;
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
        if (obj == null) {
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
    return AllOptions;
}());
var options = null;
var loadout = null;
var ClassSlot = (function () {
    function ClassSlot(troop) {
        this.troop = troop;
    }
    ClassSlot.prototype.getOptions = function () {
        return options.troopClassOptions;
    };
    ClassSlot.prototype.selectOption = function (option) {
        this.troop.troopClass = option;
        this.troop.recompute();
    };
    ClassSlot.prototype.getSelectedOption = function () {
        return this.troop.troopClass;
    };
    return ClassSlot;
}());
var ModifierSlot = (function () {
    function ModifierSlot(troop, modifierIdx) {
        this.troop = troop;
        this.modifierIdx = modifierIdx;
    }
    ModifierSlot.prototype.getOptions = function () {
        return options.modifierOptions.concat([null]);
    };
    ModifierSlot.prototype.selectOption = function (option) {
        var optionAsModifier = option;
        for (var idx in this.troop.modifiers) {
            if (this.troop.modifiers[idx] == optionAsModifier) {
                this.troop.modifiers[idx] = null;
            }
        }
        this.troop.modifiers[this.modifierIdx] = optionAsModifier;
        this.troop.recompute();
    };
    ModifierSlot.prototype.getSelectedOption = function () {
        return this.troop.modifiers[this.modifierIdx];
    };
    return ModifierSlot;
}());
var SkinSlot = (function () {
    function SkinSlot(troop) {
        this.troop = troop;
    }
    SkinSlot.prototype.getOptions = function () {
        return options.skinOptions;
    };
    SkinSlot.prototype.selectOption = function (option) {
        this.troop.skin = option;
    };
    SkinSlot.prototype.getSelectedOption = function () {
        return this.troop.skin;
    };
    return SkinSlot;
}());
var OptionButton = (function () {
    function OptionButton(option, slotManager) {
        this.option = option;
        this.slotManager = slotManager;
        this.domElement = OptionButton.createElement(option);
        var optionButton = this;
        this.domElement.on("click", function () {
            optionButton.slotManager.selectOption(optionButton.option);
        });
    }
    OptionButton.createElement = function (option) {
        var result = $("<li></li>", {
            "class": "option-li btn btn-default col-md-2 col-sm-4 col-xs-6"
        });
        var name = "empty";
        var stats = ["empty"];
        if (option != null) {
            name = option.name;
            stats = option.stats;
        }
        $((_a = ["<p>", "</p>"], _a.raw = ["<p>", "</p>"], htmlEscape(_a, name)), {
            "class": "text-center"
        }).appendTo(result);
        $((_b = ["<p>", "</p>"], _b.raw = ["<p>", "</p>"], htmlEscape(_b, stats.join("; "))), {
            "class": "text-center"
        }).appendTo(result);
        return result;
        var _a, _b;
    };
    OptionButton.prototype.attach = function () {
        this.domElement.appendTo($("#options-div"));
    };
    return OptionButton;
}());
var SlotManager = (function () {
    function SlotManager(slot, slotSelector, troopManager) {
        this.slot = slot;
        this.slotSelector = slotSelector;
        this.troopManager = troopManager;
        var slotManager = this;
        slotSelector.on("click", function () {
            if (slotManager != SlotManager.activeSlotManager) {
                slotManager.activate();
            }
        });
        this.updateDomSlot();
    }
    SlotManager.prototype.activate = function () {
        SlotManager.optionsList.empty();
        this.addOptions();
        SlotManager.activeSlotManager = this;
    };
    SlotManager.prototype.addOptions = function () {
        for (var _i = 0, _a = this.slot.getOptions(); _i < _a.length; _i++) {
            var option = _a[_i];
            var button = new OptionButton(option, this);
            button.attach();
            console.log("Attached button");
            console.log(button);
        }
    };
    SlotManager.prototype.selectOption = function (option) {
        this.slot.selectOption(option);
        this.updateDomSlot();
    };
    SlotManager.prototype.updateDomSlot = function () {
        var domImg = this.slotSelector.find(".item-img");
        domImg.attr("src", "about:blank");
        var name = "empty";
        var stats = "empty";
        if (this.slot.getSelectedOption() != null) {
            name = this.slot.getSelectedOption().name;
            stats = this.slot.getSelectedOption().stats.join(", ");
        }
        var domName = this.slotSelector.find(".item-name");
        domName.html((_a = ["", ""], _a.raw = ["", ""], htmlEscape(_a, name)));
        var domStats = this.slotSelector.find(".item-stats-text");
        domStats.html((_b = ["", ""], _b.raw = ["", ""], htmlEscape(_b, stats)));
        var _a, _b;
    };
    return SlotManager;
}());
SlotManager.optionsList = $("#options-div");
SlotManager.activeSlotManager = null;
var TroopManager = (function () {
    function TroopManager(troop, troopIdx, onUpdate) {
        if (onUpdate === void 0) { onUpdate = null; }
        this.troop = troop;
        this.troopIdx = troopIdx;
        var closureThis = this;
        this.troop.addOnRecompute(function (troop) { return closureThis.updateStats(troop); });
        this.slots = [];
        this.hpStatElem = null;
        this.dmgStatElem = null;
        this.moveRangeStatElem = null;
        this.atkRangeStatElem = null;
        this.onUpdate = onUpdate;
        this.init();
        this.updateStats(this.troop);
    }
    TroopManager.prototype.init = function () {
        var rootId = "#troop-" + this.troopIdx;
        this.slots.push(new SlotManager(new ClassSlot(this.troop), $(rootId + "-class"), this));
        this.slots.push(new SlotManager(new ModifierSlot(this.troop, 0), $(rootId + "-mod1"), this));
        this.slots.push(new SlotManager(new ModifierSlot(this.troop, 1), $(rootId + "-mod2"), this));
        this.slots.push(new SlotManager(new ModifierSlot(this.troop, 2), $(rootId + "-mod3"), this));
        this.hpStatElem = $(rootId + "-hp");
        this.dmgStatElem = $(rootId + "-dmg");
        this.moveRangeStatElem = $(rootId + "-mrange");
        this.atkRangeStatElem = $(rootId + "-arange");
    };
    TroopManager.prototype.updateStats = function (troop) {
        console.log(troop);
        this.hpStatElem.html(troop.maxHp.toString());
        this.dmgStatElem.html(troop.dmg.toString());
        this.moveRangeStatElem.html(troop.moveRange.toString());
        this.atkRangeStatElem.html(troop.atkRange.toString());
        for (var _i = 0, _a = this.slots; _i < _a.length; _i++) {
            var slot = _a[_i];
            slot.updateDomSlot();
        }
        if (this.onUpdate != null) {
            this.onUpdate(this);
        }
    };
    return TroopManager;
}());
function loadoutInit() {
    options = AllOptions.fromObj(JSON.parse(optionsJson));
    loadout = Loadout.fromObj(JSON.parse(loadoutJson));
    var outJsonLocation = $("#out-loadout-json");
    function onUpdate(tm) {
        outJsonLocation.val(JSON.stringify(loadout.toTransferObject()));
    }
    loadout.troops.map(function (val, idx) { return new TroopManager(val, idx, onUpdate); });
}
