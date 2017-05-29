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
	for v_contor in 1..10000 loop
    v_player_id := v_contor;
    select playername into v_username
      from temp
      where id = v_player_id;
      v_password := dbms_random.string('u',12);
      user_ops.addPlayer(v_username,v_password);
	end loop;
  commit;
end;