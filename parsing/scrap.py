import json
with open('../_data/draft_season_41_players.json') as file:
    players = json.load(file)

playing = {}
for p in players:
    playing[p["Name"]] = "41"


file = "../_data/season_41_players.json"
with open(file, 'w') as filetowrite:
    # convert python dictionary to json and write it
    json.dump(playing, filetowrite)
