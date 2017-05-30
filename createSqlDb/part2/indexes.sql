drop index matchByPlayer1;
drop index matchByPlayer2;
drop index troopByLoadout;
drop index troopModifierByModifier;
drop index skinByClass;
drop index troopByClassId;
drop index loadoutByPlayerId;

create index matchByPlayer1 on match(player1);
create index matchByPlayer2 on match(player2);
create index troopByLoadout on troop(loadoutId);
create index troopModifierByModifier on troopModifier(modifierId,troopId);
create index skinByClass on skin(classId);
create index troopByClassId on troop(classId);
create index loadoutByPlayerId on Loadout(playerId);
