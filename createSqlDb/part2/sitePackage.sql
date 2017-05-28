drop type tempTable;
create or replace type tempTableObject is object(
    id  NUMBER(10),
    playername VARCHAR2(30),
    password VARCHAR2(97),
    currentLoadout NUMBER(10),
    inMatch NUMBER(1),
    mmr NUMBER(5),
    token varchar2(32),
    playerLevel NUMBER(2)
);
/
create or replace type tempTable is table of tempTableObject;
/
create or replace package user_Ops as
    procedure addPlayer(playername player.playername%type ,password player.password%type);
    procedure deletePlayer(playerId player.id%type);
    procedure updatePlayer( v_playerId player.id%type,
                            v_playername player.playername%type DEFAULT NULL, 
                            v_password player.password%type DEFAULT NULL,
                            v_currentLoadout player.currentLoadout%type DEFAULT NULL,
                            v_inMatch player.inMatch%type DEFAULT NULL,
                            v_mmr player.mmr%type DEFAULT null,
                            v_token player.token%type DEFAULT null,
                            v_playerLevel player.playerLevel%type DEFAULT NULL
                            );
    FUNCTION getUsers ( v_rowStart number default 0, 
                        v_rowCount number default 0, 
                        v_playername player.playername%type DEFAULT null) return tempTable;
    FUNCTION getUsersById (v_id player.id%type default 0) return tempTable;
    function getSaltedPassword( password VARCHAR2,
                                mySalt varchar2 default NULL
                                ) return player.password%type;
    function checkSaltedPassword(p_playername player.playername%type,
                                 p_test_password varchar2) return number;
end;
/
create or replace package body user_Ops as
    noPlayers_exception exception;
    PRAGMA exception_INIt(noPlayers_exception,-20004);

    function getSaltedPassword( password varchar2,
                                mySalt varchar2 default NULL
                                ) return player.password%type 
    is
      returnPassword player.password%type;
      mySaltTwo varchar2(97);
      tempString RAW(97);
    begin
        if mySalt is null then
            mySaltTwo := dbms_random.string('l',16);
        else
            mySaltTwo := mySalt;
        end if;
        tempString := dbms_crypto.HASH(src => utl_raw.cast_to_raw(mySaltTwo||password),typ => DBMS_CRYPTO.hash_sh1);
        returnPassword := rawtohex(utl_raw.cast_to_raw(mySaltTwo))||'-'||rawtohex(tempString);
        return returnPassword;
    end getSaltedPassword;


    function getUsersbyId (v_id player.id%type default 0) return tempTable as
        myReturnTable tempTable;
        n integer := 0;
    BEGIN
        myReturnTable := tempTable();
        for item in (select * from player where id = v_id) loop
          myReturnTable.extend;
          n := n + 1;
          myReturnTable(n) :=  tempTableObject(item.id,
                                                item.playername,
                                                item.password,
                                                item.currentLoadout,
                                                item.inMatch,
                                                item.mmr,
                                                item.token,
                                                item.playerLevel
                                                );
        end loop;
        return myReturnTable;
    exception
    when NO_DATA_FOUND then
            raise_application_error(-20001,'No player.py with this name or id exists!');
            return null;
    end getUsersById;
    
    function getUsers ( v_rowStart number DEFAULT 0, 
                        v_rowCount number DEFAULT 0, 
                        v_playername player.playername%type DEFAULT null)  
    return tempTable as
        cursor lista_player is select id,playername,password,currentLoadout,inMatch,mmr,token,playerLevel from (
            select rownum as v_rownum,id,playername,password,currentLoadout,inMatch,mmr,token,playerLevel from 
            (
                select * from player order by id
            )
        ) where v_rownum >= v_rowStart and v_rownum < v_rowStart + v_rowCount;
        lista_player_row lista_player%rowtype;
        myReturnTable tempTable;
        n integer := 0;
    BEGIN
        myReturnTable := tempTable();
        open lista_player;
        if v_playername is not null then
            for item in (
                select id, playername, password, currentLoadout, inMatch, mmr, token, playerLevel
                    from (
                     select id as id, playername, password, currentLoadout, inMatch, mmr, token, playerLevel, rownum as rn
                        from player
                        where playername like '%' || v_playername || '%')
                    where rn >= v_rowStart and rn < v_rowStart + v_rowCount
                ) loop
                myReturnTable.extend;
                n := n + 1;
                myReturnTable(n) := tempTableObject(item.id,
                                                    item.playername,
                                                    item.password,
                                                    item.currentLoadout,
                                                    item.inMatch,
                                                    item.mmr,
                                                    item.token,
                                                    item.playerLevel
                                                    );
            end loop;
            close lista_player;
            return myReturnTable;
        else if (v_rowCount != 0 and v_rowCount != 0) then
                loop
                  fetch lista_player into lista_player_row;
                  exit when lista_player%notfound or v_rowCount = n;
                  myReturnTable.extend;
                  n := n + 1;
                  myReturnTable(n) := tempTableObject(lista_player_row.id,
                                                      lista_player_row.playername,
                                                      lista_player_row.password,
                                                      lista_player_row.currentLoadout,
                                                      lista_player_row.inMatch,
                                                      lista_player_row.mmr,
                                                      lista_player_row.token,
                                                      lista_player_row.playerLevel
                                                      );
                end loop;
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
            raise_application_error(-20001,'No player.py with this name or id exists!');
            return NULL;
        when noPlayers_exception then
            raise_application_error(-20004,'No more players!');
            return NULL;
    end getUsers;

    procedure addPlayer(playername player.playername%type, password player.password%type) is
    begin
        insert into Player values(playeridseq.nextval, playername, getSaltedPassword(password, null), null, 0, 1000,null, 1);
    exception
        when DUP_VAL_ON_INDEX then
            raise_application_error(-20001,'A player.py with the same name already exists!');
    end addPlayer;
    
    procedure deletePlayer(playerId player.id%type) is
    begin
        delete from Player where
            id = playerId;
    exception
        when NO_DATA_FOUND then
            raise_application_error(-20001,'No player.py with this name or id exists!');
        when INVALID_NUMBER then
            raise_application_error(-20003,'Invalid number');
    end deletePlayer;
    
    procedure updatePlayer( v_playerId player.id%type,
                            v_playername player.playername%type DEFAULT NULL, 
                            v_password player.password%type DEFAULT NULL,
                            v_currentLoadout player.currentLoadout%type DEFAULT NULL,
                            v_inMatch player.inMatch%type DEFAULT NULL,
                            v_mmr player.mmr%type DEFAULT NULL,
                            v_token player.token%type DEFAULT null,
                            v_playerLevel player.playerLevel%type DEFAULT NULL
                            ) is
        player_row player%rowtype;
    begin
        select * into player_row from player where id = v_playerId;
        if v_playername is not null then
            update player set playername = v_playername where id = v_playerId;
        end if;
        if v_password is not null then
            update player set password = getSaltedPassword(v_password, null) where id = v_playerId;
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
        if v_token is not null then
            update player set token = v_token where id = v_playerId;
        end if;
        if v_playerLevel is not null then
            update player set playerLevel = v_playerLevel where id = v_playerId;
        end if;
    exception
        when DUP_VAL_ON_INDEX then
            raise_application_error(-20000,'A player.py with the same name already exists!');
         when NO_DATA_FOUND then
            raise_application_error(-20001,'No player.py with this name or id exists!');
    end updatePlayer;

    function checkSaltedPassword(p_playername player.playername%type,
                                 p_test_password varchar2)
        return number as
        target_password player.password%type;
        check_salted player.password%type;
        salt_end number;
        salt varchar2(97);
    begin
        select password into target_password
            from player
            where playername = p_playername;
        
        salt_end := instr(target_password, '-');
        salt := utl_raw.cast_to_varchar2(hextoraw((substr(target_password, 1, salt_end - 1))));
        check_salted := user_ops.getSaltedPassword(p_test_password, salt);

        if check_salted = target_password then
            return 1;
        else
            return 0;
        end if;
    end checkSaltedPassword;
end;
