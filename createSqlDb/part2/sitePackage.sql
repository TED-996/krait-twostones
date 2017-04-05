create or replace package functions as
    procedure addPlayer(playername player.playername%type,password player.password%type);
    procedure deletePlayer(playerId player.id%type);
    procedure updatePlayer();
end;

create or replace package body functions as
    
end;