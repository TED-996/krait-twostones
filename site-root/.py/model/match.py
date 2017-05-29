class Match(object):
    def __init__(self, match_id, player1_id, player2_id, turn, turn_start_time, score1, score2, map_id, time_started):
        self.id = match_id
        self.player1_id = player1_id
        self.player2_id = player2_id
        self.turn = turn
        self.turn_start_time = turn_start_time
        self.score1 = score1
        self.score2 = score2
        self.map_id = map_id
        self.time_started = time_started
