set serveroutput on;


declare
v_contor INTEGER := 0;
v_player_id number;
v_username player.playername%type;
v_password player.password%type;
begin
  DBMS_OUTPUT.PUT_LINE('preinserts');
	for v_contor in 1..10000 loop
    v_player_id := playerIdSeq.nextVal;
    select playername into v_username
      from temp
      where id = v_player_id;
    v_password := dbms_random.string('u',12);
    user_ops.addPlayer(v_username,v_password);
    --DBMS_OUTPUT.PUT_LINE('inserted one');
	end loop;
  dbms_output.put_line('done!');
  commit;
end;