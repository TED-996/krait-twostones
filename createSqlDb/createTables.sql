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
    player1 NUMBER(10) REFERENCES Player(id),
    player2 NUMBER(10) REFERENCES Player(id),
    turn NUMBER(4),
    turnStartTime DATE,
    score1 NUMBER(4),
    score2 NUMBER(4),
    mapId NUMBER(4) REFERENCES MAP(id),
    timeStarted TIMESTAMP NOT NULL
);

CREATE TABLE MATCHHISTORY (
    id NUMBER(10) PRIMARY KEY,
    player1Id NUMBER(10) REFERENCES Player(id),
    player2Id NUMBER(10) REFERENCES Player(id),
    score1 NUMBER(1) NOT NULL,
    score2 NUMBER(1) NOT NULL,
    mapId NUMBER(2) REFERENCES Map(id),
    matchStart TIMESTAMP NOT NULL,
    duration NUMBER(10) NOT NULL
);

CREATE TABLE QUEUE(
    playerId NUMBER(10) references player(id),
    timeStarted TIMESTAMP
);

CREATE TABLE Loadout(
    id NUMBER(10) PRIMARY KEY,
    playerId NUMBER(10) REFERENCES Player(id)
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
    classId NUMBER(10) NOT NULL REFERENCES TroopClass(id),
    filename VARCHAR2(128)
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
    classId number(4) references TroopClass(id),
    playerId number(10) references Player(id),
    loadoutId number(10) references Loadout(id),
    maxHp number(3),
    dmg number(3),
    atkRange number(2),
    moveRange number(2),
    skinId number(10) references skin(id)
);

create table TroopModifier (
    troopId number(10) references Troop(id),
    modifierId number(4) references Modifier(id),
    constraint PK_TM PRIMARY KEY (troopId, modifierId)
);

CREATE TABLE MATCHTROOP(
    id NUMBER(10) primary key,
    matchId number(10) references match(id),
    troopId NUMBER(10) REFERENCES TROOP(id),
    xAxis NUMBER(10),
    yAxis NUMBER(10),
    hp NUMBER(3),
    respawnTime NUMBER(1)
);

alter table Player
    modify (currentLoadout references Loadout(id));


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
