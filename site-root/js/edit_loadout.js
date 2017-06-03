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
