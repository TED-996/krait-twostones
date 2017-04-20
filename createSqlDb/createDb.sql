DROP TABLESPACE wegas INCLUDING CONTENTS CASCADE CONSTRAINTS; 

CREATE TABLESPACE wegas
  DATAFILE 'wegas_perm_0001.dat' 
    SIZE 500M
    REUSE
    AUTOEXTEND ON NEXT 50M MAXSIZE 4000M
/
    
CREATE TEMPORARY TABLESPACE wegas
  TEMPFILE 'wegas_temp_0001.dbf'
    SIZE 5M
    AUTOEXTEND ON
/    

CREATE UNDO TABLESPACE wegas
  DATAFILE 'wegas_undo_0001.dbf'
    SIZE 5M 
    AUTOEXTEND ON
  RETENTION GUARANTEE
/

drop user wegasAdmin cascade;
create user wegasAdmin identified by &wegas_password;
alter user wegasAdmin default tablespace wegas quota 4096M on wegas;

grant connect to wegasAdmin;
grant all privileges to wegasAdmin;
grant execute on DBMS_CRYPTO to wegasAdmin;