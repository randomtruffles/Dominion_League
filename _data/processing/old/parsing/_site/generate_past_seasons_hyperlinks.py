#!/usr/local/bin/python3
current_season = 42
page = ""
page_style = "default"
padding = 0
class_style = "past-standings"
# helper functions
def pad_text(text, padding):
    return " " * padding + text + "\n"
def pad(text):
    return pad_text(text, padding)
def page_add(text):
    global page
    page += pad(text)

page_add("---\nlayout: {}\n---\n".format(page_style))
page_add("<div class=\"container-centered\">\n")

padding +=2

page_add("<h3>Past Standings</h3>")
page_add("<p>This page contains links to the pages of past season results.</p>")

"""
Create Grid
"""
page_add("<div class=\"grid-container\">")
padding +=2
for i in range(current_season-1):
    link = "{{{{site.baseurl}}}}/past_standings/season{}".format(i+1)
    title = "Season {}".format(i+1)
    href = "<a href=\"{}\" class=\"{}\">{}</a>".format(link, class_style, title)
    grid_element = "<div class=\"grid-item\">{}</div>".format(href)
    page_add(grid_element)

page_add("</div>\n")
padding -= 2
page_add("</div>\n")

with open("../past_standings.html", 'w') as filetowrite:
    filetowrite.write(page)
