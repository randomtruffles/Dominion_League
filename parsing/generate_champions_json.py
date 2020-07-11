#!/usr/local/bin/python3
import json

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

file = "../_data/champions.json"
with open(file, 'w') as filetowrite:
    # convert python dictionary to json and write it
    json.dump({"seasons":champions, "players":players}, filetowrite)
