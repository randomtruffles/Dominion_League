#!/usr/local/bin/python3
import json
div_id = ["A", "B", "C", "D", "E", "F", "G", "H"]
div_count = [1, 2, 4, 4, 8, 16, 32, 64]



# Get iframes for current season
with open('raw_divs.txt') as raw_divs:
    iframes = [iframe.rstrip('\n') for iframe in raw_divs]


"""
Generate iframes embed for database:

# Store division to iframe
divisions = {}
current_iframe_idx = 1
for idx, div in enumerate(div_id):
    for c in range(div_count[idx]):
        divisions[div+str(c+1)] = iframes[current_iframe_idx]
        current_iframe_idx += 1

with open('../_data/current_season_iframes.json', 'w') as fp:
    json.dump(divisions, fp)
"""
"""
Generate current season json
"""
# Open file containing all current season players
with open('../_data/raw_current_season.json') as file:
    data = json.load(file)
current_season = {"seasons" : data["season"]}

for p in data["players"]:
    name = p["Name"]
    tier = p["Tier"]
    division = p["Division"]
    current_season[name.lower()] = {"name":name, "tier":tier, "division":division}
with open('../_data/current_season_players.json', 'w') as fp:
    json.dump(current_season, fp)


"""
Generate div attributes for current standings page:
"""

def figure_div (idx):
    fit = 0
    for i, c in enumerate(div_count):
        fit += c
        if idx <= fit:
            return "div"+div_id[i]
        c -= 1
    return "div"+div_id[-1]

# Generate iframes for current season
for idx, iframe in enumerate(iframes):
    iframes[idx] = "<div class=\"current-standings filterDiv " + figure_div(idx) + "\">" + iframe + "</div>\n"

# writing divisions to file
file1 = open('current_season_iframes.txt', 'w')
file1.write("".join(iframes))
file1.close()
