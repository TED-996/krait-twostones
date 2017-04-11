start "createTables.sql";

start "createTemp.sql";
start "populateUser.sql";
drop table temp;
start "populateTroopclass.sql";
start "populateMap.sql";
start "populateModifiers.sql";
start "populateSkin.sql";
start "populateTroops.sql";
start "./part2/sitePackage.sql";