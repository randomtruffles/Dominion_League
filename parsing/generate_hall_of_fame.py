#!/usr/local/bin/python3
import json

hall_of_fame = ""
padding = 0
current_season = 39

# Helper functions
def pad(text, padding):
    return (padding * "  ") + text + "\n"

def p(text):
    global padding
    return pad(text, padding)

def p_add():
    global padding
    padding += 1

def p_sub():
    global padding
    padding -= 1

def th(text, attr=""):
    return "<th{}>{}</th>".format(attr, text)

def td(text, attr=""):
    return "<td{}>{}</td>".format(attr, text)

"""
Header
Italics: Updated up to Season 40
"""
header = """---
layout: default
---
<div class="container-centered">
  <h3>Dominion League Hall of Fame</h3>
  <img src="{{site.baseurl}}/img/icons/vp_with_trophy.png" class="champion-trophy" title="Championship Match between top 2 A division finishers">

  <div class=spacing></div>
"""
hall_of_fame += header
p_add()


"""
All league champions
Table [name | number | seasons]
"""
# Open file containing all (pretty) league history
with open('../_data/champions.json') as file:
    champions = json.load(file)
# Open file containing all (pretty) league history
with open('../_data/player_and_seasons_played.json') as file:
    pseasons = json.load(file)

hall_of_fame += "<!-- All League Champions -->\n"

# Create table
champions_table = p("""<table class="hof-champions">""")
p_add()

champions_table += p("<tr>")
p_add()
champions_table += p(td("All League Champions",  " colspan=\"5\""))
p_sub()
champions_table += p("</tr>")

# Generate headings
champions_table += p("<tr>")
p_add()
champions_table += p(th("""<img src="{{site.baseurl}}/img/icons/vp_with_trophy.png" class="champion-trophy" title="Championship Match between top 2 A division finishers">""", " width=\"15%\""))
champions_table += p(th("Player", " width=\"30%\""))
champions_table += p(th("Seasons", " width=\"55%\""))
p_sub()
champions_table += p("</tr>")

# Generate Rows
champions_players = champions["players"].copy().items()
sorted_players = sorted(champions_players, key=lambda x: (-len(x[1]), -max(map(int, x[1]))))
for player, li in sorted_players:
    champions_table += p("<tr>")
    p_add()
    # Championships
    champions_table += p(td(str(len(li))))
    # Name
    champions_table += p(td(pseasons[player]["name"]))
    # Seasons
    seasons = ""
    for s in li:
        seasons += "S" + s + ", "
    seasons = seasons[:-2]
    champions_table += p(td(seasons))

    p_sub()
    champions_table += p("</tr>")
p_sub()
champions_table += p("</table>")

hall_of_fame += champions_table

"""
Group:
1. Most A Divisions (top 3)
2. Most Consecutive A Divisions (top 3)
3. Most Championship Runner-Ups (top 3)
"""
# Most A Divisions
# Open file containing all (pretty) league history
league = None
with open('../_data/friendly_league_history.json') as file:
    league = json.load(file)["seasons"]

div_a_counter = {}
consecutive_div_a_counter = {}
best_streak_div_a_counter = {}

for season in range(current_season):
    a1 = league[str(season+1)]["A1"]
    last_season_a1_members = league[str(season)]["A1"]["members"] if season > 0 else {}
    for member in a1["members"]:

        # Most A Divisions
        if member not in div_a_counter:
            div_a_counter[member] = 0
        div_a_counter[member] += 1

        # Most Consecutive A divisions
        if member not in consecutive_div_a_counter:
            consecutive_div_a_counter[member] = 0
        if member not in best_streak_div_a_counter:
            best_streak_div_a_counter[member] = 0

        if member in last_season_a1_members:
            consecutive_div_a_counter[member] += 1
        else:
            consecutive_div_a_counter[member] = 1

        best_streak_div_a_counter[member] = max(
            best_streak_div_a_counter[member],
            consecutive_div_a_counter[member])

hall_of_fame += "<section class=\"hall-of-fame\">"
p_add()

most_a_div = sorted(div_a_counter.items(), key=lambda x: -x[1])
achievement_1 = p("<div class=\"achievement\">")
p_add()
achievement_1 += "<h4> Most Divisions in A </h4>"
p_add()
for rank in range(3):
    achievement_1 += "<p>{}. {}, {} </p>".format(str(rank+1), most_a_div[rank][0], most_a_div[rank][1])
p_sub()
p_sub()
achievement_1 += p("</div>")

most_a_streak = sorted(best_streak_div_a_counter.items(), key=lambda x: -x[1])
achievement_2 = p("<div class=\"achievement\">")
p_add()
achievement_2 += "<h4> Longest Streak of Being in A </h4>"
p_add()
for rank in range(3):
    achievement_2 += "<p>{}. {}, {} </p>".format(str(rank+1), most_a_streak[rank][0], most_a_streak[rank][1])
p_sub()
p_sub()
achievement_2 += p("</div>")

runner_ups = champions["players_runner_ups"]
sorted_runner_ups = sorted(runner_ups.items(), key=lambda x: (-len(x[1]), -max(map(int, x[1]))))
print(sorted_runner_ups)
achievement_3 = p("<div class=\"achievement\">")
p_add()
achievement_3 += "<h4> Most Runner-Ups in A </h4>"
p_add()
for rank in range(3):
    achievement_3 += "<p>{}. {}, {} </p>".format(str(rank+1), sorted_runner_ups[rank][0], len(sorted_runner_ups[rank][1]))
p_sub()
p_sub()
achievement_3 += p("</div>")
p_sub()

hall_of_fame += achievement_1
hall_of_fame += achievement_2
hall_of_fame += achievement_3
hall_of_fame += "</section>"


"""
Group:
1. Most Consecutive First Place Finishes
2. Most Consecutive Second Place Finishes
3. Most Unique Tiers Played
"""

"""
Group:
1. Most Seasons Played in League (top 3)
2. Most Consecutive Seasons Played in League (top 3)
3. Longest Active Streak (top 3)
"""

"""
Highest Win Percentage
Table (A-H) [Tier | Names | Percentage]
"""


"""
Footer
"""
footer = "</div>"
hall_of_fame += footer


file = "../hall_of_fame.html"
with open(file, 'w') as filetowrite:
    # convert python dictionary to json and write it
    filetowrite.write(hall_of_fame)
