#!/usr/local/bin/python3
import json

hall_of_fame = ""
padding = 0
current_season = 41
ongoing = True # is the season currently in progress?

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
    return "<th {}>{}</th>".format(attr, text)

def td(text, attr=""):
    return "<td {}>{}</td>".format(attr, text)

def url_player(player):
    param = player.replace(" ", "%20")
    return """<a href="{{{{site.baseurl}}}}/player_database?player={}">{}</a>""".format(param, player)

def url_past(season, secondary, prefix=""):
    season = str(season)
    cls = """class="link-secondary" """ if secondary else ""
    return """<a {}href="{{{{site.baseurl}}}}/past_standings/season{}">{}</a>""".format(cls, season, prefix+season)

"""
Header
Italics: Updated up to Season 40
"""
header = """---
layout: default
title: Dominion League Hall of Fame
---
<div class="container-centered">
  <h3>Dominion League Hall of Fame</h3>
  <img src="{{site.baseurl}}/img/icons/vp_with_trophy.png" class="hof-champion-trophy" title="Championship Match between top 2 A division finishers">
  <p> This page contains various achievements reached by league players. <br> Ties are broken by seniority (i.e. who reached it first). <br> Hover over player names for details regarding their achievement.</p>
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

hall_of_fame += """<div class="achievement-header"><h4>All League Champions</h4>"""
# Create table
champions_table = p("""<table class="hof-table">""")
p_add()

"""
champions_table += p("<tr>")
p_add()
champions_table += p(td("All League Champions",  " colspan=\"5\""))
p_sub()
champions_table += p("</tr>")
"""

# Generate headings
champions_table += p("<tr>")
p_add()
champions_table += p(th("""<img src="{{site.baseurl}}/img/icons/vp_with_trophy.png" class="champion-trophy" title="Championship Match between top 2 A division finishers">""", " width=\"15%\""))
champions_table += p(th("Player", " width=\"30%\""))
champions_table += p(th("Season(s)", " width=\"55%\" style=\"text-align:center\""))
p_sub()
champions_table += p("</tr>")

# Generate Rows
champions_players = champions["players"].copy().items()
sorted_players = sorted(champions_players, key=lambda x: (-len(x[1]), max(map(int, x[1]))))
for player, li in sorted_players:
    champions_table += p("<tr>")
    p_add()
    # Championships
    champions_table += p(td(str(len(li))))
    # Name
    player_name = url_player(pseasons[player]["name"])
    champions_table += p(td(player_name))
    # Seasons
    seasons = ""
    for s in li:
        season_url = url_past(s, True, "S")
        seasons += season_url + ", "
    seasons = seasons[:-2]
    champions_table += p(td(seasons, "style=\"text-align:center\""))

    p_sub()
    champions_table += p("</tr>")
p_sub()
champions_table += p("</table>")
p_sub()
champions_table += p("</div>")

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

div_a_seasons = {}

consecutive_div_a_counter = {}
consecutive_div_a_start = {}
best_streak_div_a_counter = {}
best_streak_div_a_start = {}

for season in range(current_season):
    a1 = league[str(season+1)]["A1"]
    last_season_a1_members = league[str(season)]["A1"]["members"] if season > 0 else {}
    for member in a1["members"]:

        # Most A Divisions
        if member not in div_a_seasons:
            div_a_seasons[member] = []
        div_a_seasons[member].append(season)

        # Most Consecutive A divisions
        if member not in consecutive_div_a_counter:
            consecutive_div_a_counter[member] = 0
            consecutive_div_a_start[member] = 0
        if member not in best_streak_div_a_counter:
            best_streak_div_a_counter[member] = 0
            best_streak_div_a_start[member] = 0

        if member in last_season_a1_members:
            consecutive_div_a_counter[member] += 1
        else:
            consecutive_div_a_counter[member] = 1
            consecutive_div_a_start[member] = season

        if consecutive_div_a_counter[member] > best_streak_div_a_counter[member]:
            best_streak_div_a_counter[member] = consecutive_div_a_counter[member]
            best_streak_div_a_start[member] = consecutive_div_a_start[member]

hall_of_fame += "<section class=\"hall-of-fame\">"
p_add()

def list_to_str(li, integer=False):
    if not integer:
        li = sorted(map(int, li))
    else:
        li = sorted(li)
    strout = ""
    for l in li:
        strout += str(l) + ", "
    return "Seasons " + strout[:-2]

def condense_list_to_str(li, zero_index=True):
    zero_index_adjuster = 1 if zero_index else 0
    strout = ""
    last_season = int(li[0]) + zero_index_adjuster
    start_consecutive = int(li[0]) + zero_index_adjuster
    for l in li:
        l = int(l) + zero_index_adjuster
        if l - last_season > 1:
            if start_consecutive == last_season:
                strout += str(start_consecutive) + ", "
                start_consecutive = l
                last_season = l
            else:
                strout += str(start_consecutive)+"-"+str(last_season)+", "
                start_consecutive = l
                last_season = l
        elif l - last_season == 1:
            last_season += 1
    if last_season != start_consecutive:
        strout += str(start_consecutive) + "-" + str(last_season)
    else:
        strout += str(last_season)

    return strout



most_a_div = sorted(div_a_seasons.items(), key=lambda x: -len(x[1]))
most_a_div = list(map(lambda x: (x[0], len(x[1]), "Seasons "+condense_list_to_str(x[1])), most_a_div))

most_a_streak = sorted(best_streak_div_a_counter.items(), key=lambda x: -x[1])
most_a_streak = list(map(lambda x: (x[0], x[1], f"From Season {best_streak_div_a_start[x[0]] + 1} to {best_streak_div_a_start[x[0]] + x[1]}"), most_a_streak))

runner_ups = champions["players_runner_ups"]
sorted_runner_ups = sorted(runner_ups.items(), key=lambda x: (-len(x[1]), max(map(int, x[1]))))
sorted_runner_ups = list(map(lambda x: (x[0], len(x[1]), list_to_str(x[1])), sorted_runner_ups))
stats = [most_a_div, most_a_streak, sorted_runner_ups]
stat_headings = ["Most Seasons Played in A", "Longest Consecutive Streak in A", "Most Championship Runner-Ups in A"]
for i in range(3):
    stat = stats[i]
    heading = stat_headings[i]

    achievement = p("<div class=\"achievement\">")
    p_add()
    achievement += p("<h4> {} </h4>".format(heading))
    p_add()
    achievement += p("<table class=\"hof-table\">")
    for rank in range(5):
        achievement += p("<tr>")
        player_name = url_player(pseasons[stat[rank][0].lower()]["name"])
        achievement += p("<td>{}.</td>".format(str(rank+1)))
        if (len(stat[rank]) >= 3):
            achievement += p("<td class=\"CellWithComment\"> {} <span class=\"CellComment\"> {} </span> </td>".format(player_name, stat[rank][2]))
        else:
            achievement += p("<td> {} </td>".format(player_name))
        achievement += p("<td> {} </td>".format(stat[rank][1]))
        achievement += p("</tr>")
    achievement += "</table>"
    p_sub()
    p_sub()
    achievement += p("</div>")
    hall_of_fame += achievement

p_sub()
hall_of_fame += p("</section>")


"""
Group:
1. Most Consecutive First Place Finishes
2. Most Consecutive Second Place Finishes
3. Most Unique Tiers Played
"""

all_consecutive_fp = {}
all_consecutive_sp = {}
all_unique_tiers = {}
for player in pseasons:
    name = pseasons[player]["name"]
    seasons = pseasons[player]["seasons"]

    # streak, start, end
    longest_cfp = [-1, -1, -1]
    longest_csp = [-1, -1, -1]
    cur_cfp = [-1, -1, -1]
    cur_csp = [-1, -1, -1]
    unique_tiers = set()
    unique_tiers_complete = 1000

    for season_data in seasons:
        season = int(season_data["season"])
        tier = season_data["division"][0]
        rank = int(season_data["rank"])

        if tier == "A":
            if champions["seasons"][str(season)] == name.lower():
                rank = 1
            elif champions["runner_ups"][str(season)] == name.lower():
                rank = 2

        if rank == 1:
            if season - cur_cfp[2] != 1:
                if cur_cfp[0] >= longest_cfp[0]:
                    longest_cfp[0] = cur_cfp[0]
                    longest_cfp[1] = cur_cfp[1]
                    longest_cfp[2] = cur_cfp[2]
                cur_cfp = [1, season, season]
            else:
                cur_cfp[0] = cur_cfp[0] + 1
                cur_cfp[2] = cur_cfp[2] + 1
                if cur_cfp[0] >= longest_cfp[0]:
                    longest_cfp[0] = cur_cfp[0]
                    longest_cfp[1] = cur_cfp[1]
                    longest_cfp[2] = cur_cfp[2]

        if rank == 2:
            if season - cur_csp[2] != 1:
                if cur_csp[0] >= longest_csp[0]:
                    longest_csp[0] = cur_csp[0]
                    longest_csp[1] = cur_csp[1]
                    longest_csp[2] = cur_csp[2]
                cur_csp = [1, season, season]
            else:
                cur_csp[0] = cur_csp[0] + 1
                cur_csp[2] = cur_csp[2] + 1
                if cur_csp[0] >= longest_csp[0]:
                    longest_csp[0] = cur_csp[0]
                    longest_csp[1] = cur_csp[1]
                    longest_csp[2] = cur_csp[2]

        if tier not in unique_tiers:
            unique_tiers_complete = season
        unique_tiers.add(tier)

    all_consecutive_fp[name] = longest_cfp
    all_consecutive_sp[name]  = longest_csp
    all_unique_tiers[name] = [unique_tiers, unique_tiers_complete]

def list_to_string(li):
    li = sorted(li)
    str = ""
    for l in li:
        str += l + ", "
    return "{"+str[:-2]+"}"

sorted_cfp = sorted(all_consecutive_fp.items(), key=lambda x: (-x[1][0], x[1][2]))
sorted_cfp = list(map(lambda x: (x[0], x[1][0], f"Seasons {x[1][1]} to {x[1][2]}"), sorted_cfp))

sorted_csp = sorted(all_consecutive_sp.items(), key=lambda x: (-x[1][0], x[1][2]))
sorted_csp = list(map(lambda x: (x[0], x[1][0], f"Seasons {x[1][1]} to {x[1][2]}"), sorted_csp))

sorted_unique_tiers = sorted(all_unique_tiers.items(), key=lambda x: (-len(x[1][0]), x[1][1]))
sorted_unique_tiers = list(map(lambda x: (x[0], len(x[1][0]), f"{list_to_string(x[1][0])} by S{x[1][1]}"), sorted_unique_tiers))

hall_of_fame += "<section class=\"hall-of-fame\">"
p_add()

stats = [sorted_cfp, sorted_csp, sorted_unique_tiers]
stat_headings = ["Most Consecutive First Place Finishes", "Most Consecutive Second Place Finishes", "Most Unique Tiers Played"]
for i in range(3):
    stat = stats[i]
    heading = stat_headings[i]

    achievement = p("<div class=\"achievement\">")
    p_add()
    achievement += p("<h4> {} </h4>".format(heading))
    p_add()
    achievement += p("<table class=\"hof-table\">")
    p_add()
    for rank in range(10):
        achievement += p("<tr>")
        player_name = url_player(pseasons[stat[rank][0].lower()]["name"])
        achievement += p(f"<td>{str(rank+1)}. </td>")
        if (len(stat[rank]) >= 3):
            achievement += p("<td class=\"CellWithComment\"> {} <span class=\"CellComment\"> {} </span> </td>".format(player_name, stat[rank][2]))
        else:
            achievement += p("<td> {} </td>".format(player_name))
        achievement += p(f"<td> {stat[rank][1]} </td>")
        achievement += p("</tr>")
    p_sub()
    achievement += p("</table>")
    p_sub()
    p_sub()
    achievement += p("</div>")
    hall_of_fame += achievement

p_sub()
hall_of_fame += p("</section>")


"""
Group:
1. Most Seasons Played in League (top 5)
2. Most Consecutive Seasons Played in League (top 5)
3. Longest Active Streak (top 5)
"""


all_most_seasons_pl = {}
all_consecutive_pl = {}
all_active_streak = {}

if ongoing:
    with open(f"../_data/season_{current_season+1}_players.json") as file:
        current_season_players = json.load(file)
    for player in pseasons:
        name = pseasons[player]["name"]
        seasons = pseasons[player]["seasons"]
        stats = pseasons[player]["stats"]
        tsp = stats["Total Seasons Played"]
        ls = stats["Longest Streak"]

        seasons_played = []
        for sea in seasons:
            seasons_played.append(sea["season"])

        if name.lower() in current_season_players and ls[2] == current_season:
            ls = [ls[0]+1, ls[1], ls[2]+1]
            all_active_streak[name] = ls

        if name.lower() in current_season_players:
            seasons_played.append(str(current_season+1))

        all_most_seasons_pl[name] = seasons_played
        all_consecutive_pl[name] = ls
else:
    for player in pseasons:
        name = pseasons[player]["name"]
        seasons = pseasons[player]["seasons"]
        stats = pseasons[player]["stats"]
        tsp = stats["Total Seasons Played"]
        ls = stats["Longest Streak"]

        seasons_played = []
        for sea in seasons:
            seasons_played.append(sea["season"])

        if ls[2] == current_season:
            all_active_streak[name] = ls

        all_most_seasons_pl[name] = seasons_played
        all_consecutive_pl[name] = ls

sorted_mspl = sorted(all_most_seasons_pl.items(), key=lambda x: -len(x[1]))
sorted_mspl = list(map(lambda x: (x[0], len(x[1]), f"Seasons {condense_list_to_str(x[1], False)}"), sorted_mspl))

sorted_cpl = sorted(all_consecutive_pl.items(), key=lambda x: (-x[1][0]))
sorted_cpl = list(map(lambda x: (x[0], x[1][0], f"From Season {x[1][1]} to {x[1][2]}"), sorted_cpl))
sorted_as = sorted(all_active_streak.items(), key=lambda x: (-x[1][0]))
sorted_as = list(map(lambda x: (x[0], x[1][0], f"Since Season {x[1][1]}"), sorted_as))

hall_of_fame += "<section class=\"hall-of-fame\">"
p_add()

stats = [sorted_mspl, sorted_cpl, sorted_as]
stat_headings = ["Most Seasons Played in League", " Most Consecutive Seasons Played in League", "Longest Active Consecutive Streak"]

for i in range(3):
    stat = stats[i]
    heading = stat_headings[i]

    achievement = p("<div class=\"achievement\">")
    p_add()
    achievement += p("<h4> {} </h4>".format(heading))
    p_add()
    achievement += p("<table class=\"hof-table\">")
    p_add()
    for rank in range(10):
        achievement += p("<tr>")
        achievement += p(f"<td> {str(rank+1)}. </td>")
        player_name = url_player(pseasons[stat[rank][0].lower()]["name"])
        if (len(stat[rank]) >= 3):
            achievement += p("<td class=\"CellWithComment\"> {} <span class=\"CellComment\"> {} </span> </td>".format(player_name, stat[rank][2]))
        else:
            achievement += p("<td> {} </td>".format(player_name))
        achievement += p(f"<td> {stat[rank][1]} </td>")
        achievement += p("</tr>")
    p_sub()
    achievement += p("</table>")
    p_sub()
    p_sub()
    achievement += p("</div>")
    hall_of_fame += achievement

p_sub()
hall_of_fame += p("</section>")

"""
Group:
1. Most 6-0s
2. Most Unique Opponents
3. Most First Place Finishes
"""
pl_six_ohs = {} # 6-0s
pl_uniqueopp = {} # unique opps

for season in league:
    season_data = league[season]
    for division in season_data:
        division_data = season_data[division]
        if division != "champion":
            # calculate unique opponents
            member_data = division_data["members"]
            for member in member_data:
                for member_to_add in member_data:
                    if member != member_to_add:
                        member_lower = member.lower()
                        member_to_add_lower = member_to_add.lower()
                        if member_lower not in pl_uniqueopp:
                            pl_uniqueopp[member_lower] = {member_to_add_lower}
                        else:
                            pl_uniqueopp[member_lower].add(member_to_add_lower)

            # calculate 6-0 results
            results_data = division_data["results"]
            for result in results_data:
                player1 = result["player1"]
                player2 = result["player2"]

                int_season = int(season)
                if result["wins1"] == "6":
                    if player1 not in pl_six_ohs:
                        pl_six_ohs[player1] = [(int_season, player2)]
                    else:
                        pl_six_ohs[player1] = pl_six_ohs[player1] + [(int_season, player2)]
                elif result["wins2"] == "6":
                    if player2 not in pl_six_ohs:
                        pl_six_ohs[player2] = [(int_season, player1)]
                    else:
                        pl_six_ohs[player2] = pl_six_ohs[player2] + [(int_season, player1)]


for pl in pl_six_ohs:
    opps = pl_six_ohs[pl]
    opps = sorted(opps)
    pl_six_ohs[pl] = opps

pl_mfp = {} # most first place finishes
pl_msp = {} # most second place finishes

for player in pseasons:
    name = pseasons[player]["name"]
    seasons = pseasons[player]["seasons"]

    for season_data in seasons:
        season = int(season_data["season"])
        rank = int(season_data["rank"])
        tier = season_data["division"][0]

        if tier == "A":
            if champions["seasons"][str(season)] == name.lower():
                rank = 1
            elif champions["runner_ups"][str(season)] == name.lower():
                rank = 2

        if rank == 1:
            if name not in pl_mfp:
                pl_mfp[name] = [season]
            else:
                pl_mfp[name] = pl_mfp[name] + [season]

        if rank == 2:
            if name not in pl_msp:
                pl_msp[name] = [season]
            else:
                pl_msp[name] = pl_msp[name] + [season]


def pairs_to_str(li):
    strout = ""
    for l in li:
        strout += f"{l[1]} (S{l[0]}), "
    return strout[:-2]


def set_to_string(set_to_convert):
    li = sorted(list(set_to_convert[0]))
    strout = ""
    for l in li:
        strout += l + ", "
    return "{" + strout[:-2] + "}"

sorted_pl_six_ohs = sorted(pl_six_ohs.items(), key=lambda x: (-len(x[1]), x[1][-1][0]))
sorted_pl_six_ohs = list(map(lambda x: (x[0], len(x[1]), pairs_to_str(x[1])), sorted_pl_six_ohs))

case_insensitive_all_unique_tiers = {}
for aut in all_unique_tiers:
    case_insensitive_all_unique_tiers[aut.lower()] = all_unique_tiers[aut]

case_insensitive_all_most_seasons_pl = {}
for aut in all_most_seasons_pl:
    case_insensitive_all_most_seasons_pl[aut.lower()] = all_most_seasons_pl[aut]

to_store_uniqueopp = {}
for player in pl_uniqueopp:
    to_store_uniqueopp[player] = list(pl_uniqueopp[player])


with open("../_data/players_unique_opponents.json", 'w') as filetowrite:
    # convert python dictionary to json and write it
    json.dump(to_store_uniqueopp, filetowrite)

sorted_uniqueopp = sorted(pl_uniqueopp.items(), key=lambda x: -len(x[1]))
sorted_uniqueopp = list(map(lambda x: (x[0], len(x[1]), f"Tiers played: {set_to_string(case_insensitive_all_unique_tiers[x[0].lower()])}, Seasons played: {len(case_insensitive_all_most_seasons_pl[x[0].lower()])}"), sorted_uniqueopp))

sorted_pl_mfp = sorted(pl_mfp.items(), key=lambda x: (-len(x[1]), x[1][-1]))
sorted_pl_mfp = list(map(lambda x: (x[0], len(x[1]), condense_list_to_str(x[1], False)), sorted_pl_mfp))

hall_of_fame += "<section class=\"hall-of-fame\">"
p_add()

stats = [sorted_pl_six_ohs, sorted_uniqueopp, sorted_pl_mfp]
stat_headings = ["Most 6-0 Matches", "Most Unique Number of Opponents Faced", "Most First Place Finishes"]

for i in range(3):
    stat = stats[i]
    heading = stat_headings[i]

    achievement = p("<div class=\"achievement\">")
    p_add()
    achievement += p("<h4> {} </h4>".format(heading))
    p_add()
    achievement += p("<table class=\"hof-table\">")
    p_add()
    for rank in range(10):
        achievement += p("<tr>")
        achievement += p(f"<td> {str(rank+1)}. </td>")
        player_name = url_player(pseasons[stat[rank][0].lower()]["name"])
        if (len(stat[rank]) >= 3):
            achievement += p("<td class=\"CellWithComment\"> {} <span class=\"CellComment\"> {} </span> </td>".format(player_name, stat[rank][2]))
        else:
            achievement += p("<td> {} </td>".format(player_name))
        achievement += p(f"<td> {stat[rank][1]} </td>")
        achievement += p("</tr>")
    p_sub()
    achievement += p("</table>")
    p_sub()
    p_sub()
    achievement += p("</div>")
    hall_of_fame += achievement

p_sub()
hall_of_fame += p("</section>")

"""
Highest Win Percentage
Table (A-H) [Tier | Names | Percentage]
"""
hwp = {}

for season in range(current_season):
    season = season+1
    season_data = league[str(season)]
    for division in season_data:
        if division.lower() == "champion":
            pass
        else:
            tier = division[0]
            for member in season_data[division]["members"]:
                wp = int(season_data[division]["members"][member]["pct"][:-1])
                if tier in hwp:
                    if wp > hwp[tier][0]:
                        hwp[tier]=[wp, [(member, season)]]
                    elif wp == hwp[tier][0]:
                        hwp[tier] = [hwp[tier][0], hwp[tier][1] + [(member, season)]]
                else:
                    hwp[tier]=[wp, [(member, season)]]


hall_of_fame += "<!-- Highest Win Percentage -->\n"
hall_of_fame += """<div class="achievement-header"><h4>Highest Win Percentage by Tier</h4>"""
p_add()
wp_table = p("""<table class="hof-table" style=\"text-align:center\">""")
p_add()

# Generate headings
wp_table += p("<tr>")
p_add()
wp_table += p(th("Tier", " width=\"20%\" style=\"text-align:center\""))
wp_table += p(th("Player(s)", " width=\"55%\" style=\"text-align:center\""))
wp_table += p(th("Win %", " width=\"25%\" style=\"text-align:center\""))
p_sub()
wp_table += p("</tr>")

for i in range(len(hwp)):
    wp_table += p("<tr>")
    p_add()

    tier = chr(ord("A")+i)
    tier_wp = hwp[tier][0]
    tier_wp_players = hwp[tier][1]

    # tier
    wp_table += p(td(tier, "style=\"text-align:center\""))
    # players
    players_string = ""
    for player in tier_wp_players:
        wp_player = url_player(player[0])
        wp_season = str(player[1])
        season_url = url_past(wp_season, True, "Season ")
        players_string += f"{wp_player} ({season_url}), "
    players_string = players_string[:-2]

    wp_table += p(td(players_string, "style=\"text-align:center\""))
    # win %
    wp_table += p(td(str(tier_wp) + "%", "style=\"text-align:center\""))

    p_sub()
    wp_table += p("</tr>")

p_sub()
wp_table += p("</table>")
p_sub()
wp_table += p("</div>")

hall_of_fame += wp_table


"""
Footer
"""
footer = "</div>"
hall_of_fame += footer


file = "../hall_of_fame.html"
with open(file, 'w') as filetowrite:
    # convert python dictionary to json and write it
    filetowrite.write(hall_of_fame)
