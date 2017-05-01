1. index:
	* Link to login (simple)
	* Link to register (simple)
	* Link to dashboard (if logged in)
	* no header (?)
2. header:
	* Name
	* link to login / dashboard (depending on login)
	* example: Trello
3. login:
	* input: optional "error_messages"
	* Header
	* Link to register
	* Form: "username" + "password"; POST to login_test
	* Error messages (received by query, "error_messages")
4. register:
	* input: optional "error_messages"
	* Header
	* Link to login
	* Form: "username" + "password"; POST to register_execute
	* Error messages (received by query, "error_messages")
5. login_test, by POST:
	* input: "username", "password"
	* test if user exists + password is correct
	* if so, set cookie (TODO) - meanwhile, set GET argument (maybe a token?) + REDIRECT la dashboard
	* else, REDIRECT to login?error_messages=...
6. register_execute, by POST:
	* input: "username", "password"
	* test if user does not exist + username allowed + etc.
	* if ok, insert and REDIRECT to index
	* otherwise, REDIRECT to register?error_messages=...
7. dashboard:
	* input: username (token?) - ideally cookie, otherwise query argument
	* Header
	* loadout list
		* radio button to choose active loadout (Ajax request to set_active_loadout?loadout_id=...)
		* link to edit_loadout?loadout_id=...;
		* (for both, send username as GET argument if not cookie)
		* "+" button to add a new one (link to edit_loadout?loadout_id=new)
	* large "find match" button <-> "cancel" - text depending on current state, changed with JS
		* on click: AJAX to set_matchmaking_status?status=... ("in_queue" / "standby" - TODO status names)
		* if in MM, every 1s (for example, TODO) send Ajax request to get_matchmaking_status (TODO: JSON/plaintext)
			* if "in_queue", do nothing
			* if "joining", show a relevant message (match found, awaiting player confirmation) + set_matchmaking_status?status=joining to confirm
			* if "ready", set_matchmaking_status?status=in_game to confirm then REDIRECT to game
			* if "failed", set_matchmaking_status?status=standby to confirm, show failure message (could not find match/other player disconnected/etc)
			* get_matchmaking_status also works as a heartbeat (if missing for more than a few seconds, remove from queue)
8. get_matchmaking_status:
	* input: username (see above)
	* queries Queue table
	* !! attempts matchmaking: no background processes allowed
	* cleans up Queue table for out-of-heartbeat clients
	* TODO
9. set_matchmaking_status, by POST:
	* input: username (see above) + status
	* inserts / removes / sets data in Queue
	* confirms matchmaking actions
	* !! returns Bad Request / etc. in case of failure!
8. set_active_loadout, by POST:
	* input: username (see above) + loadout_id
	* checks if loadout belongs to user
	* if so, sets the loadout in the Player table
9. edit_loadout:
	* input: loadout_id: either a numeric ID or "new" + username (see above)
	* if "new": insert a new loadout (a new default set of troops)
	* list of troops:
		* for each, multiple buttons with pictures: class slot (class image inside), modifier slots
		* tooltips for each slot with info + currently selected
	* "apply" button: POST to save_loadout with new information (JSON probably, id + troops [class + modifiers + skin])
10. save_loadout, by POST:
	* input: JSON with id + troops (class + modifiers + skin) + username (see above)
	* tests if data is valid and allowed (own loadout, unlocked modifiers + skin, etc.)
	* if so, clean up the old loadout + update the new one (and troops)
	* !! returns Bad Request / etc. in case of failure!
10. game:
	* input: username (see above)
	* Header
	* fetches data from MM queue/etc
	* removes the two players from the queue, inserts a new Match
	* contains the Phaser canvas
	* client-size: opens WebSockets connection to game_socket
11. game_socket, by WebSockets:
	* input: username (see above)
	* MUST be an Upgrade: WebSockets
	* do the hanshake (Krait-side)
	* Handle multiplayer communication
12. show_user:
	* input: username (see above), target_username
	* current username: lock feature to logged in users
	* list username + level (+- MMR) + **current** loadout (visible)