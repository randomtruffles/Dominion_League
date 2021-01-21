import json
# Open file containing all (pretty) league history
with open('./_data/friendly_league_history.json') as file:
    seasons = json.load(file)["seasons"]

versus_dict = {}

for season in seasons.keys():
    season_data = seasons[season]
    for division in season_data.keys():
        if division == "champion":
            continue
        results = season_data[division]["results"]

        for result in results:
            ignore = ["U1", "U2", "U3", "U4", "U5", "U6", "U7"]
            player1 = result["player1"]
            player2 = result["player2"]
            if player1 in ignore or player2 in ignore:
                continue
            wins1 = result["wins1"]
            wins2 = result["wins2"]
            ignorewins = ["Error", ""]
            if wins1 in ignorewins or wins2 in ignorewins:
                continue
            print(result)
            wins1 = float(wins1)
            wins2 = float(wins2)

            for player in [player1, player2]:
                opponent = player2 if player == player1 else player1
                key = player.lower().strip()

                wins = wins1 if player == player1 else wins2
                losses = wins2 if player == player1 else wins1
                if key not in versus_dict:
                    versus_dict[key] = {"name": player, "opponents":{}, "wins": 0, "losses":0, "count":0}
                if opponent not in versus_dict[key]["opponents"]:

                    versus_dict[key]["opponents"][opponent] = {"wins":0, "losses":0, "by_season":{}}
                    versus_dict[key]["count"] += 1

                versus_dict[key]["wins"] += wins
                versus_dict[key]["losses"] += losses
                versus_dict[key]["opponents"][opponent]["wins"] += wins
                versus_dict[key]["opponents"][opponent]["losses"] += losses
                versus_dict[key]["opponents"][opponent]["by_season"][season] = {"wins":wins,"losses":losses}

file = "./_data/versus.json"
with open(file, 'w') as filetowrite:
    # convert python dictionary to json and write it
    json.dump(versus_dict, filetowrite)
