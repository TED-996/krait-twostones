import $ from "jquery"


interface Option {
    name : string;
    description : string;
    stats : string[];
}

function statsToStrings(maxHp : number, dmg : number, atkRange : number, moveRange : number) : string[]{
    return ["HP: " + maxHp, "DMG: " + dmg, "Atk Range: " + atkRange, "Move Range: " + moveRange]
}


class TroopClass implements Option {
    name : string;
    description : string;
    stats : string[];

    baseHp : number;
    baseDmg : number;
    baseAtkRange : number;
    baseMoveRange : number;

    static classDb : {[name : string] : TroopClass} = {};

    constructor(name:string, description:string, baseHp:number, baseDmg:number, baseAtkRange:number, baseMoveRange:number) {
        this.name = name;
        this.description = description;
        this.baseHp = baseHp;
        this.baseDmg = baseDmg;
        this.baseAtkRange = baseAtkRange;
        this.baseMoveRange = baseMoveRange;

        this.stats = statsToStrings(baseHp, baseDmg, baseAtkRange, baseMoveRange);
    }

    static fromObj(obj) : TroopClass {
        var name : string = obj.name;

        if (TroopClass.classDb[name]){
            return TroopClass.classDb[name];
        }
        else{
            var result = new TroopClass(obj.name, obj.description, obj.hp, obj.dmg, obj.aRange, obj.mRange);
            TroopClass.classDb[name] = result;
            return result;
        }
    }
}

class Modifier implements Option {
    id : number;
    name : string;
    stats : string[];

    maxHpMod : number;
    dmgMod : number;
    atkRangeMod : number;
    moveRangeMod : number;

    static modifierDb : {[id : number]: Modifier} = {};

    constructor(id : number, name : string, maxHp : number, dmg : number, atkRange : number, moveRange : number) {
        this.id = id;
        this.name = name;
        this.maxHpMod = maxHp;
        this.dmgMod = dmg;
        this.atkRangeMod = atkRange;
        this.moveRangeMod = moveRange;

        this.stats = statsToStrings(maxHp, dmg, atkRange, moveRange)
    }

    static fromObj(obj) : Modifier {
        var id : number = obj.id;
        if (Modifier.modifierDb[id]){
            return Modifier.modifierDb[id];
        }
        else {
            var result = new Modifier(obj.id, obj.name, obj.maxHp, obj.dmg, obj.atkRange, obj.moveRange);
            Modifier.modifierDb[id] = result;
            return result;
        }
    }
}

class Skin implements Option {
    name : string;
    description : string;
    stats : string[];

    filename : string;

    constructor(filename:string) {
        this.filename = filename;

        this.name = this.filename;
        this.description = "";
        this.stats = [];
    }
}

class Troop {
    id : number;
    troopClass : TroopClass;
    skin : string;
    modifiers : Modifier[];

    maxHp : number;
    dmg : number;
    atkRange : number;
    moveRange : number;


    constructor(id : number, troopClass:TroopClass, skin:string, modifiers:Modifier[],
                maxHp:number, dmg:number, atkRange:number, moveRange:number) {
        this.id = id;
        this.troopClass = troopClass;
        this.skin = skin;
        this.modifiers = modifiers;
        this.maxHp = maxHp;
        this.dmg = dmg;
        this.atkRange = atkRange;
        this.moveRange = moveRange;
    }

    recompute(): void {
        this.maxHp = Math.max(this.recompute_one(
            this.troopClass.baseHp, function (mod : Modifier) {return mod.maxHpMod}), 1);
        this.dmg = this.recompute_one(this.troopClass.baseDmg, function(mod : Modifier) {return mod.dmgMod});
        this.atkRange = this.recompute_one(
            this.troopClass.baseAtkRange, function(mod : Modifier) {return mod.atkRangeMod});
        this.moveRange = this.recompute_one(
            this.troopClass.baseMoveRange, function(mod : Modifier) {return mod.moveRangeMod}
        );
    }

    recompute_one(base : number, extract_func : (Modifier) => number) : number {
        var mul_percent = 100;

        for (let mod of this.modifiers){
            mul_percent += extract_func(mod)
        }

        return Math.max(Math.round(base * mul_percent / 100), 0)
    }

    static fromObj(obj) : Troop {
        var className : string = obj.className;
        var troopClass : TroopClass = TroopClass.classDb[className];
        var modifierIds : number[] = obj.modifiers;
        var modifiers : Modifier[] = modifierIds.map(function (id) {
            return Modifier.modifierDb[id];
        });

        return new Troop(obj.id, troopClass, obj.skin, modifiers, obj.maxHp, obj.dmg, obj.atkRange, obj.moveRange)
    }

}

class Loadout {
    id : number;
    owner : string;
    troops : Troop[];


    constructor(id:number, owner:string, troops:Troop[]) {
        this.id = id;
        this.owner = owner;
        this.troops = troops;
    }

    static fromObj(obj) : Loadout {
        return new Loadout(obj.id, obj.owner, obj.troops.map(Troop.fromObj));
    }
}

class AllOptions {
    troopClassOptions : TroopClass[];
    modifierOptions : Modifier[];
    skinOptions : Skin[];

    constructor(troopClassOptions:TroopClassOptions, modifierOptions:ModifierOptions, skinOptions:SkinOptions) {
        this.troopClassOptions = troopClassOptions;
        this.modifierOptions = modifierOptions;
        this.skinOptions = skinOptions;
    }

    static fromObj(obj) : AllOptions {
        return new AllOptions(
            TroopClassOptions.fromObj(obj.troopClasses), //TOOD: use map
            ModifierOptions.fromObj(obj.modifiers),
            SkinOptions.fromObj(obj.skins) //TOOD: implement formObj on skin
        );
    }
}

var options = AllOptions.fromObj(JSON.parse($("#available-json").html()));
var loadout = Loadout.fromObj(JSON.parse($("#loadout-json").html()));


interface Slot {
    selectedOption : Option;

    getOptions() : Option[];
    selectOption(option : Option);
}

class ClassSlot implements Slot {
    selectedOption : Option;

    troop : Troop;

    getOptions() : Option[]{
        return options.troopClassOptions;
    }
}