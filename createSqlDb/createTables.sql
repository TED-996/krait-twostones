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
drop table Flag cascade constraints;

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
    password VARCHAR2(97) NOT NULL,
    currentLoadout NUMBER(10),
    inMatch NUMBER(1),
    mmr NUMBER(5),
    token varchar2(32),
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
        REFERENCES Player(id) on delete cascade,

    constraint onDeletePlayer2Match
        FOREIGN key(player2)
        REFERENCES Player(id) on delete cascade
);

CREATE TABLE MATCHHISTORY (
    id NUMBER(10) PRIMARY KEY,
    player1Id NUMBER(10),
    player2Id NUMBER(10),
    score1 NUMBER(1) NOT NULL,
    score2 NUMBER(1) NOT NULL,
    mapId NUMBER(2) not null,
    matchStart TIMESTAMP NOT NULL,
    duration NUMBER(10) NOT NULL,

    constraint onDeletePlayer1MatchHistory
        FOREIGN key(player1Id)
        REFERENCES Player(id) on delete set null,

    constraint onDeletePlayer2MatchHistory
        foreign key(player2Id)
        references player(id) on delete set null,

    constraint onDeleteMapMatchHistory
        FOREIGN KEY (mapId)
        REFERENCES Map(id) on delete set null
);

CREATE TABLE QUEUE(
    playerId NUMBER(10) not null unique,
    timeStarted TIMESTAMP,
    priority NUMBER (2),
    joinResponse NUMBER(1),
    matchReady NUMBER(1),

    constraint onDeletePlayerQueue
        FOREIGN key(playerId)
        REFERENCES Player(id) on delete cascade
);

CREATE TABLE Loadout(
    id NUMBER(10) PRIMARY KEY,
    name VARCHAR2(30) DEFAULT 'Temp Loadout',
    playerId NUMBER(10) not null,

    constraint onDeletePlayerLoadout
        FOREIGN key(playerId)
        REFERENCES Player(id) on delete cascade
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
        REFERENCES TroopClass(id) on delete cascade
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
    loadoutId number(10) not null,
    skinId number(10) references skin(id),

    CONSTRAINT onDeleteTroopClassTroop
        FOREIGN KEY (classId)
        REFERENCES TroopClass(id) on delete cascade,
    
    CONSTRAINT onDeleteSkinTroop
        FOREIGN KEY (skinId)
        REFERENCES skin(id) on delete cascade
);


create table TroopModifier (
    troopId number(10) not null,
    modifierId number(4) not null,
    constraint PK_TM PRIMARY KEY (troopId, modifierId),
    
    CONSTRAINT onDeleteTroopTroopModifier
        FOREIGN KEY (troopId)
        REFERENCES Troop(id) on delete cascade,

    CONSTRAINT onDeleteModifierTroopModifier
        FOREIGN KEY (modifierId)
        REFERENCES Modifier(id) on delete cascade
);

CREATE TABLE MATCHTROOP(
    id NUMBER(10) primary key,
    matchId number(10) not null,
    troopId NUMBER(10) not null,
    xAxis NUMBER(10),
    yAxis NUMBER(10),
    hp NUMBER(3),
    respawnTime NUMBER(1),
    moveReady number(1),
    attackReady number(1),

    CONSTRAINT onDeleteMatchMatchTroop
        FOREIGN KEY (matchId)
        REFERENCES Match(id) on delete cascade,

    CONSTRAINT onDeleteTroopMatchTroop
        FOREIGN KEY (troopId)
        REFERENCES Troop(id) on delete cascade
);

create table Flag(
    matchId number(10) not null,
    flagIdx number(1) not null,
    xAxis number(10),
    yAxis number(10),
    carryingTroop number(10),
    
    constraint flag_pk
      primary key(matchId, flagIdx),
    constraint flagMatchId
      foreign key (matchId)
      references match(id) on delete cascade,
    constraint flagCarryingTroop
      foreign key(carryingTroop)
      references matchtroop(id) on delete cascade
);

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
    start with 1
    minvalue 1
    maxvalue 9999
    cycle;
