from csv import reader

friendly_league_history = {}
seasons = {}

"""
Helper functions
"""
def assign_color(value):
    gradient = ["E77B72", "E88372", "EA8C71", "EC956F", "EF9E6E", "F2A76D", "F4B06B", "F7B96B", "F9C269", "FCCB67", "FED467", "F2D467", "E2D26B", "D0CF6F", "C0CC73", "AFCA76", "9EC77A", "8CC47E", "7CC181", "6DBF84", "5BBC88"]
    steps = len(gradient)
    range = 101
    def bgcolor(color):
        return "#{}".format(color)
    return bgcolor(gradient[(value*steps)//101])

def formatNumber(num):
  if num % 1 == 0:
    return int(num)
  else:
    return num

def fpct(pct):
    return "{0:.0%}".format(pct)

def alias(name):
    global aliases
    if name in aliases:
        return aliases[name]
    return name

"""
parsing data
"""
# Open file containing all aliases
with open('../_data/aliases.json') as file:
    aliases = json.load(file)
# Open file containing all champions by season
with open('../_data/champions.json') as file:
    champions = json.load(file)["seasons"]
# Open file contain standing information
with open('../_data/raw_standings.csv', 'r') as read_obj:
    global seasons
    # pass the file object to reader() to get the reader object
    csv_reader = reader(read_obj)
    # Iterate over each row in the csv using reader object
    for row in csv_reader:
        #player, season, division, tier, position, win%
        player = row[0]
        season = row[1]
        division = row[2]
        tier = row[3]
        position = row[4]
        win_pct = row[5]
        if player == "Player":
            pass # headers

        player_info = {}
        player_info["name"] = player
        player_info["rank"] = position
        player_info["pct"] = win_pct #formatted somehow
        #player_info["color"] = assign_color(win_pct)

        if season in seasons:
            if division not in seasons[season]:
                seasons[season][division] = {}
                seasons[season][division]["name"] = division
                seasons[season][division]["tier"] = tier
                seasons[season][division]["member"] = {}
                seasons[season][division]["results"] = {}
            seasons[season][division]["members"][player]=player_info
        else:
            seasons[season] = {}
            seasons[season]["champion"] = champions[season]
            seasons[season][division] = {}
            seasons[season][division]["name"] = division
            seasons[season][division]["tier"] = tier
            seasons[season][division]["member"] = {}
            seasons[season][division]["results"] = []

with open('../_data/raw_matches.csv', 'r') as read_obj:
    global seasons
    # pass the file object to reader() to get the reader object
    csv_reader = reader(read_obj)
    # Iterate over each row in the csv using reader object
    for row in csv_reader:
        #score, season, players, score, p1, p2, p1 wins, p2 wins, tier
        season = row[1]
        p1 = row[4]
        p2 = row[5]
        p1wins = row[6]
        p2wins = row[7]
        division = row[8]

        if season == "Season":
            pass # headers

        results = {}
        results["player1"] = p1
        results["player2"] = p2
        results["wins1"] = p1wins
        results["wins2"] = p2wins

        seasons[season][division]["results"] = seasons[season][division]["results"].append(results)

for season in seasons:
    for division in season:
        if division == "champion":
            pass
