set serveroutput on;
declare
v_contor INTEGER := 0;
v_username player.playername%type;
v_password player.password%type := 'a';
v_loadoutId loadout.id%type := NULL;
v_inMatch PLAYER.INMATCH%type := 0;
v_mmr PLAYER.MMR%type := 1000;
v_level PLAYER.PLAYERLEVEL%type := 1;
begin
	FOR v_contor IN 1..10000 LOOP
		select dbms_random.string('A',20) into v_username from dual;
		insert into player values(playerIdSeq.nextVal,v_username,v_password,v_loadoutId,v_inMatch,v_mmr,v_level);
	end loop;
end;

