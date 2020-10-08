import json
with open('../_data/friendly_league_history.json') as file:
    seasons = json.load(file)["seasons"]

min_win = 30
names = []
seasons_occur = []

for season in seasons:
    for division in seasons[season]:
        if division == "E12" and season == "29":
            pass
        elif division != "champion":
            for member in seasons[season][division]["members"]:
                member_data = seasons[season][division]["members"][member]
                if member_data["rank"] == 1 and (float(member_data["wins"]) + float(member_data["losses"]) >= 25.0):
                    if float(member_data["wins"]) < min_win and float(member_data["wins"]) >= 10.0 :
                        min_win = float(member_data["wins"])
                        names = [member]
                        seasons_occur = [season]
                    elif float(member_data["wins"]) == min_win:
                        names.append(member)
                        seasons_occur.append(season)

print("Lowest Win with Rank 1: " + str(min_win))
print("Players:")
print(names)
print("Seasons Occured:")
print(seasons_occur)
