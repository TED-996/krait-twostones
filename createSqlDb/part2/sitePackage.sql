create or replace package user_Ops as
    procedure addPlayer(playername player.playername%type ,password player.password%type);
    procedure deletePlayer(playerId player.id%type);
    procedure updatePlayer( v_playerId player.id%type,
                            v_playername player.playername%type DEFAULT NULL, 
                            v_password player.password%type DEFAULT NULL,
                            v_currentLoadout player.currentLoadout%type DEFAULT NULL,
                            v_inMatch player.inMatch%type DEFAULT NULL,
                            v_mmr player.mmr%type DEFAULT NULL,
                            v_playerLevel player.playerLevel%type DEFAULT NULL
                            );
    type tempTable is table of player%rowtype;
    FUNCTION getUsers ( v_rowStart player.id%type DEFAULT 0, 
                        v_rowCount player.id%type DEFAULT 0, 
                        v_playername player.playername%type DEFAULT null) return tempTable;
end;
/
create or replace package body user_Ops as
    noPlayers_exception exception;
    PRAGMA exception_INIt(noPlayers_exception,-20004);
    function getUsers ( v_rowStart player.id%type DEFAULT 0, 
                        v_rowCount player.id%type DEFAULT 0, 
                        v_playername player.playername%type DEFAULT null)  
    return tempTable as
        cursor lista_player is select id,playername,password,currentLoadout,inMatch,mmr,playerLevel from (
            select rownum as v_rownum,id,playername,password,currentLoadout,inMatch,mmr,playerLevel from 
            (
                select * from player order by id
            )
        ) where v_rownum >= v_rowStart;
        myReturnTable tempTable;
    BEGIN
        open lista_player;
        if v_playername is not null then
            select * bulk collect into myReturnTable from player where playername = v_playername;
            close lista_player;
            return myReturnTable;
        else if (v_rowCount != 0 and v_rowCount != 0) then
                fetch lista_player bulk collect into myReturnTable limit v_rowCount;
                if (myReturnTable.count = 0) then
                    raise noPlayers_exception;
                end if;
                close lista_player;
                return myReturnTable;
            else
                close lista_player; 
                return null;
            end if;
        end if;
    exception
        when NO_DATA_FOUND then
            close lista_player;
            raise_application_error(-20001,'No player with this name or id exists!');
            return NULL;
        when noPlayers_exception then
            raise_application_error(-20004,'No more players!');
            return NULL;
    end getUsers;

    procedure addPlayer(playername player.playername%type, password player.password%type) is
    begin
        insert into Player values(playeridseq.nextval, playername, password,null,0,0,1);
    exception
        when DUP_VAL_ON_INDEX then
            raise_application_error(-20001,'A player with the same name already exists!');
    end addPlayer;
    
    procedure deletePlayer(playerId player.id%type) is
    begin
        delete from Player where
            id = playerId;
    exception
        when NO_DATA_FOUND then
            raise_application_error(-20001,'No player with this name or id exists!');
        when INVALID_NUMBER then
            raise_application_error(-20003,'Invalid number');
    end deletePlayer;
    
    procedure updatePlayer( v_playerId player.id%type,
                            v_playername player.playername%type DEFAULT NULL, 
                            v_password player.password%type DEFAULT NULL,
                            v_currentLoadout player.currentLoadout%type DEFAULT NULL,
                            v_inMatch player.inMatch%type DEFAULT NULL,
                            v_mmr player.mmr%type DEFAULT NULL,
                            v_playerLevel player.playerLevel%type DEFAULT NULL
                            ) is
        player_row player%rowtype;
    begin
        select * into player_row from player where id = v_playerId;
        if v_playername is not null then
            update player set playername = v_playername where id = v_playerId;
        end if;
        if v_password is not null then
            update player set password = v_password where id = v_playerId;
        end if;
        if v_currentLoadout is not null then
            update player set currentLoadout = v_currentLoadout where id = v_playerId;
        end if;
        if v_inMatch is not null then
            update player set inMatch = v_inMatch where id = v_playerId;
        end if;
        if v_mmr is not null then
            update player set mmr = v_mmr where id = v_playerId;
        end if;
        if v_playerLevel is not null then
            update player set playerLevel = playerLevel where id = v_playerId;
        end if;
    exception
        when DUP_VAL_ON_INDEX then
            raise_application_error(-20000,'A player with the same name already exists!');
         when NO_DATA_FOUND then
            raise_application_error(-20001,'No player with this name or id exists!');
    end updatePlayer;
end;