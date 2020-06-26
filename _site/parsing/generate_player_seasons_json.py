import json

# Open file containing all (pretty) league history
with open('../_data/friendly_league_history.json') as file:
    data = json.load(file)
with open('../_data/youtube_channels.json') as file:
    channels = json.load(file)
"""
players is a dictionary mapping player name to player information
{
    //Eg. player_name = "Mic Qsenoch"
    player_name : [ list of dicts
        {
            "season" : str, // Eg. "27"
            "division" : str // Eg. "A1"
        }
    ]
}
"""
players = {}
players_to_case_sensitive_name = {}
# Load seasons
seasons = data["seasons"]

for s_key in seasons.keys():
    season = s_key
    season_data = seasons[s_key]
    for division in season_data.keys():
        if division == "champion":
            continue # only care about division information
        members_data = season_data[division]["members"]

        # Add member data
        for member in members_data.keys():
            case_insensitive_member = member.lower()
            if case_insensitive_member in players:
                players[case_insensitive_member] = players[case_insensitive_member] + [{"season": season, "division" : division}]
            else:
                players[case_insensitive_member] = [{"season": season, "division" : division}]
            players_to_case_sensitive_name[case_insensitive_member] = member

sorted_players = {}
# Sort player data
for player in players.keys():
    player_data = players[player]
    # Sort by season
    player_data.sort(key=lambda x: int(x["season"]))
    channel = channels[player]["channel"] if player in channels else ""
    sorted_players[player] = {"name" : players_to_case_sensitive_name[player], "channel" : channel, "seasons" : player_data}

file = "../_data/player_and_seasons_played.json"
with open(file, 'w') as filetowrite:
    # convert python dictionary to json and write it
    json.dump(sorted_players, filetowrite)
