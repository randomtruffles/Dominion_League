current_season = 40
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

padding +=1

page_add("<h3>Past Standings</h3>")
page_add("<p>This page contains links to the pages of past season results.</p>")
for i in range(current_season-1):
    link = "past_standings/season{}_past_standings.html".format(i+1)
    title = "Season {} Standings".format(i+1)

    page_add("<a href=\"{}\" class=\"{}\">{}</a>".format(link, class_style, title))
    page_add("<br>")

padding -= 1
page_add("</div>\n")

with open("../past_standings.html", 'w') as filetowrite:
    filetowrite.write(page)
