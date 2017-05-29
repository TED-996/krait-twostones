create index matchByPlayer1 on match(player1);
create index matchByPlayer2 on match(player2);
create index troopByLoadout on troop(loadoutId);
drop index troopModifier;
create index troopModifier on troopModifier(modifierId,troopId);
