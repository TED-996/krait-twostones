create or replace function getMax(a number,b number ) return number as
begin
    if a > b then 
        return a;
    else 
        return b;
    end if;
end getMax;
/
drop materialized view TroopStatsCalculator;
/
create materialized view TroopStatsCalculator 
refresh force on demand
as
    select  troop.id,troop.classId,troop.loadoutId,troop.skinId,
            GREATEST ((troopClass.maxHp     + ((troopClass.maxHp     * sum(nvl(modifier.maxHp, 0)    ))/100)),0.001) as "MAXHP",
            GREATEST ((troopClass.dmg       + ((troopClass.dmg       * sum(nvl(modifier.dmg, 0)      ))/100)),0.001) as "DMG",
            GREATEST ((troopClass.atkRange  + ((troopClass.atkRange  * sum(nvl(modifier.atkRange, 0) ))/100)),0) as "ATKRANGE",
            GREATEST ((troopClass.moveRange + ((troopClass.moveRange * sum(nvl(modifier.moveRange, 0)))/100)),0) as "MOVERANGE" from
            troop left outer join troopModifier on troop.id = troopModifier.troopId 
                  join troopClass    on troop.classId = troopClass.id
                  left join modifier      on troopModifier.modifierId = modifier.id
            group by troop.id,troop.classId,troop.loadoutId,troop.skinId,troopModifier.troopId,troopClass.maxHp,troopClass.dmg,troopClass.atkRange,troopClass.moveRange;
/