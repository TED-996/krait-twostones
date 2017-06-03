/// <reference path="node_modules/@types/jquery/index.d.ts" />
//import * as $ from "jquery";

interface Option {
    name : string;
    description : string;
    stats : string[];
}

function statsToStrings(maxHp:number, dmg:number, atkRange:number, moveRange:number):string[] {
    return [`${maxHp}/${dmg}/${atkRange}/${moveRange}`]
}

function htmlEscape(literals, ...placeholders) {
    let result = "";

    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
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

let options : AllOptions = null;
let loadout : Loadout = null;


interface Slot {
    getOptions() : Option[];
    selectOption(option:Option) : void;
    getSelectedOption() : Option;
}

class ClassSlot implements Slot {
    troop:Troop;

    constructor(troop:Troop) {
        this.troop = troop;
    }

    getOptions():Option[] {
        return options.troopClassOptions;
    }

    selectOption(option:Option) : void {
        this.troop.troopClass = <TroopClass> option;
        this.troop.recompute();
    }

    getSelectedOption(): Option {
        return this.troop.troopClass;
    }
}

class ModifierSlot implements Slot {
    troop:Troop;
    modifierIdx:number;


    constructor(troop:Troop, modifierIdx:number) {
        this.troop = troop;
        this.modifierIdx = modifierIdx;
    }

    getOptions():Option[] {
        return options.modifierOptions.concat([null]);
    }

    selectOption(option:Option) : void {
        let optionAsModifier = <Modifier> option;

        for (let idx in this.troop.modifiers){
            if (this.troop.modifiers[idx] == optionAsModifier){
                this.troop.modifiers[idx] = null;
            }
        }

        this.troop.modifiers[this.modifierIdx] = optionAsModifier;
        this.troop.recompute();
    }

    getSelectedOption(): Option {
        return this.troop.modifiers[this.modifierIdx];
    }

}

class SkinSlot implements Slot {
    troop:Troop;

    constructor(troop:Troop) {
        this.troop = troop;
    }

    getOptions():Option[] {
        return options.skinOptions;
    }

    selectOption(option:Option) : void {
        this.troop.skin = <Skin>option;
    }

    getSelectedOption() : Option {
        return this.troop.skin;
    }
}

class OptionButton {
    option : Option;
    slotManager : SlotManager;
    domElement : JQuery;

    constructor(option: Option, slotManager: SlotManager) {
        this.option = option;
        this.slotManager = slotManager;
        this.domElement = OptionButton.createElement(option);

        let optionButton = this;
        this.domElement.on("click", function(){
            optionButton.slotManager.selectOption(optionButton.option);
        });
    }

    static createElement(option : Option) : JQuery{
        let result = $("<li></li>", {
            "class": "option-li btn btn-default col-md-2 col-sm-4 col-xs-6"
        });
        let name = "empty";
        let stats = ["empty"];

        if (option != null){
            name = option.name;
            stats = option.stats;
        }

        $(htmlEscape `<p>${name}</p>`, {
            "class": "text-center"
        }).appendTo(result);
        $(htmlEscape `<p>${stats.join("; ")}</p>`, {
            "class": "text-center"
        }).appendTo(result);

        return result;
    }

    attach() : void {
        this.domElement.appendTo($("#options-div"))
    }

}


class SlotManager {
    slot:Slot;
    slotSelector : JQuery;
    troopManager: TroopManager;

    static optionsList = $("#options-div");
    static activeSlotManager : SlotManager = null;

    constructor(slot:Slot, slotSelector:JQuery, troopManager: TroopManager) {
        this.slot = slot;
        this.slotSelector = slotSelector;
        this.troopManager = troopManager;

        let slotManager = this;
        slotSelector.on("click", function(){
            if (slotManager != SlotManager.activeSlotManager){
                slotManager.activate()
            }
        });

        this.updateDomSlot();
    }

    activate() : void {
        SlotManager.optionsList.empty();
        this.addOptions();

        SlotManager.activeSlotManager = this;
    }

    addOptions() : void {
        for (let option of this.slot.getOptions()){
            let button = new OptionButton(option, this);
            button.attach();
            console.log("Attached button");
            console.log(button)
        }
    }

    selectOption(option: Option) : void {
        this.slot.selectOption(option);
        this.updateDomSlot()
    }

    updateDomSlot() : void {
        let domImg = this.slotSelector.find(".item-img");
        domImg.attr("src", "about:blank");

        let name = "empty";
        let stats = "empty";

        if (this.slot.getSelectedOption() != null){
            name = this.slot.getSelectedOption().name;
            stats = this.slot.getSelectedOption().stats.join(", ");
        }

        let domName = this.slotSelector.find(".item-name");
        domName.html(htmlEscape `${name}`);

        let domStats = this.slotSelector.find(".item-stats-text");
        domStats.html(htmlEscape `${stats}`);
    }
}


class TroopManager {
    troop: Troop;
    troopIdx : number;
    slots : SlotManager[];
    hpStatElem : JQuery;
    moveRangeStatElem : JQuery;
    dmgStatElem : JQuery;
    atkRangeStatElem : JQuery;

    onUpdate: (tm:TroopManager) => void;


    constructor(troop: Troop, troopIdx : number, onUpdate : (tm:TroopManager) => void = null) {
        this.troop = troop;
        this.troopIdx = troopIdx;

        let closureThis = this;
        this.troop.addOnRecompute((troop) => closureThis.updateStats(troop));
        this.slots = [];

        this.hpStatElem = null;
        this.dmgStatElem = null;
        this.moveRangeStatElem = null;
        this.atkRangeStatElem = null;
        this.onUpdate = onUpdate;

        this.init();
        this.updateStats(this.troop);
    }

    init() : void {
        let rootId = `#troop-${this.troopIdx}`;
        this.slots.push(new SlotManager(new ClassSlot(this.troop), $(rootId + "-class"), this));
        this.slots.push(new SlotManager(new ModifierSlot(this.troop, 0), $(rootId + "-mod1"), this));
        this.slots.push(new SlotManager(new ModifierSlot(this.troop, 1), $(rootId + "-mod2"), this));
        this.slots.push(new SlotManager(new ModifierSlot(this.troop, 2), $(rootId + "-mod3"), this));

        this.hpStatElem = $(rootId + "-hp");
        this.dmgStatElem = $(rootId + "-dmg");
        this.moveRangeStatElem = $(rootId + "-mrange");
        this.atkRangeStatElem = $(rootId + "-arange");
    }

    updateStats(troop : Troop) : void {
        console.log(troop);
        this.hpStatElem.html(troop.maxHp.toString());
        this.dmgStatElem.html(troop.dmg.toString());
        this.moveRangeStatElem.html(troop.moveRange.toString());
        this.atkRangeStatElem.html(troop.atkRange.toString());

        for (let slot of this.slots){
            slot.updateDomSlot();
        }

        if(this.onUpdate != null){
            this.onUpdate(this);
        }
    }
}


declare let optionsJson : string;
declare let loadoutJson : string;


function loadoutInit() : void {
    options = AllOptions.fromObj(JSON.parse(optionsJson));
    loadout = Loadout.fromObj(JSON.parse(loadoutJson));
    let outJsonLocation : JQuery = $("#out-loadout-json");

    function onUpdate(tm : TroopManager){
        outJsonLocation.val(JSON.stringify(loadout.toTransferObject()))
    }

    loadout.troops.map((val, idx) => new TroopManager(val, idx, onUpdate));
}