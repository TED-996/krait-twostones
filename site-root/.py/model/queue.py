class Queue(object):
    def __init__(self, player_id, time_started, priority, join_response, match_ready):
        self.player_id = player_id
        self.time_started = time_started
        self.priority = priority
        self.join_response = join_response
        self.match_ready = match_ready
