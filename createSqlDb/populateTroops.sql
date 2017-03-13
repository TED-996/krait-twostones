declare
v_player_id player.id%type;
v_loadout_id loadout.id%type;
v_troop_id troop.id%type;
v_class_id troopClass.id%type;
v_skin_id skin.id%type;
v_mod_id modifier.id%type;

v_class_min troopClass.id%type;
v_class_max troopClass.id%type;
v_mod_min modifier.id%type;
v_mod_max modifier.id%type;
v_player_max player.id%type;
v_player_min player.id%type;

v_player_ctr number;
v_troop_ctr number;
v_mod_ctr number;

v_nr_skins_ok number;
v_rand_skin_idx number;
begin
  select max(id), min(id) into v_player_max, v_player_min from player;
  select max(id), min(id) into v_class_max, v_class_min from troopClass;
  select max(id), min(id) into v_mod_max, v_mod_min from modifier;
  
  for v_player_ctr in 1..10000 loop
    select trunc(dbms_random.value(v_player_min, v_player_max + 1)) into v_player_id from dual;
    --create loadout for this player    
    select loadoutIdSeq.nextval into v_loadout_id from dual;
    
    insert into loadout values (
      v_loadout_id,
      v_player_id
    );
    
    for v_troop_ctr in 1..6 loop
      select troopIdSeq.nextval into v_troop_id from dual;
      select trunc(dbms_random.value(v_class_min, v_class_max + 1)) into v_class_id from dual;
      
      select count(*) into v_nr_skins_ok
        from skin
        where classId = v_class_id;
      select trunc(dbms_random.value(1, v_nr_skins_ok + 1)) into v_rand_skin_idx from dual;
      
      select id into v_skin_id
        from (
          select id, rownum as rn
            from skin
            where classId = v_class_id
        )
      where rn = v_rand_skin_idx;
      
      insert into troop values(
        v_troop_id,
        v_class_id,
        v_player_id,
        v_loadout_id,
        -1,
        -1,
        -1,
        -1,
        v_skin_id
      );
      
      for v_mod_ctr in 1..3 loop
        select trunc(dbms_random.value(v_mod_min, v_mod_max + 1)) into v_mod_id from dual;
        
        insert into troopModifier 
          select v_troop_id, v_mod_id
          from dual
          where not exists(
            select 'dummy' from troopModifier
            where troopId = v_troop_id
              and modifierId = v_mod_id
          );
      end loop;
    end loop;
      
    
  end loop;
  
  
  
  
end;