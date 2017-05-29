drop materialized view TroopStatsCalculator;
/
create or replace package StatsCalculator as
    function calcMaxHp(p_id number, p_classId number,loadoutId number) return number;
    function calcDmg(p_id number, p_classId number,loadoutId number) return number;
    function calcAtkRange(p_id number, p_classId number,loadoutId number) return number;
    function calcMoveRange(p_id number, p_classId number,loadoutId number) return number;
end;
/
create or replace package body StatsCalculator as
        function getMax(a number,b number ) return number as
        begin
            if a > b then return a;
            else return b;
            end if;
        end getMax;

     function calcMaxHp(p_id number, p_classId number,loadoutId number) return number as
        v_hp number;
        v_hp_proc number := 0;
        cursor modifier_curs is
            select maxHp from modifier where id in (select modifierId from TroopModifier where troopId = p_id);
        modifier_curs_row modifier_curs%rowtype;
     begin
        select maxHp into v_hp from TroopClass where id = p_classId;
        open modifier_curs;
        loop
            fetch modifier_curs into modifier_curs_row;
            exit when modifier_curs%notfound;
            v_hp_proc := v_hp_proc + modifier_curs_row.maxHp;
        end loop;
        close modifier_curs;
        v_hp := v_hp + ((v_hp*v_hp_proc)/100);
        return getMax(v_hp,0);
     end calcMaxHp;

    function calcDmg(p_id number, p_classId number,loadoutId number) return number as
        v_dmg number;
        v_dmg_proc number := 0;
        cursor modifier_curs is
            select dmg from modifier where id in (select modifierId from TroopModifier where troopId = p_id);
        modifier_curs_row modifier_curs%rowtype;
     begin
        select dmg into v_dmg from TroopClass where id = p_classId;
        open modifier_curs;
        loop
            fetch modifier_curs into modifier_curs_row;
            exit when modifier_curs%notfound;
            v_dmg_proc := v_dmg_proc + modifier_curs_row.dmg;
        end loop;
        close modifier_curs;
        v_dmg := v_dmg + ((v_dmg*v_dmg_proc)/100);
        return getMax(v_dmg,0);
      end calcDmg;

    function calcAtkRange(p_id number, p_classId number,loadoutId number) return number as
        v_atkRange number;
        v_atkRange_proc number := 0;
        cursor modifier_curs is
            select atkRange from modifier where id in (select modifierId from TroopModifier where troopId = p_id);
        modifier_curs_row modifier_curs%rowtype;
     begin
        select atkRange into v_atkRange from TroopClass where id = p_classId;
        open modifier_curs;
        loop
            fetch modifier_curs into modifier_curs_row;
            exit when modifier_curs%notfound;
            v_atkRange_proc := v_atkRange_proc + modifier_curs_row.atkRange; 
        end loop;
        close modifier_curs;
        v_atkRange := v_atkRange + ((v_atkRange*v_atkRange_proc)/100);
        return getMax(round(v_atkRange),0);
      end calcAtkRange;

    function calcMoveRange(p_id number, p_classId number,loadoutId number) return number as
        v_moveRange number;
        v_moveRange_proc number := 0;
        cursor modifier_curs is
            select moveRange from modifier where id in (select modifierId from TroopModifier where troopId = p_id);
        modifier_curs_row modifier_curs%rowtype;
     begin
        select moveRange into v_moveRange from TroopClass where id = p_classId;
        open modifier_curs;
        loop
            fetch modifier_curs into modifier_curs_row;
            exit when modifier_curs%notfound;
            v_moveRange_proc := v_moveRange_proc + modifier_curs_row.moveRange;  
        end loop;
        close modifier_curs;
        v_moveRange := v_moveRange + ((v_moveRange*v_moveRange_proc)/100);
        return getMax(round(v_moveRange),0);
      end calcMoveRange;
end;
/

create materialized view TroopStatsCalculator as
    select id,classId,loadoutId,skinId, 
        StatsCalculator.calcMaxHp(id,classId,loadoutId) as "MAXHP", 
        StatsCalculator.calcDmg(id,classId,loadoutId) as "DMG", 
        StatsCalculator.calcAtkRange(id,classId,loadoutId) as "ATKRANGE", 
        StatsCalculator.calcMoveRange(id,classId,loadoutId) as "MOVERANGE" 
    from Troop;
/
create index statsIndex on TroopStatsCalculator(loadoutId);
/