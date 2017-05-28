class Match(object):
    def __init__(self, match_id, player1, player2, turn, turn_start_time, score1, score2, map_id, time_started):
        self.id = match_id
        self.player1 = player1
        self.player2 = player2
        self.turn = turn
        self.turnStartTime = turn_start_time
        self.score1 = score1
        self.score2 = score2
        