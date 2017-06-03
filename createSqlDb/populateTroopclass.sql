begin
  insert into troopclass values (
    troopclassIdSeq.nextval,
    'Tank',
    'Can take a lot of damage.',
    30,
    6,
    2,
    2,
    0
  );
  
  insert into troopclass values (
    troopclassIdSeq.nextval,
    'Infantry',
    'All-rounded soldier.',
    18,
    8,
    2,
    2,
    0
  );
  
  insert into troopclass values (
    troopclassIdSeq.nextval,
    'Runner',
    'Fast, but brittle.',
    10,
    5,
    3,
    4,
    0
  );
  
  insert into troopclass values (
    troopclassIdSeq.nextval,
    'Archer',
    'Can hit far away.',
    12,
    7,
    10,
    2,
    0
  );

end;