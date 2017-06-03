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
        if (obj === null){
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

    public toTransferObject() : TroopTransferObject {
        return {
            id: this.id,
            skin: this.skin.filename || "Tank",
            className: this.troopClass.name,
            description: this.troopClass.description,
            hp: this.maxHp,
            dmg: this.dmg,
            aRange: this.atkRange,
            mRange: this.moveRange,
            modifiers: this.modifiers.map((m) => {
                if (m === null){
                    return null;
                }
                else{
                    return m.id;
                }
            })
        };
    }
}

interface TroopTransferObject {
    id : number,
    skin: string,
    className: string,
    description: string,
    hp?: number,
    dmg?: number
    aRange?: number,
    mRange?: number,
    modifiers: number[]
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
        return new Loadout(obj.loadoutId, obj.owner, obj.troops.map(Troop.fromObj));
    }

    public toTransferObject() : LoadoutTransferObject {
        return {
            owner: this.owner,
            loadoutId: this.id,
            troops: this.troops.map((t) => t.toTransferObject())
        };
    }
}

interface LoadoutTransferObject {
    owner : string,
    loadoutId : number,
    troops : TroopTransferObject[]
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

    public static loadAjax() : AllOptions {
        return AllOptions.fromObj(JSON.parse(ajax_raw_sync("/get_options")));
    }
}