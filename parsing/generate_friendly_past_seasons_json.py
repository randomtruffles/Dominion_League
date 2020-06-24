import json

# Open file containing all league history
with open('../_data/leagueHistory_20200602.json') as file:
    data = json.load(file)

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
        for m in d["members"]:
            members[m["name"]] = m
        division_data["members"] = members
        division_data["results"] = d["results"]

        # store division_data in divisions dictionary
        divisions[division] = division_data

    friendly_json["seasons"][season] = divisions


file = "../_data/friendly_league_history.json"
with open(file, 'w') as filetowrite:
    # convert python dictionary to json
    friendly_json = json.dump(friendly_json, filetowrite)

    """loaded_friendly_json = json.loads(friendly_json)
    filetowrite.write(loaded_friendly_json)"""
