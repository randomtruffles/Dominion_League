#!/usr/local/bin/python3

import json

# Open file containing all league history
with open('../_data/leagueHistory_20200602.json') as file:
    data = json.load(file)
# Open file containing championship videos
with open('../_data/championship_videos.json') as file:
    videos = json.load(file)

largest_division = "A"
current_season = 40

season_starts = ["5/18/2014", "7/6/2014", "8/31/2014", "10/19/2014", "12/7/2014", "2/2/2015", "3/30/2015", "5/18/2015", "7/6/2015", "8/23/2015", "11/2/2015", "12/21/2015", "2/15/2016", "4/4/2016", "5/23/2016", "7/11/2016", "8/29/2016", "11/7/2016", "1/9/2017", "2/27/2017", "4/17/2017", "6/5/2017", "7/31/2017", "10/16/2017", "12/11/2017", "2/12/2018", "4/9/2018", "6/4/2018", "7/30/2018", "10/15/2018", "12/10/2018", "2/4/2019", "4/1/2019", "5/27/2019", "7/22/2019", "10/14/2019", "12/9/2019", "2/3/2020", "3/30/2020", "5/25/2020", "7/20/2020"]
season_ends = ["6/21/2014", "8/9/2014", "10/4/2014", "11/22/2014", "1/10/2015", "3/8/2015", "5/3/2015", "6/21/2015", "8/9/2015", "9/26/2015", "12/6/2015", "1/24/2016", "3/20/2016", "5/8/2016", "6/26/2016", "8/14/2016", "10/2/2016", "12/11/2016", "2/12/2017", "4/2/2017", "5/21/2017", "7/16/2017", "9/10/2017", "11/26/2017", "1/21/2018", "3/25/2018", "5/20/2018", "7/15/2018", "9/9/2018", "11/25/2018", "1/20/2019", "3/17/2019", "5/12/2019", "7/7/2019", "9/1/2019", "11/24/2019", "1/19/2020", "3/15/2020", "5/10/2020", "7/5/2020", "8/30/2020"]

"""
Convert season dates in SamE's preferred format
"""
def preferred_date(date):
    param = date.split("/")
    # add leading zeroes
    if len(param[0]) == 1:
        param[0] = "0"+param[0]
    if len(param[1]) == 1:
        param[1] = "0"+param[1]

    return "{}-{}-{}".format(param[2], param[0], param[1])

for i in range(len(season_starts)):
    current = season_starts[i]
    season_starts[i] = preferred_date(current)

for i in range(len(season_ends)):
    current = season_ends[i]
    season_ends[i] = preferred_date(current)

"""
Helper functions
"""
def pad_text(text, padding):
    return " " * padding + text + "\n"

def create_th(text, attr=""):
    return "<th{}>{}</th>".format(attr, text)

def create_td(text, attr=""):
    return "<td{}>{}</td>".format(attr, text)

def fpct(pct):
    return "{0:.0%}".format(pct)

# Value is between 0 and 100.
def assign_color(value):
    gradient = ["E77B72", "E88372", "EA8C71", "EC956F", "EF9E6E", "F2A76D", "F4B06B", "F7B96B", "F9C269", "FCCB67", "FED467", "F2D467", "E2D26B", "D0CF6F", "C0CC73", "AFCA76", "9EC77A", "8CC47E", "7CC181", "6DBF84", "5BBC88"]
    steps = len(gradient)
    range = 101
    def bgcolor(color):
        return " style=\"background-color:#{}\"".format(color)

    return bgcolor(gradient[(value*steps)//101])

def get_player_database_url(player):
    player_param = player.replace(" ", "%20")
    player_class = "player-past-standings"
    return "<a href=\"{{{{site.baseurl}}}}/player_database.html?player={}\"\
            class=\"{}\">{}</a>".format(player_param, player_class, player)

"""
Creating elements of page
"""
# Create modal
def create_modal(season, division, padding):
    pad = "  " * padding
    def td(info):
        return "{}<td class=\"cells-division-modal\">{}</td>\n".format(pad, info)

    # create results rows
    pad += "  "
    results = division["results"]
    rows = ""
    new_row = "{pad}<tr class=\"rows-results-modal\">\n".format(pad=pad)
    for result in results:
        rows += new_row
        pad += "  "
        rows += td("{} <b>vs.</b> {}".format(result["player1"], result["player2"]))
        rows += td("{} - {}".format(result["wins1"], result["wins2"]))
        pad = pad[:-2]
        rows += "{pad}</tr>\n".format(pad=pad)
    pad = pad[:-2]

    # create results table
    results_table = """
{pad}<table class="division-modal-table">
  {pad}<tr class="rows-results-modal">
    {pad}<th class="cells-division-modal">Match</th>
    {pad}<th class="cells-division-modal">Score</th>
  {pad}</tr>
  {rows}
{pad}</table>
""".format(pad=pad,rows=rows)

    youtube_video = ""
    # Get championship video
    if division["name"] == "A1":
        video = videos[str(season)]
        if len(video) == 1:
            youtube_video = "<p><a href=\"{}\">Championship Match Video</a></p>".format(video[0])
        elif len(video) > 1:
            youtube_video += "<p>Championship Match Videos: "
            for v in range(len(video)):
                comma = ", " if v < len(video) else ""
                youtube_video += "<a href=\"{}\">Part {}</a>{}".format(video[v], v+1, comma)

            youtube_video += "</p>"

    # create modal
    modal = """
<!-- Modal content for Division {name}-->
<div class="myModal modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h4>Division {name} Match Results</h4>
    {youtube_video}
    {results_table}
  </div>
</div>
""".format(name=division["name"], youtube_video=youtube_video, results_table=results_table)

    return modal


# Create header
def create_header(season):
    global largest_division
    layout = "default"
    header = ""
    padding = 0
    int_season = int(season)
    def h_add(text):
        nonlocal header
        header += pad_text(text, padding)

    past_season = "<a style=\"text-decoration: none\" href=\"season{}_past_standings.html\">&nbsp;{}&nbsp;</a>".format(int_season-1, "<b><</b>") if int_season > 1 else "&nbsp;&nbsp;&nbsp;"
    next_season = "<a style=\"text-decoration: none\" href=\"season{}_past_standings.html\">&nbsp;{}&nbsp;</a>".format(int_season+1, "<b>></b>") if int_season < current_season - 1 else "&nbsp;&nbsp;&nbsp;"

    # define layout
    top = """---
layout: {}
title: Dominion League Season {} Standings
---
<div class="home">
  <div class="container-centered">
    <h3>{}Season {} Standings{}</h3>
    <h5>{} to {}</h5>
    <h5><a href="{{{{site.baseurl}}}}/past_standings.html">All Past Season Standings</a></h5>
    <h5><a href="{{{{site.baseurl}}}}/player_database.html">Player Database</a></h5>
    <!-- Filter buttons -->
    <div id="myBtnContainer">
""".format(layout, season, past_season, season, next_season, season_starts[int_season-1], season_ends[int_season-1])
    header += top
    padding += 6

    # add buttons
    tier_letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    for t in tier_letters:
        h_add("<button class=\"btn\" onclick=\"filterSelection('div{}')\">{}</button>".format(t, t))
        if t == largest_division:
            break

    h_add("<button class=\"btn active\" onclick=\"filterSelection('all')\">Show All</button>")
    padding -= 2

    h_add("</div>")
    h_add("<div class=\"spacing\"></div>")
    return header

# Create Footer
def create_footer():

    # Include modal JS
    footer="""
    <script type="text/javascript" src="{{site.baseurl}}/js/past-standings.js"></script>
    """
    return footer


def create_table(season, division, padding, champion):
    global largest_division
    modal_btn = " <button class=\"results-button\">Match Results</button>"
    def p_add():
        nonlocal padding
        padding += 2
    def p_sub():
        nonlocal padding
        padding -= 2
    def p(text):
        return pad_text(text, padding)

    cell_class = " class=\"cells-past-standings\""
    def th(text, attr=""):
        return create_th(text, attr+cell_class)
    def td(text, attr=""):
        return create_td(text, attr+cell_class)

    # update tier counter
    if division["tier"] > largest_division:
        largest_division = division["tier"]

    # initialize table
    table = "<!-- Table for Division {}-->\n".format(division["name"])
    table += p("<table class=\"table-past-standings filterDiv div{}\">".format(division["tier"]))
    p_add()

    # create table name
    table += p("<tr>")
    p_add()
    table += p(td("{} Division".format(division["name"]) + modal_btn, " colspan=\"5\" class=\"division-header\""))
    p_sub()
    table += p("</tr>")

    # generate table headings
    table += p("<tr class=\"rows-past-standings\">")
    p_add()
    table += p(create_th("Rank", " width=\"10%\""))
    table += p(th("Player", " width=\"55%\""))
    table += p(th("W", " width=\"10%\""))
    table += p(th("L", " width=\"10%\""))
    table += p(th("Win %", " width=\"15%\""))
    p_sub()
    table += p("</tr>")

    # champion icon hover text
    champion_icon = " <i class=\" fas fa-crown\" title=\"Winner of championship match between top 2 A players\"></i>"

    # Get championship video
    if division["name"] == "A1" and len(videos[str(season)]) >= 1 :
        youtube_video = videos[str(season)][0]
        champion_icon = " <a href=\"{}\">{}</a>".format(youtube_video, champion_icon)
    # generate rows for division members
    members = division["members"]
    member_rows = {}

    zero_index = 0
    for m in members:
        if m["rank"] == 0:
            zero_index = 1

    for m in members:
        mrow = ""
        mrow += p("<tr class=\"rows-past-standings\">")
        p_add()
        # get rows
        rank = m["rank"] + zero_index
        name = m["name"]
        url_name = get_player_database_url(name)

        # For formating simulated results
        def formatNumber(num):
          if num % 1 == 0:
            return int(num)
          else:
            return num
        wins = "{0:g}".format(round(m["wins"],2))
        losses = "{0:g}".format(round(m["losses"],2))
        pct = m["pct"]

        mrow += p(create_td(rank))
        if name == champion:
            mrow += p(td(url_name + champion_icon))
        else:
            mrow += p(td(url_name))
        mrow += p(td(wins))
        mrow += p(td(losses))
        mrow += p(td(fpct(pct), assign_color(int(pct*100))))
        p_sub()
        mrow += p("</tr>")

        # store information
        if rank in member_rows:
            member_rows[rank] = member_rows[rank] + [mrow]
        else:
            member_rows[rank] = [mrow]

    # add member rows to table
    for rank in range(1, len(members)+1):
        if rank in member_rows:
            for m in member_rows[rank]:
                table += m

    p_sub()
    table += p("</table>\n")

    table += create_modal(season, division, padding)

    return table

# Create season page
def create_season_page(season):
    page = ""
    padding = 4

    # helper functions
    def pad(text):
        return pad_text(text, padding)
    def page_add(text):
        nonlocal page
        page += pad(text)

    # add tables for each division
    # page_add("<h3>Season {} Standings</h3>".format(season["season"]))
    divisions = season["divisions"]
    champion = season["champion"] if "champion" in season else None

    for d in divisions:
        page += create_table(season["season"], d, padding, champion)

    # clean up
    padding -= 2
    page_add("</div>\n")
    padding -= 2
    page_add("</div>\n")

    return page

# Generate pages
data = data["seasons"]

for season in data:
    file = "../past_standings/season{}_past_standings.html".format(season["season"])
    with open(file, 'w') as filetowrite:
        season_page = create_season_page(season)
        header = create_header(season["season"])
        footer = create_footer()
        filetowrite.write(header+season_page+footer)
    largest_division = "A"
