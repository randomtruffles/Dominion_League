#!/usr/local/bin/python3

import json

# Open file containing all league history
with open('../_data/leagueHistory_20200602.json') as file:
    data = json.load(file)

"""
Helper functions
"""
def assign_color(value):
    gradient = ["E77B72", "E88372", "EA8C71", "EC956F", "EF9E6E", "F2A76D", "F4B06B", "F7B96B", "F9C269", "FCCB67", "FED467", "F2D467", "E2D26B", "D0CF6F", "C0CC73", "AFCA76", "9EC77A", "8CC47E", "7CC181", "6DBF84", "5BBC88"]
    steps = len(gradient)
    range = 101
    def bgcolor(color):
        return "#{}".format(color)

    return bgcolor(gradient[(value*steps)//101])

def formatNumber(num):
  if num % 1 == 0:
    return int(num)
  else:
    return num

def fpct(pct):
    return "{0:.0%}".format(pct)



"""
Generate friendly json for database querying

{
 "seasons" : { # maps to a map of seasons
    season (type int) : { # maps to a map of divisions
        division (type str) : {
            "name" : str,
            "tier" : str,
            "members" : {  # maps to a map of members
                name (type str) : {
                    "nicename" : str,
                    ...
                    ..
                    ..
                    ..
                }
            },
            "results" : [ # list of results
                {
                    "player1": str,
                    ...
                },
            ],
        },
        "champion" : str
    }
 }
}
"""
friendly_json = {"seasons" : {}}

data = data["seasons"]

""" Generate map of season to season data """
for s in data:
    season = s["season"] # type int


    """
    Generate map of division to division data
    division data:
    - name : (type str) // Eg. "A1"
    - tier : (type str) // Eg. "A"
    - members : (type dict of dict) // Eg. {"Mic Qsenoch" : { member_results }}
    - results : (type list of dict) // Eg. [{ match_results }]
    """
    divisions = {}
    if "champion" in s:
        divisions["champion"] = s["champion"] # store season champion

    for d in s["divisions"]:
        division = d["name"] # type str

        division_data = {}
        division_data["name"] = d["name"]
        division_data["tier"] = d["tier"]

        """
        Generate map of member to member_results
        member_results:
        - name : (type str) // Eg. "Mic Qsenoch"
        - nicename : (type str) // Eg. "mic-qsenoch",
        - wins : (type float) // Eg. 21,
        - losses: (type float) // Eg. 9,
        - rank : (type float) // Eg. 1,
        - pct : (type float) // Eg. 0.7,
        - tb2 : (type float) // Eg. 270.5
        """
        members = {}
        zero_index = 0

        for m in d["members"]:
            if m["rank"] == 0:
                zero_index = 1

        for m in d["members"]:
            member_data = {}
            name = m["name"].strip()
            if name == "Voltaire " :
                print("strip failed")

            member_data["name"] = name
            member_data["wins"] = "{0:g}".format(round(m["wins"],2))
            member_data["losses"] = "{0:g}".format(round(m["losses"],2))
            member_data["rank"] = m["rank"] + zero_index
            member_data["pct"] = fpct(m["pct"])
            member_data["color"] = assign_color(int(m["pct"]*100))

            members[name] = member_data

        # order by rank
        sorted_members_by_rank = {}
        i = 1
        for m in members:
            for m in members:
                if members[m]["rank"] == i:
                    sorted_members_by_rank[m] = members[m]
            i += 1

        division_data["members"] = sorted_members_by_rank

        results = []
        for r in d["results"]:
            results_data = {}
            results_data["player1"] = r["player1"].strip()
            results_data["player2"] = r["player2"].strip()
            results_data["wins1"] = r["wins1"]
            results_data["wins2"] = r["wins2"]

            results.append(results_data)

        division_data["results"] = results

        # store division_data in divisions dictionary
        divisions[division] = division_data

    friendly_json["seasons"][season] = divisions


file = "../_data/friendly_league_history.json"
with open(file, 'w') as filetowrite:
    # convert python dictionary to json and write it
    json.dump(friendly_json, filetowrite)
