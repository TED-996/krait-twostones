set serveroutput on;


declare
v_contor INTEGER := 0;
v_player_id number;
v_username player.playername%type;
v_password player.password%type := 'a';
v_loadoutId loadout.id%type := NULL;
v_inMatch PLAYER.INMATCH%type := 0;
v_mmr PLAYER.MMR%type := 1000;
v_level PLAYER.PLAYERLEVEL%type := 1;
begin
  DBMS_OUTPUT.PUT_LINE('preinserts');
	for v_contor in 1..10000 loop
    v_player_id := playerIdSeq.nextVal;
    select playername into v_username 
      from temp
      where id = v_player_id;
		insert into player values(v_player_id,v_username,v_password,v_loadoutId,v_inMatch,v_mmr,v_level);
    --DBMS_OUTPUT.PUT_LINE('inserted one');
	end loop;
  dbms_output.put_line('done!');
  commit;
end;