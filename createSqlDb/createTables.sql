set sqlblanklines on

DROP TABLE MAP cascade constraints;
DROP TABLE MATCH cascade constraints;
DROP TABLE MATCHTROOP cascade constraints;
DROP TABLE Player cascade constraints;
DROP TABLE LOADOUT cascade constraints;
DROP TABLE SKIN cascade constraints;
DROP TABLE TROOPCLASS cascade constraints;
DROP TABLE MODIFIER cascade constraints;
DROP TABLE TROOP cascade constraints;
DROP TABLE TROOPMODIFIER cascade constraints;
DROP TABLE MATCHHISTORY cascade constraints;
DROP TABLE QUEUE cascade constraints;

drop sequence playerIdSeq;
drop sequence mapIdSeq;
drop sequence matchIdSeq;
drop sequence matchHistoryIdSeq;
drop sequence loadoutIdSeq;
drop sequence troopClassIdSeq;
drop sequence skinIdSeq;
drop sequence modifierIdSeq;
drop sequence troopIdSeq;
drop sequence matchTroopIdSeq;

CREATE TABLE Player (
    id  NUMBER(10) PRIMARY KEY,
    playername VARCHAR2(30) NOT NULL,
    password VARCHAR2(30) NOT NULL,
    currentLoadout NUMBER(10),
    inMatch NUMBER(1),
    mmr NUMBER(5),
    playerLevel NUMBER(2),
    constraint UK_playername unique (playername)
);



CREATE TABLE MAP(
    id NUMBER(4) PRIMARY KEY,
    sourceFile VARCHAR2(128)
);


CREATE TABLE MATCH(
    id NUMBER(4) primary key,
    player1 NUMBER(10) not null,
    player2 NUMBER(10) not null,
    turn NUMBER(4),
    turnStartTime DATE,
    score1 NUMBER(4),
    score2 NUMBER(4),
    mapId NUMBER(4) REFERENCES MAP(id),
    timeStarted TIMESTAMP NOT NULL,

    constraint onDeletePlayer1Match
        FOREIGN key(player1)
        REFERENCES Player(id)
        on DELETE CASCADE,

    constraint onDeletePlayer2Match
        FOREIGN key(player2)
        REFERENCES Player(id)
	on delete cascade,

    constraint onDeleteMapMatch
        FOREIGN KEY (mapId)
        REFERENCES Map(id)
        ON DELETE CASCADE
);

CREATE TABLE MATCHHISTORY (
    id NUMBER(10) PRIMARY KEY,
    player1Id NUMBER(10) not null,
    player2Id NUMBER(10) not null,
    score1 NUMBER(1) NOT NULL,
    score2 NUMBER(1) NOT NULL,
    mapId NUMBER(2) not null,
    matchStart TIMESTAMP NOT NULL,
    duration NUMBER(10) NOT NULL,

    constraint onDeletePlayer1MatchHistory
        FOREIGN key(player1Id)
        REFERENCES Player(id)
        on DELETE CASCADE,

    constraint onDeletePlayer2MatchHistory
        foreign key(player2Id)
        references player(id)
        on delete cascade,


    constraint onDeleteMapMatchHistpry
        FOREIGN KEY (mapId)
        REFERENCES Map(id)
        ON DELETE CASCADE
);

CREATE TABLE QUEUE(
    playerId NUMBER(10) not null,
    timeStarted TIMESTAMP,

    constraint onDeletePlayerQueue
        FOREIGN key(playerId)
        REFERENCES Player(id)
        on DELETE CASCADE
);

CREATE TABLE Loadout(
    id NUMBER(10) PRIMARY KEY,
    playerId NUMBER(10) not null,

    constraint onDeletePlayerLoadout
        FOREIGN key(playerId)
        REFERENCES Player(id)
        on DELETE CASCADE
);

create table TroopClass (
    id number(4) primary key,
    name varchar2(20),
    description varchar2(255),
    maxHp number(3),
    dmg number(3),
    atkRange number(2),
    moveRange number(2),
    minLevel number(2)
);

CREATE TABLE Skin(
    id NUMBER(10) PRIMARY KEY,
    classId NUMBER(10) NOT NULL,
    filename VARCHAR2(128),

    CONSTRAINT onDeleteTroopClassSkin
        FOREIGN KEY (classId)
        REFERENCES TroopClass(id)
        ON DELETE CASCADE
);

create table Modifier (
    id number(4) primary key,
    name varchar2(20),
    maxHp number(2),
    dmg number(2),
    atkRange number(2),
    moveRange number(2),
    minLevel number(2)
);

create table Troop (
    id number(10) primary key,
    classId number(4) not null,
    playerId number(10) not null,
    loadoutId number(10) not null,
    maxHp number(3),
    dmg number(3),
    atkRange number(2),
    moveRange number(2),
    skinId number(10) references skin(id),

    CONSTRAINT onDeleteTroopClassTroop
        FOREIGN KEY (classId)
        REFERENCES TroopClass(id)
        ON DELETE CASCADE,

    constraint onDeletePlayerTroop
        FOREIGN key(playerId)
        REFERENCES Player(id)
        on DELETE CASCADE,

    CONSTRAINT onDeleteLoadoutTroop
        FOREIGN KEY (loadoutId)
        REFERENCES	Loadout(id)
        ON DELETE CASCADE,
    
    CONSTRAINT onDeleteSkinTroop
        FOREIGN KEY (skinId)
        REFERENCES skin(id)
        ON DELETE CASCADE
);

create table TroopModifier (
    troopId number(10) not null,
    modifierId number(4) not null,
    constraint PK_TM PRIMARY KEY (troopId, modifierId),
    
    CONSTRAINT onDeleteTroopTroopModifier
        FOREIGN KEY (troopId)
        REFERENCES Troop(id)
        ON DELETE CASCADE,

    CONSTRAINT onDeleteModifierTroopModifier
        FOREIGN KEY (modifierId)
        REFERENCES Modifier(id)
        ON DELETE CASCADE
);

CREATE TABLE MATCHTROOP(
    id NUMBER(10) primary key,
    matchId number(10) not null,
    troopId NUMBER(10) not null,
    xAxis NUMBER(10),
    yAxis NUMBER(10),
    hp NUMBER(3),
    respawnTime NUMBER(1),

    CONSTRAINT onDeleteMatchMatchTroop
        FOREIGN KEY (matchId)
        REFERENCES Match(id)
        ON DELETE CASCADE,

    CONSTRAINT onDeleteTroopMatchTroop
        FOREIGN KEY (troopId)
        REFERENCES Troop(id)
        ON DELETE CASCADE
);


ALTER TABLE Player
Add CONSTRAINT onDeleteLoadoutPlayer
    FOREIGN KEY (currentLoadout)
    REFERENCES	Loadout(id)
    ON DELETE CASCADE;

create sequence playerIdSeq
    start with 1;

create sequence mapIdSeq
    start with 1;

create sequence matchIdSeq
    start with 1
    minvalue 1
    maxvalue 9999
    cycle;

create sequence matchHistoryIdSeq
    start with 1;

create sequence loadoutIdSeq
    start with 1;

create sequence troopClassIdSeq
    start with 1;

create sequence skinIdSeq
    start with 1;

create sequence modifierIdSeq
    start with 1;

create sequence troopIdSeq
    start with 1;

create sequence matchTroopIdSeq
    start with 1;

create index skinByClass on skin(classId);
create index troopModfierByTroop on troopModifier(troopId)
