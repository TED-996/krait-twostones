import hashlib
import os
import base64

def to_salted_hash(password, salt=None):
	if salt is None:
		salt = os.urandom(16).encode(hex)
	
	return salt + '-' + hashlib.sha256(salt + password).hexdigest()


def check_password(password, salted_hash):
	salt_idx = salted_hash.index('-')
	salt = salted_hash[:salt_idx]
	return to_salted_hash(password, salt) == salted_hash