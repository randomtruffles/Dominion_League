#!/usr/local/bin/python3
import json

"""
Season information
"""
tier_counts = [1, 2, 4, 4, 8, 16, 16, 32, 32, 32]
current_season = 42
# Get iframes for current season
pubs = None
with open(f"s{current_season}/pubhtml.txt") as pubhtmls:
    pubs = [pubhtml.rstrip('\n') for pubhtml in pubhtmls.readlines()]
# print(pubs)

current_pub = 0
for idx, division in enumerate(tier_counts):
    tier = chr(ord("a") + idx)
    for div in range(division):
        content = """---
permalink: s{}/{}{}
layout: redirect
redirect: {}
owner: truffles
---
""".format(current_season, tier, div+1, pubs[current_pub])
        with open(f"s{current_season}/{tier}{div+1}.md", "w") as filetowrite:
            filetowrite.write(content)
        current_pub += 1

practier_tier_counts = 3;
# practice tier
for div in range(practier_tier_counts):
    content = """---
permalink: s{}/{}{}
layout: redirect
redirect: {}
owner: truffles
---
""".format(current_season, tier, div+1, pubs[current_pub])

    with open(f"s{current_season}/{tier}{div+1}.md", "w") as filetowrite:
        filetowrite.write(content)
    current_pub += 1
