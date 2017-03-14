fd = open("createTemp.sql", "w")
fd2 = open("usernames.txt", 'r')
fd.write('create table temp (playername varchar2(30));\n')
for i in fd2.readlines():
    i = i.strip()
    fd.write("insert into temp values('" + i + "');\n")

fd.close()
