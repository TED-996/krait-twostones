ALTER SESSION SET PLSCOPE_SETTINGS = 'IDENTIFIERS:NONE';
/
create or replace trigger onDeletePLayer
before delete on Player
for each row
declare
    pragma autonomous_transaction; 
begin
    delete from match where player1 = :old.id or player2 = :old.id;
    update matchHistory set player1Id = NULL where player1Id = :old.id;
    update matchHistory set player2Id = NULL where player2Id = :old.id;
    delete from queue where playerId = :old.id;
    delete from Loadout where playerId = :old.id;
    commit;
end;
/

create or replace trigger onDeleteMap
before delete on Map
for each row
declare
    pragma autonomous_transaction; 
begin
    update matchHistory set mapId = NULL where mapId = :old.id;
    delete from match where mapId = :old.id;
    commit;
end;
/
create or replace trigger onDeleteMatch
before delete on Match
for each row
declare
    pragma autonomous_transaction; 
begin
    delete from MatchTroop where matchId = :old.id;
    commit;
end;
/

create or replace trigger onDeleteLoadout
before delete on Loadout
for each row
declare
    pragma autonomous_transaction; 
begin
    delete from troop where loadoutid = :old.id;
    commit;
end;
/

create or replace trigger onDeleteTroopClass
before delete on TroopClass
for each row
declare
    pragma autonomous_transaction; 
begin
    delete from skin where classId = :old.id;
    delete from Troop where classId = :old.id;
    commit;
end;
/

create or replace trigger onDeleteSkin
before delete on Skin
for each row
declare
    pragma autonomous_transaction; 
begin
    update Troop set skinId = null where skinId = :old.id;
    commit;
end;
/

create or replace trigger onDeleteModifier
before delete on Modifier
for each row
declare
    pragma autonomous_transaction; 
begin
    delete from TroopModifier where modifierId = :old.id;
    commit;
end;
/

create or replace trigger onDeleteTroop
before delete on Troop
for each row
declare
    pragma autonomous_transaction; 
begin
    delete from TroopModifier where troopId = :old.id;
    delete from MatchTroop where troopId = :old.id;
    commit;
end;
/