import json
import urllib

import db_ops
from models import user
from exceptions import printException, printf

class UserConsoleController(object):
	items_per_page = 20

	def __init__(self, request):
		# List of strings, each is an error. Add with self.error_messages.append(error_message)
		self.error_messages = []

		db_conn = db_ops.get_connection()
		
		query = request.query
		self.page = query.get("page", 1)
		self.max_page = self.get_page_count(db_conn)
		self.filter = query.get("filter", None)
		
		error_msg_json = query.get("errors", None)
		if errors is not None:
			self.error_messages += json.loads(error_msg_json)
		
		# List of objects of type User 
		self.users = self.get_users(db_conn, self.page, self.filter)

		self.fetch_id = query.get("fetch_id", "")
		if self.fetch_id is not "":
			fetch_user = self.get_user(self.fetch_id)
			self.fetch_username, self.fetch_password, self.fetch_mmr, self.fetch_level =\
				fetch_user.name, "", fetch_user.mmr, fetch_user.playerLevel
		else:
			self.fetch_username, self.fetch_password, self.fetch_mmr, self.fetch_level = "", "", "", ""

		self.page_prev_url = None if page == 1 else build_link(self.page - 1, self.filter, self.fetch_id)
		self.page_next_url = None if page == self.max_page else build_link(self.page + 1, self.filter, self.fetch_id)

		min_page = max(page - 2, 1)
		self.pages = [(nr, build_link(nr, self.filter, self.fetch_id)) for nr in xrange(min_page, self.max_page + 1)]

		# TODO: handle errors and add error messages
		
	def get_users(self, conn, page, name_filter):
		cursor = conn.cursor()
		try
			cursor.execute("select * from user_ops.get_users(:row_start, :row_count, :filter",
				{
					"row_start": (page - 1) * items_per_page + 1,
					"row_count": items_per_page
					"filter": "" if filter is None else filter
				}
			)
			return [users.User(*row) for row in cursor]
		except cx_Oracle.DatabaseError, exception:
			printf('Failed to get users from WEGAS\n')
			printException(exception)
			exit(1)

	def get_user(self, user_id):
		cursor = conn.cursor()
		cursor.execute("select * from players where id = :id", {"id": user_id})
		return users.User(*(cursor.fetchone()))

	def get_page_count(self, conn):
		cursor = conn.cursor()
		cursor.execute("select count(*) from players")


	def get_view(self):
		return ".view/admin/user_console.html"


def build_link(page, name_filter, fetch_id):
	link_base = "/admin/user_console"
	if page is None and filter is None and fetch_id is None:
		return link_base
	
	link_query = link_base + "?"
	link_chr = ""

	if page is not None:
		link_query += link_chr + urllib.quote_plus(page)
		link_ckr = '&'

	if name_filter is not None:
		 link_query += link_chr + urllib.quote_plus(name_filter)
		 link_chr = '&'

	if fetch_id is not None:
		link_query += link_chr + urllib.quote_plus(str(fetch_id))
		link_chr = '&'

	return link_query

