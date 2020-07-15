#!/usr/local/bin/python3
import json

current_season = 40
# Open file containing all (pretty) league history
with open('../_data/champions.json') as file:
    champions = json.load(file)["seasons"]

players = {}

for season in champions:
    champion = champions[season]
    if champion in players:
        players[champion].append(season)
    else:
        players[champion] = [season]

# Open file containing all (pretty) league history
with open('../_data/friendly_league_history.json') as file:
    seasons = json.load(file)["seasons"]

runner_ups = {}

for s in range(current_season-1):
    season = str(s+1)
    a1 = seasons[season]["A1"]
    members = a1["members"]
    champion = champions[season]
    for m in members:
        if members[m]["rank"] <= 2 and m.lower() != champion:
            runner_ups[season] = m.lower()
            pass

players_runner_ups = {}

for season in runner_ups:
    runner_up = runner_ups[season]
    if runner_up in players_runner_ups:
        players_runner_ups[runner_up].append(season)
    else:
        players_runner_ups[runner_up] = [season]


file = "../_data/champions.json"
with open(file, 'w') as filetowrite:
    # convert python dictionary to json and write it
    json.dump({"seasons":champions, "runner_ups":runner_ups, "players":players, "players_runner_ups" : players_runner_ups}, filetowrite)
