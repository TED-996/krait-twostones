class MatchHistory(object):
    def __init__(self, matchHistoryId, player1_id, player2_id, score1, score2, map_id, match_start, duration):
        self.id = matchHistoryId
        self.player1_id = player1_id
        self.player2_id = player2_id
        self.score1 = score1
        self.score2 = score2
        self.map_id = map_id
        self.match_start = match_start
        self.duration = duration
        