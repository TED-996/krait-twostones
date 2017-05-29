create or replace directory logfile as 'C:\Stuff\ProiectTW\TW\createSqlDb';
/
declare
  --declare dbms_metadata
  cursor walk_trigger is 
    select 
       replace(replace(replace(dbms_metadata.GET_DDL(object_type,object_name,'WEGASADMIN'),'WEGASADMIN',''),'"',''),'.','')  as "data"
    from 
       all_objects
    where 
       owner = 'WEGASADMIN' and
      (
        object_type = 'TRIGGER'
      );
  walk_trigger_row walk_trigger%rowtype;
  
  cursor walk is 
    select 
       replace(replace(replace(dbms_metadata.GET_DDL(object_type,object_name,'WEGASADMIN'),'WEGASADMIN',''),'"',''),'.','')  as "data"
    from 
       all_objects
    where 
       owner = 'WEGASADMIN' and
      (
        (object_type = 'INDEX' and generated = 'N')  or
        object_type = 'VIEW'
    );
  walk_row walk%rowtype;

  --declare cursor for table and inserts
  cursor cursor_nume_tabele is
    select object_name from all_objects where owner = 'WEGASADMIN' and
      object_type = 'TABLE';
  cursor_nume_tabele_row cursor_nume_tabele%rowtype;
  select_coloane varchar2(200) := 'select column_name,data_type,nullable from all_tab_columns where owner = :student and table_name = :table_name';
  cursor_coloane int;
  num_rows int;
  v_column_name varchar2(200);
  v_data_type varchar2(200);
  v_nullable varchar2(200);
  v_create_table_string varchar2(2000);
  v_file UTL_FILE.FILE_TYPE;
  cursor tables_walk is
  select object_name from all_objects where owner = 'WEGASADMIN' and
  (
    object_type = 'TABLE'
  );
  tables_walk_row tables_walk%rowtype;
  nr_rows int;
  cursor_insert int;
  v_insert_stmt varchar2(3000);

  --declare cursor for procedures and functions and packages
  cursor cursor_proceduri is
    select object_name, object_type from all_objects where owner like 'WEGASADMIN' and (object_type like 'PROCEDURE' or object_type like 'FUNCTION' or object_type like 'TYPE' or Object_Type like 'PACKAGE' or Object_Type like 'PACKAGE BODY') order by object_id;
  cursor_proceduri_row  cursor_proceduri%rowtype;  
  stmt_proceduri VARCHAR2(300);
  cursor_dinamic_proceduri int;
  raspuns_proceduri varchar2(300);
  
  --declare cursor for sequences
  cursor cursor_sequence is
    select * from all_sequences where sequence_owner like 'WEGASADMIN';
  cursor_sequence_row cursor_sequence%rowtype;

  --delcare cursor for constraints
  cursor cursor_constraints is
    select * from user_constraints order by constraint_type;
  cursor_constraints_row cursor_constraints%rowtype;
  constraints_column_name varchar2(400) := '';
  constraints_foreign_table varchar2(400);
  constraints_foreign_column varchar2(400);
  stmt_constraints varchar2(400);
  cursor_dinamic_constraints int;
  raspuns_constraints varchar2(300);

begin
  --generate create tables
  v_file := UTL_FILE.FOPEN('LOGFILE', 'repopulateDb.sql', 'W');
  open cursor_nume_tabele;
  loop
    fetch cursor_nume_tabele into cursor_nume_tabele_row;
    exit when cursor_nume_tabele%notfound;
    v_create_table_string := 'create table '||cursor_nume_tabele_row.object_name||' (  ';
    cursor_coloane := dbms_sql.open_cursor;
    dbms_sql.parse(cursor_coloane,select_coloane,dbms_sql.native);
    dbms_sql.define_column(cursor_coloane,1,v_column_name,30);
    dbms_sql.define_column(cursor_coloane,2,v_data_type,30);
    dbms_sql.define_column(cursor_coloane,3,v_nullable,30);
    dbms_sql.bind_variable(cursor_coloane,'table_name',cursor_nume_tabele_row.object_name);
    dbms_sql.bind_variable(cursor_coloane,'student','WEGASADMIN');
    num_rows := dbms_sql.execute(cursor_coloane);
    loop
      if dbms_sql.fetch_rows(cursor_coloane) > 0 then
        dbms_sql.column_value(cursor_coloane,1,v_column_name);
        dbms_sql.column_value(cursor_coloane,2,v_data_type);
        dbms_sql.column_value(cursor_coloane,3,v_nullable);
        if v_data_type like 'VARCHAR2' then
          v_data_type := v_data_type||'(100)';
        end if;
        if v_nullable like 'N' then
          v_create_table_string := v_create_table_string||v_column_name||' '||v_data_type||' NOT NULL, ';
        else
          v_create_table_string := v_create_table_string||v_column_name||' '||v_data_type||', ';
        end if;
      else
        exit;
      end if;
    end loop;
    dbms_sql.close_cursor(cursor_coloane);
    v_create_table_string := substr(v_create_table_string,0,length(v_create_table_string)-2) ||');';
    utl_file.put_line(v_file,v_create_table_string);
  end loop;
  close cursor_nume_tabele;
  
  --generate sequencecs
  open cursor_sequence;
  loop
    fetch cursor_sequence into cursor_sequence_row;
    exit when cursor_sequence%notfound;
    utl_file.put(v_file,'create sequence ');
    utl_file.put_line(v_file,cursor_sequence_row.sequence_name);
    utl_file.put(v_file,'start with ');
    utl_file.put_line(v_file,cursor_sequence_row.min_value);
    utl_file.put(v_file,'minvalue ');
    utl_file.put_line(v_file,cursor_sequence_row.min_value);
    utl_file.put(v_file,'maxvalue ');
    utl_file.put(v_file,cursor_sequence_row.max_value);
    if cursor_sequence_row.cycle_flag = 'Y' then
      utl_file.put_line(v_file,' ');
      utl_file.put_line(v_file,'cycle;');
    else
      utl_file.put_line(v_file,';');
    end if;
    
  end loop;
  close cursor_sequence;
  utl_file.put_line(v_file,'/ ');
  
  open walk_trigger;
  loop
    fetch walk_trigger into walk_trigger_row;
    exit when walk_trigger%notfound;
    utl_file.put_line(v_file,walk_trigger_row."data");
    utl_file.put_line(v_file,'/');
  end loop;
  close walk_trigger;

  --generate procedures and functions and packages
  open cursor_proceduri;
  loop
    fetch cursor_proceduri into cursor_proceduri_row;
    exit when cursor_proceduri%notfound;
    stmt_proceduri := 'select text from all_source where name = :name and type = :type and owner = :owner order by line';
    cursor_dinamic_proceduri := dbms_sql.open_cursor();
    dbms_sql.parse(cursor_dinamic_proceduri,stmt_proceduri,dbms_sql.native);
    dbms_sql.bind_variable(cursor_dinamic_proceduri,'name',cursor_proceduri_row.object_name);
    dbms_sql.bind_variable(cursor_dinamic_proceduri,'type',cursor_proceduri_row.object_type);
    dbms_sql.bind_variable(cursor_dinamic_proceduri,'owner','WEGASADMIN');
    dbms_sql.define_column(cursor_dinamic_proceduri,1,raspuns_proceduri,300);
    num_rows := dbms_sql.execute(cursor_dinamic_proceduri);
    utl_file.put_line(v_file,' ');
    utl_file.put(v_file,'create or replace ');
    loop
      if dbms_sql.fetch_rows(cursor_dinamic_proceduri) > 0 then
        dbms_sql.column_value(cursor_dinamic_proceduri,1,raspuns_proceduri);
        utl_file.put(v_file,raspuns_proceduri);
      else
        exit;
      end if;
    end loop;
    dbms_sql.close_cursor(cursor_dinamic_proceduri);
    utl_file.put_line(v_file,'');
    utl_file.put_line(v_file,'/');
  end loop;
  close cursor_proceduri;
  --generate inserts
  open cursor_nume_tabele;
  loop
    fetch cursor_nume_tabele into cursor_nume_tabele_row;
    exit when cursor_nume_tabele%notfound;
    v_create_table_string := '''insert into '||cursor_nume_tabele_row.object_name||' values ( '' ';
    cursor_coloane := dbms_sql.open_cursor;
    dbms_sql.parse(cursor_coloane,select_coloane,dbms_sql.native);
    dbms_sql.define_column(cursor_coloane,1,v_column_name,30);
    dbms_sql.define_column(cursor_coloane,2,v_data_type,30);
    dbms_sql.define_column(cursor_coloane,3,v_nullable,30);
    dbms_sql.bind_variable(cursor_coloane,'table_name',cursor_nume_tabele_row.object_name);
    dbms_sql.bind_variable(cursor_coloane,'student','WEGASADMIN');
    num_rows := dbms_sql.execute(cursor_coloane);
    loop
      if dbms_sql.fetch_rows(cursor_coloane) > 0 then
        dbms_sql.column_value(cursor_coloane,1,v_column_name);
        dbms_sql.column_value(cursor_coloane,2,v_data_type);
        if (v_data_type not like 'VARCHAR2' and v_data_type not like 'CLOB')  then
          v_create_table_string := v_create_table_string||' || nvl(to_char('||v_column_name||'),''NULL'') || '',  '' ';
        else
          v_create_table_string := v_create_table_string||' ||  nvl('||' ''''''''|| replace(replace(replace('||v_column_name||',''""'',''""''),''/'',''//''),'''''''','''''''') ||'''''''' '||',''NULL'') || '',  '' ';
        end if;
      else 
        exit;
      end if;
    end loop;
    dbms_sql.close_cursor(cursor_coloane);
    v_create_table_string := 'select '||substr(v_create_table_string,0,length(v_create_table_string)-9) ||' ||'');'' from '||cursor_nume_tabele_row.object_name;
    --utl_file.put_line(v_file,v_create_table_string);
    cursor_insert := dbms_sql.open_cursor;
    dbms_sql.parse(cursor_insert,v_create_table_string,dbms_sql.native);
    dbms_sql.define_column(cursor_insert,1,v_insert_stmt,3000);
    nr_rows := dbms_sql.execute(cursor_insert);
    loop
      if dbms_sql.fetch_rows(cursor_insert) > 0 then
        dbms_sql.column_value(cursor_insert,1,v_insert_stmt);
        utl_file.put_line(v_file,v_insert_stmt);
      else
        exit;
      end if;
    end loop;
    dbms_sql.close_cursor(cursor_insert);
  end loop;
  close cursor_nume_tabele;

  --generate constraints
  open cursor_constraints;
  loop
    fetch cursor_constraints into cursor_constraints_row;
    exit when cursor_constraints%notfound;
    if cursor_constraints_row.constraint_name not like 'BIN%' then
      case
        when cursor_constraints_row.constraint_type like 'C' then
          continue;
        when cursor_constraints_row.constraint_type like 'P' then
          utl_file.put(v_file,'alter table ');
          utl_file.put(v_file, cursor_constraints_row.table_name);
          utl_file.put(v_file, ' add constraint ');
          utl_file.put(v_file,cursor_constraints_row.constraint_name);
          utl_file.put(v_file,' primary key (');
          stmt_constraints := 'select column_name from user_cons_columns where constraint_name = :nume_cons';
          cursor_dinamic_constraints := dbms_sql.open_cursor();
          dbms_sql.parse(cursor_dinamic_constraints, stmt_constraints,dbms_sql.native);
          dbms_sql.bind_variable(cursor_dinamic_constraints,'nume_cons',cursor_constraints_row.constraint_name);
          dbms_sql.define_column(cursor_dinamic_constraints,1,raspuns_constraints,300);
          num_rows := dbms_sql.execute(cursor_dinamic_constraints);
          if dbms_sql.fetch_rows(cursor_dinamic_constraints) > 0 then
              dbms_sql.column_value(cursor_dinamic_constraints,1,raspuns_constraints);
              utl_file.put(v_file,raspuns_constraints);
          end if;
          loop
            if dbms_sql.fetch_rows(cursor_dinamic_constraints) > 0 then
              dbms_sql.column_value(cursor_dinamic_constraints,1,raspuns_constraints);
              utl_file.put(v_file,',');
              utl_file.put(v_file,raspuns_constraints);
            else
              exit;
            end if;
          end loop;
          dbms_sql.close_cursor(cursor_dinamic_constraints);
          utl_file.put(v_file,' );');
          utl_file.put_line(v_file,' ');
          utl_file.put_line(v_file,'/ ');
        when cursor_constraints_row.constraint_type like 'U' then
          utl_file.put(v_file,'alter table ');
          utl_file.put(v_file, cursor_constraints_row.table_name);
          utl_file.put(v_file, ' add constraint ');
          utl_file.put(v_file,cursor_constraints_row.constraint_name);
          utl_file.put(v_file,' unique (');
          stmt_constraints := 'select column_name from user_cons_columns where constraint_name = :nume_cons';
          cursor_dinamic_constraints := dbms_sql.open_cursor();
          dbms_sql.parse(cursor_dinamic_constraints, stmt_constraints,dbms_sql.native);
          dbms_sql.bind_variable(cursor_dinamic_constraints,'nume_cons',cursor_constraints_row.constraint_name);
          dbms_sql.define_column(cursor_dinamic_constraints,1,raspuns_constraints,300);
          num_rows := dbms_sql.execute(cursor_dinamic_constraints);
          if dbms_sql.fetch_rows(cursor_dinamic_constraints) > 0 then
              dbms_sql.column_value(cursor_dinamic_constraints,1,raspuns_constraints);
              utl_file.put(v_file,raspuns_constraints);
          end if;
          loop
            if dbms_sql.fetch_rows(cursor_dinamic_constraints) > 0 then
              dbms_sql.column_value(cursor_dinamic_constraints,1,raspuns_constraints);
              utl_file.put(v_file,',');
              utl_file.put(v_file,raspuns_constraints);
            else
              exit;
            end if;
          end loop;
          dbms_sql.close_cursor(cursor_dinamic_constraints);
          utl_file.put(v_file,' );');
          utl_file.put_line(v_file,' ');
          utl_file.put_line(v_file,'/ ');
        when cursor_constraints_row.constraint_type like 'R' and cursor_constraints_row.generated not like 'GENERATED NAME' then
          utl_file.put(v_file,'alter table ');
          utl_file.put(v_file, cursor_constraints_row.table_name);
          utl_file.put(v_file, ' add constraint ');
          utl_file.put(v_file,cursor_constraints_row.constraint_name);
          select column_name into constraints_column_name from user_cons_columns where constraint_name like cursor_constraints_row.constraint_name;
          select table_name,column_name into constraints_foreign_table,constraints_foreign_column from user_cons_columns where constraint_name like cursor_constraints_row.r_constraint_name;
          utl_file.put(v_file, ' foreign key (');
          utl_file.put(v_file, constraints_column_name);
          utl_file.put(v_file, ') ');
          utl_file.put(v_file,' references ');
          utl_file.put(v_file,constraints_foreign_table);
          utl_file.put(v_file, '(');
          utl_file.put(v_file,constraints_foreign_column);
          utl_file.put(v_file, ')');
          if cursor_constraints_row.delete_rule like 'CASCADE' then
            utl_file.put(v_file,' on delete cascade');
          end if;
          utl_file.put_line(v_file,';');
          utl_file.put_line(v_file,'/');
        else
         continue;
      end case;
    end if;
  end loop;
  close cursor_constraints;
  
  --generate index and views
  open walk;
  loop
    fetch walk into walk_row;
    exit when walk%notfound;
    utl_file.put_line(v_file,walk_row."data");
    utl_file.put_line(v_file,'/');
  end loop;
  close walk;
  
  utl_file.fclose(v_file);
end;
