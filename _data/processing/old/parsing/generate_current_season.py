#!/usr/local/bin/python3
import json

"""
Season information
"""
tier_names = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "P"]
tier_counts = [1, 2, 4, 4, 8, 14, 13, 25, 25, 26, 4]
current_season = 43
# Get iframes for current season
with open('raw_divs.txt') as raw_divs:
    iframes = [iframe.rstrip('\n') for iframe in raw_divs]

"""
Generate iframes embed for database:
"""
def curr_iframes_json():
    global iframes
    global tier_counts
    # Store division to iframe
    divisions = {}
    current_iframe_idx = 1
    for idx, tier_count in enumerate(tier_counts):
        current_tier = tier_names[idx];
        for division in range(tier_count):
            attr = """class="standings-sheets" onload="document.getElementById('spinner').style.display='none';" """
            iframe = iframes[current_iframe_idx]
            divisions[current_tier+str(division+1)] = iframe[:8] + attr + iframe[8:]
            current_iframe_idx += 1

    with open('../_data/current_season_iframes.json', 'w') as fp:
        json.dump(divisions, fp)
    return

"""
Generate iframes embed for database:
"""
def curr_vanilla_iframes_json():
    global iframes
    global tier_counts
    # Store division to iframe
    divisions = {}
    current_iframe_idx = 1
    for idx, tier_count in enumerate(tier_counts):
        current_tier = tier_names[idx];
        for division in range(tier_count):
            attr = """class="standings-sheets" onload="document.getElementById('spinner').style.display='none';" """
            iframe = iframes[current_iframe_idx]
            divisions[current_tier+str(division+1)] = iframe[:8] + attr + iframe[8:]
            current_iframe_idx += 1

    with open('../_data/current_season_iframes.json', 'w') as fp:
        json.dump(divisions, fp)
    return

"""
Generate current season json
"""
def curr_season_json():
    global current_season
    # Open file containing all current season players
    with open('../_data/raw_current_season.json') as file:
        data = json.load(file)
    curr_season = {"seasons" : current_season}

    for p in data:
        name = p["Name"]
        tier = p["Tier"]
        division = p["Division"]
        curr_season[name.lower()] = {"name":name, "tier":tier, "division":division}
    with open('../_data/current_season_players.json', 'w') as fp:
        json.dump(curr_season, fp)
    return


"""
Generate current_standings page
"""
def curr_standings_page():
    global iframes
    global current_season
    global tier_counts
    # Generate iframes for tiers
    curr_iframe = 1
    yml_file = "iframes:\n"
    fo
    for idx, count in enumerate(tier_counts):
        for c in range(count):
            page += """    <div class="current-standings filterDiv div{}">{}</div>\n""".format(tier_names[idx],iframes[curr_iframe])
            curr_iframe += 1
    page +="""    <div class="spacing"> </div>
  </div>
</div>
<script type="text/javascript" src="{{site.baseurl}}/js/current-standings.js"></script>
"""
    with open("../_data/current_season_iframes.yml", 'w') as filetowrite:
        filetowrite.write(page)

def curr_player_list():
    with open('../_data/current_season_players.json') as file:
        data = json.load(file)

    curr_season = {}
    for d in data:
        if d != "seasons":
            curr_season[d.lower()] = str(current_season)
    with open(f"../_data/season_{current_season}_players.json", 'w') as fp:
        json.dump(curr_season, fp)


curr_iframes_json()
curr_season_json()
# curr_standings_page()
curr_player_list()
