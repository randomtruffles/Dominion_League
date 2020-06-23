import json

largest_division = "A"
current_season = 40

with open('../_data/leagueHistory_20200602.json') as file:
    data = json.load(file)

def pad_text(text, padding):
    return " " * padding + text + "\n"

def create_th(text, attr=""):
    return "<th{}>{}</th>".format(attr, text)

def create_td(text, attr=""):
    return "<td{}>{}</td>".format(attr, text)

def fpct(pct):
    return "{0:.0%}".format(pct)

"""
Value is between 0 and 100.
"""
def assign_color(value):
    gradient = ["15AC60","16AF4F","18B33E","1AB72C","1EBB1C","35BF1E","4CC320","64C722","7CCB24","94CF26","ADD329","C7D72B","DBD52D","DFC230","E3AF32","E79C35","EB8937","EF753A","F3613D","F74C40"]
    gradient.reverse()
    steps = len(gradient)
    range = 101
    def bgcolor(color):
        return " style=\"background-color:#{}\"".format(color)

    return bgcolor(gradient[(value*steps)//101])

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
---
<div class="home">
  <div class="container-centered">
    <h3>{}Season {} Standings{}</h3>
    <h5><a href="{{{{site.baseurl}}}}/past_standings.html">All Past Season Standings</a></h5>
    <!-- Filter buttons -->
    <div id="myBtnContainer">
""".format(layout, past_season, season, next_season)
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

def create_footer():
    footer = """
<script>
filterSelection("all")

var btnContainer = document.getElementById("myBtnContainer");
var btns = btnContainer.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function(){
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");\n
    this.className += " active";
    });
}
</script>
"""

    return footer


def create_table(division, padding, champion):
    global largest_division
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
    table = p("<table class=\"table-past-standings filterDiv div{}\">".format(division["tier"]))
    p_add()

    # create table name
    table += p("<tr>")
    p_add()
    table += p(td("{} Division".format(division["name"]), " colspan=\"5\" class=\"division-header\""))
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

    # generate rows for division members
    members = division["members"]
    member_rows = [""] * len(members)

    zero_index = False
    for m in members:
        if m["rank"] == 0:
            zero_index = True

    for m in members:
        mrow = ""
        mrow += p("<tr class=\"rows-past-standings\">")
        p_add()

        # get rows
        mrow += p(create_td(m["rank"]+1 if zero_index else m["rank"]))
        if m["name"] == champion:
            mrow += p(td(m["name"] + champion_icon))
        else:
            mrow += p(td(m["name"]))
        mrow += p(td(m["wins"]))
        mrow += p(td(m["losses"]))
        mrow += p(td(fpct(m["pct"]), assign_color(int(m["pct"]*100))))

        p_sub()
        mrow += p("</tr>")
        member_rows[m["rank"] if zero_index else m["rank"] - 1] = mrow

    for m in member_rows:
        table += m

    p_sub()
    table += p("</table>\n\n")

    return table

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
        page += create_table(d, padding, champion)

    # clean up
    padding -= 2
    page_add("</div>\n")
    padding -= 2
    page_add("</div>\n")

    return page

data = data["seasons"]

for season in data:
    file = "../past_standings/season{}_past_standings.html".format(season["season"])
    with open(file, 'w') as filetowrite:
        season_page = create_season_page(season)
        header = create_header(season["season"])
        footer = create_footer()
        filetowrite.write(header+season_page+footer)
    largest_division = "A"
