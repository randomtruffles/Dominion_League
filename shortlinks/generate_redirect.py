#!/usr/local/bin/python3
import json

"""
Season information
"""
tier_counts = [1, 2, 4, 4, 8, 14, 13, 26, 28, 27]
current_season="42"
for idx, division in enumerate(tier_counts):
    tier = chr(ord("a") + idx)
    for div in range(division):
        content = """---
permalink: s{}/{}{}
layout: redirect
redirect: {}
owner: truffles
---
""".format(current_season, tier, div+1, f"https://dominionleague.org/current_standings?div={tier}{div+1}")
        with open(f"s{current_season}/{tier}{div+1}.md", "w") as filetowrite:
            filetowrite.write(content)

practier_tier_counts = 3;
# practice tier
for division in range(practier_tier_counts):
    tier = "p"
    for div in range(division):
        content = """---
permalink: s{}/{}{}
layout: redirect
redirect: {}
owner: truffles
---
""".format(current_season, tier, div+1, f"https://dominionleague.org/current_standings?div={tier}{div+1}")
        with open(f"s{current_season}/{tier}{div+1}.md", "w") as filetowrite:
            filetowrite.write(content)
