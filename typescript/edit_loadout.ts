/// <reference path="node_modules/@types/jquery/index.d.ts" />
//import * as $ from "jquery";

interface Option {
    name : string;
    description : string;
    stats : string[];
}

function statsToStrings(maxHp:number, dmg:number, atkRange:number, moveRange:number):string[] {
    return ["HP: " + maxHp, "DMG: " + dmg, "Atk Range: " + atkRange, "Move Range: " + moveRange]
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


class TroopClass implements Option {
    name:string;
    description:string;
    stats:string[];

    baseHp:number;
    baseDmg:number;
    baseAtkRange:number;
    baseMoveRange:number;

    static classDb:{[name : string] : TroopClass} = {};

    constructor(name:string, description:string, baseHp:number, baseDmg:number, baseAtkRange:number, baseMoveRange:number) {
        this.name = name;
        this.description = description;
        this.baseHp = baseHp;
        this.baseDmg = baseDmg;
        this.baseAtkRange = baseAtkRange;
        this.baseMoveRange = baseMoveRange;

        this.stats = statsToStrings(baseHp, baseDmg, baseAtkRange, baseMoveRange);
    }

    static fromObj(obj):TroopClass {
        let name:string = obj.name;

        if (TroopClass.classDb[name]) {
            return TroopClass.classDb[name];
        }
        else {
            let result = new TroopClass(obj.name, obj.description, obj.maxHp, obj.dmg, obj.atkRange, obj.moveRange);
            TroopClass.classDb[name] = result;
            return result;
        }
    }
}

class Modifier implements Option {
    id:number;
    name:string;
    stats:string[];
    description:string;

    maxHpMod:number;
    dmgMod:number;
    atkRangeMod:number;
    moveRangeMod:number;

    static modifierDb:{[id : number]: Modifier} = {};

    constructor(id:number, name:string, maxHp:number, dmg:number, atkRange:number, moveRange:number) {
        this.id = id;
        this.name = name;
        this.maxHpMod = maxHp;
        this.dmgMod = dmg;
        this.atkRangeMod = atkRange;
        this.moveRangeMod = moveRange;

        this.stats = statsToStrings(maxHp, dmg, atkRange, moveRange);
        this.description = `${this.name}: ${this.stats.join(", ")}`;
    }

    static fromObj(obj):Modifier {
        if (obj == null){
            return null;
        }

        let id:number = obj.id;
        if (Modifier.modifierDb[id]) {
            return Modifier.modifierDb[id];
        }
        else {
            let result = new Modifier(obj.id, obj.name, obj.maxHp, obj.dmg, obj.atkRange, obj.moveRange);
            Modifier.modifierDb[id] = result;
            return result;
        }
    }
}

class Skin implements Option {
    name:string;
    description:string;
    stats:string[];

    filename:string;

    constructor(filename:string) {
        this.filename = filename;

        this.name = this.filename;
        this.description = "";
        this.stats = [];
    }

    static fromObj(obj):Skin {
        return new Skin(obj);
    }
}

class Troop {
    id:number;
    troopClass:TroopClass;
    skin:Skin;
    modifiers:Modifier[];

    maxHp:number;
    dmg:number;
    atkRange:number;
    moveRange:number;

    onRecomputeHandlers : {(troop : Troop) : void}[];


    constructor(id:number, troopClass:TroopClass, skin:Skin, modifiers:Modifier[],
                maxHp:number, dmg:number, atkRange:number, moveRange:number) {
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

    addOnRecompute(handler : {(troop : Troop) : void}){
        this.onRecomputeHandlers.push(handler);
    }

    recompute():void {
        this.maxHp = Math.max(this.recompute_one(
            this.troopClass.baseHp, function (mod:Modifier) {
                return mod.maxHpMod
            }), 1);
        this.dmg = this.recompute_one(this.troopClass.baseDmg, function (mod:Modifier) {
            return mod.dmgMod
        });
        this.atkRange = this.recompute_one(
            this.troopClass.baseAtkRange, function (mod:Modifier) {
                return mod.atkRangeMod
            });
        this.moveRange = this.recompute_one(
            this.troopClass.baseMoveRange, function (mod:Modifier) {
                return mod.moveRangeMod
            }
        );

        this.onRecomputeHandlers.forEach((h) => h(this));
    }

    recompute_one(base:number, extract_func:(Modifier) => number):number {
        let mul_percent = 100;

        for (let mod of this.modifiers) {
            if (mod != null) {
                mul_percent += extract_func(mod)
            }
        }

        return Math.max(Math.round(base * mul_percent / 100), 0)
    }

    static fromObj(obj):Troop {
        let className:string = obj.className;
        let troopClass:TroopClass = TroopClass.classDb[className];
        let modifierIds:number[] = obj.modifiers;
        let modifiers:Modifier[] = modifierIds.map(function (id) {
            return Modifier.modifierDb[id];
        });

        return new Troop(obj.id, troopClass, obj.skin, modifiers, obj.maxHp, obj.dmg, obj.atkRange, obj.moveRange)
    }

}

class Loadout {
    id:number;
    owner:string;
    troops:Troop[];


    constructor(id:number, owner:string, troops:Troop[]) {
        this.id = id;
        this.owner = owner;
        this.troops = troops;
    }

    static fromObj(obj):Loadout {
        return new Loadout(obj.id, obj.owner, obj.troops.map(Troop.fromObj));
    }
}

class AllOptions {
    troopClassOptions:TroopClass[];
    modifierOptions:Modifier[];
    skinOptions:Skin[];

    constructor(troopClassOptions:TroopClass[], modifierOptions:Modifier[], skinOptions:Skin[]) {
        this.troopClassOptions = troopClassOptions;
        this.modifierOptions = modifierOptions;
        this.skinOptions = skinOptions;
    }

    static fromObj(obj):AllOptions {
        return new AllOptions(
            obj.troopClasses.map(TroopClass.fromObj),
            obj.modifiers.map(Modifier.fromObj),
            obj.skins.map(Skin.fromObj)
        );
    }
}

let options : AllOptions = null;
let loadout : Loadout = null;


interface Slot {
    selectedOption : Option;

    getOptions() : Option[];
    selectOption(option:Option) : void;
}

class ClassSlot implements Slot {
    selectedOption:Option;
    troop:Troop;

    constructor(troop:Troop) {
        this.troop = troop;
        this.selectedOption = troop.troopClass;
    }

    getOptions():Option[] {
        return options.troopClassOptions;
    }

    selectOption(option:Option) : void {
        let optionAsClass = <TroopClass> option;
        this.selectedOption = option;
        this.troop.troopClass = optionAsClass;
        this.troop.recompute();
    }
}

class ModifierSlot implements Slot {
    selectedOption:Option;
    troop:Troop;
    modifierIdx:number;


    constructor(troop:Troop, modifierIdx:number) {
        this.troop = troop;
        this.modifierIdx = modifierIdx;

        this.selectedOption = this.troop.modifiers[this.modifierIdx];
    }

    getOptions():Option[] {
        return options.modifierOptions;
    }

    selectOption(option:Option) : void {
        let optionAsModifier = <Modifier> option;
        this.selectedOption = option;

        for (let idx in this.troop.modifiers){
            if (this.troop.modifiers[idx] == optionAsModifier){
                this.troop.modifiers[idx] = null;
            }
        }

        this.troop.modifiers[this.modifierIdx] = optionAsModifier;
        this.troop.recompute();
    }
}

class SkinSlot implements Slot {
    selectedOption:Option;
    troop:Troop;

    constructor(troop:Troop) {
        this.troop = troop;
        this.selectedOption = troop.skin;
    }

    getOptions():Option[] {
        return options.skinOptions;
    }

    selectOption(option:Option) : void {
        this.troop.skin = <Skin>option;
        this.selectedOption = option;
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

        this.domElement.on("click", function(o){
            this.slotManager.selectOption(this.option);
        });
    }

    static createElement(option : Option) : JQuery{
        let result = $("<li></li>", {
            "class": "option-li"
        });
        $(htmlEscape `<p>${option.name}</p>`, {
            "class": "text-center"
        }).appendTo(result);
        $(htmlEscape `<p>${option.stats.join("; ")}</p>`, {
            "class": "text-center"
        });

        return result;
    }

    attach() : void {
        $("options_div").append(this.domElement);
    }

}


class SlotManager {
    slot:Slot;
    slotSelector : JQuery;
    troopManager: TroopManager;
    active : boolean;

    static optionsList = $("#options-div");

    constructor(slot:Slot, slotSelector:JQuery, troopManager: TroopManager) {
        this.slot = slot;
        this.slotSelector = slotSelector;
        this.troopManager = troopManager;
        this.active = false;

        slotSelector.on("click", function(){
            if (!this.active){
                this.activate()
            }
        });

        this.updateDomSlot();
    }

    activate() : void {
        SlotManager.optionsList.html();
        this.addOptions();

        this.active = true;
    }

    addOptions() : void {
        for (let option of this.slot.getOptions()){
            let button = new OptionButton(option, this);
            button.attach();
        }
    }

    selectOption(option: Option) : void {
        this.slot.selectOption(option);
        this.updateDomSlot()
    }

    updateDomSlot() : void {
        let domImg = this.slotSelector.find(".item-img");
        domImg.attr("src", "about:blank");

        let name = "";
        let stats = "";

        if (this.slot.selectedOption != null){
            name = this.slot.selectedOption.name;
            stats = this.slot.selectedOption.stats.join(", ");
        }

        let domName = this.slotSelector.find(".item-name");
        domName.html(htmlEscape `${name}`);

        let domStats = this.slotSelector.find(".item-stats");
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


    constructor(troop: Troop, troopIdx : number) {
        this.troop = troop;
        this.troopIdx = troopIdx;
        this.troop.addOnRecompute(this.updateStats);
        this.slots = [];

        this.hpStatElem = null;
        this.dmgStatElem = null;
        this.moveRangeStatElem = null;
        this.atkRangeStatElem = null;

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
    }
}

function loadout_init(loadout_url : string) : void {
    let optionsFromJson : string = null;
    let loadoutFromJson : string = null;

    $.ajax({
        url: loadout_url,
        async: false,
        dataType: "json",
        success: function(response){
            loadoutFromJson = response
        }
    });

    $.ajax({
        url: "/get_options",
        async: false,
        dataType: "json",
        success: function(response){
            optionsFromJson = response
        }
    });

    options = AllOptions.fromObj(optionsFromJson);
    loadout = Loadout.fromObj(loadoutFromJson);
    loadout.troops.map((val, idx) => new TroopManager(val, idx));
}