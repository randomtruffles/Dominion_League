#!/usr/local/bin/python3

div_id = ["divA", "divB", "divC", "divD", "divE", "divF", "divG", "divH"]
div_count = [1, 2, 4, 4, 8, 16, 32, 64]
divisions = {}
for idx, d in enumerate(div_id):
    divisions[d] = div_count



# Using readlines()
with open('raw_divs.txt') as raw_divs:
    iframes = [iframe.rstrip('\n') for iframe in raw_divs]

def figure_div (idx):
    fit = 0
    for i, c in enumerate(div_count):
        fit += c
        if idx <= fit:
            return div_id[i]
        c -= 1
    return div_id[-1]

for idx, iframe in enumerate(iframes):
    print(iframe)
    iframes[idx] = "<div class=\"current-standings filterDiv " + figure_div(idx) + "\">" + iframe + "</div>\n"

# writing divisions to file
file1 = open('div_with_div.txt', 'w')
file1.writelines(iframes)
file1.close()
