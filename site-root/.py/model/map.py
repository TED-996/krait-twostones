import json

class Map(object):
    def __init__(self, mapId, source_file):
        self.id = mapId
        self.source_file = source_file
        self.height = 0
        self.width = 0
        self.data = []
        self.parse_map()

    def parse_map(self):
        fd = open(self.source_file)
        map_json = json.load(fd)
        self.height = map_json['height']
        self.width = map_json['width']
        self.data = map_json['layers'][0]['data']
        self.data = [d-1 for d in self.data]
        fd.close()
