import os
import hashlib
import string
import random


def to_salted_hash(password, salt=None):
    if salt is None:
        salt = os.urandom(16).encode("hex")

    return salt + '-' + hashlib.sha256(salt + password).hexdigest()


def check_password(password, salted_hash):
    salt_idx = salted_hash.index('-')
    salt = salted_hash[:salt_idx]
    return to_salted_hash(password, salt) == salted_hash


fd = open('name.txt', 'rb')
fd_write = open('createTemp.sql', 'w')
fd_write.write(
    'drop table temp;\ncreate table temp (id number primary key, playername varchar2(30),password varchar(97));\ndrop sequence tempIdSeq;\ncreate sequence tempIdSeq start with 1;\nbegin\n')
for item in fd.readlines():
    name = item.strip()
    password = ''.join(random.choice(string.ascii_lowercase)
                       for _ in range(12))
    password = to_salted_hash(password)
    fd_write.write("insert into temp values(tempIdSeq.nextval, '" +
                   name + "', '" + password + "');\n")

fd_write.write('end;')
fd.close()
fd_write.close()
