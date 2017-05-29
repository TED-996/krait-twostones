drop materialized view TroopStatsCalculator;
/
create materialized view TroopStatsCalculator as
    select  troop.id,troop.classId,troop.loadoutId,troop.skinId,
            (troopClass.maxHp     + ((troopClass.maxHp     * sum(modifier.maxHp    ))/100)) as "MAXHP",
            (troopClass.dmg       + ((troopClass.dmg       * sum(modifier.dmg      ))/100)) as "DMG",
            (troopClass.atkRange  + ((troopClass.atkRange  * sum(modifier.atkRange ))/100)) as "ATKRANGE",
            (troopClass.moveRange + ((troopClass.moveRange * sum(modifier.moveRange))/100)) as "MOVERANGE" from
            troop join troopModifier on troop.id = troopModifier.troopId 
                  join troopClass    on troop.classId = troopClass.id
                  join modifier      on troopModifier.modifierId = modifier.id
            group by troop.id,troop.classId,troop.loadoutId,troop.skinId,troopModifier.troopId,troopClass.maxHp,troopClass.dmg,troopClass.atkRange,troopClass.moveRange;
/
create or replace trigger onDeleteLoadout
after delete on Loadout
for each row
declare
    pragma autonomous_transaction; 
begin
  delete from troop where loadoutid = :old.id;
  commit;
end;
/
create or replace trigger TroopModifierRefresh
after insert or update or delete on TroopModifier
for each row
declare 
    l_job number;
begin 
    dbms_job.submit( l_job, 'dbms_mview.refresh( ''TROOPSTATSCALCULATOR'' );' ); 
end;
/
--tests
delete from troopmodifier where troopid = 1 and modifierid = 2;
commit;
insert into troopmodifier values (1,2);
commit;
select * from Troopstatscalculator order by id;

