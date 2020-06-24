import json

largest_division = "A"
current_season = 40

# Open file containing all league history
with open('../_data/leagueHistory_20200602.json') as file:
    data = json.load(file)

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
    gradient = ["15AC60","16AF4F","18B33E","1AB72C","1EBB1C","35BF1E","4CC320","64C722","7CCB24","94CF26","ADD329","C7D72B","DBD52D","DFC230","E3AF32","E79C35","EB8937","EF753A","F3613D","F74C40"]
    gradient.reverse()
    steps = len(gradient)
    range = 101
    def bgcolor(color):
        return " style=\"background-color:#{}\"".format(color)

    return bgcolor(gradient[(value*steps)//101])

"""
Creating elements of page
"""
# Create modal
def create_modal(division, padding):
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

    # create modal
    modal = """
<!-- Modal content for Division {name}-->
<div class="myModal modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h4>Division {name} Match Results</h4>
    {results_table}
  </div>
</div>
""".format(name=division["name"], results_table=results_table)

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

# Create Footer
def create_footer():

    # Include modal JS
    footer="""
    <script>
    // Buttons for filtering divisions
    filterSelection("all")

    var btnContainer = document.getElementById("myBtnContainer");
    var btns = btnContainer.getElementsByClassName("btn");
    for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function(){
        var current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
        });
    }

    // Modals for table results within a division
    // Get the modal
    var modal = document.getElementsByClassName('myModal');

    // Get the button that opens the modal
    var btn = document.getElementsByClassName("results-button");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close");

    window.onclick = function(event) {
        for (let j = 0; j < btn.length; j++) {
            if (event.target == modal[j]) {
                modal[j].style.display = "none";
            }
        }
    }

    for (let j = 0; j < btn.length; j++) {
        // When the user clicks the button, open the modal
        btn[j].onclick = function() {
            modal[j].style.display = "block";
        }

        // When the user clicks on <span> (x), close the modal
        span[j].onclick = function() {
            modal[j].style.display = "none";
        }
    }
    </script>
    """
    return footer


def create_table(division, padding, champion):
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
        wins = m["wins"]
        losses = m["losses"]
        pct = m["pct"]

        mrow += p(create_td(rank))
        if name == champion:
            mrow += p(td(name + champion_icon))
        else:
            mrow += p(td(name))
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

    table += create_modal(division, padding)

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
        page += create_table(d, padding, champion)

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
