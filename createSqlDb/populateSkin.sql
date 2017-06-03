declare
v_id skin.id%type;
begin
	select skinIdseq.NextVal into v_id from dual;
	insert into skin values(v_id,1,'Tank');

	select skinIdseq.NextVal into v_id from dual;
	insert into skin values(v_id,2,'Infantry');

	select skinIdseq.NextVal into v_id from dual;
	insert into skin values(v_id,3,'Runner');

	select skinIdseq.NextVal into v_id from dual;
	insert into skin values(v_id,4,'Archer');
end;