from __future__ import print_function
import pickle
import os.path
import json
#from unidecode import unidecode
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
SEASON = 44
# Various sheets pages
MONITORING_SHEET = '12NJWadagLRgk_MtF3EnIp_0v8Db614IJTBOr_kRg1ZE'
RESULTS = 'Results!C2:O'
THRESHOLD = 10
# Open file containing all league history and sheets ids
FILE = './_data/current_season.json'
with open(FILE) as file_to_load:
    curr_season = json.load(file_to_load)

def assign_color(value):
    value = int(value)
    gradient = ["E77B72", "E88372", "EA8C71", "EC956F", "EF9E6E", "F2A76D", "F4B06B", "F7B96B", "F9C269", "FCCB67", "FED467", "F2D467", "E2D26B", "D0CF6F", "C0CC73", "AFCA76", "9EC77A", "8CC47E", "7CC181", "6DBF84", "5BBC88"]
    steps = len(gradient)
    range = 101
    def bgcolor(color):
        return "#{}".format(color)

    return bgcolor(gradient[(value*steps)//101])

def fpct(pct):
    return "{0:.0%}".format(pct)

def getCurrentSeasonResults():
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    creds = None

    #TIERS = [ ("A", 1), ("B", 2), ("C", 4),
    #          ("D", 4), ("E", 8), ("F", 14),
    #          ("G", 13), ("H", 25), ("I", 25),
    #          ("J", 26), ("P",4)]
    #CUR_TIER_IDX = 0
    #CUR_DIV = 1
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('./scripts/token.pickle'):
        with open('./scripts/token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                './scripts/credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('./scripts/token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('sheets', 'v4', credentials=creds)

    # Call the Sheets API
    sheet = service.spreadsheets()
    print(f"Getting the information standings...")
    result = sheet.values().get(spreadsheetId=MONITORING_SHEET,
                                range=RESULTS).execute()
    values = result.get('values', [])

    matches_complete = 0
    if "matches complete" not in curr_season:
        curr_season["matches complete"] = 0

    if not values:
        print('No data found.')
    else:
        for row in values:
            cols = len(row)
            if cols >= 8:
                division = row[0]
                try:
                    players = row[1].split(',')
                    if (players == ["#REF!"]): continue
                    pcts = row[2].split(',')
                    wins = row[3].split(',')
                    losses = row[4].split(',')
                    tiers = row[5].split(',')
                    p1s = row[6].split(',')
                    p2s = row[7].split(',')
                    wins1s = row[8].split(',')
                    wins2s = row[9].split(',')
                    #comments = row[10].split(',')
                    returnings = row[11].split(',')

                    late_drops = []
                    if cols >= 13:
                        late_drops = row[12].split(',')
                        print(f"Getting the results for {division} with late drops: {late_drops}...")
                    else:
                        print(f"Getting the results for {division}...")

                    # Gen curr_division dictionary
                    curr_division = {}
                    curr_division["name"] = division
                    curr_division["tier"] = division[0]
                    curr_division["results"] = []
                    curr_division["by_player"] = {}
                    curr_division["late drops"] = late_drops
                    curr_division["complete?"] = "Yes"

                    tiers_error = False
                    if tiers == ["#N/A"]:
                        tiers_error = True
                        tiers == []

                    for p_idx, p in enumerate(players):
                        if p
                        if tiers_error:
                            tiers.append("TBD");

                        if p not in curr_season["players"]:
                            curr_season["players"][p.lower()] = {"name":p, "tier":division[0], "division": division}
                        if p not in curr_division["by_player"]:
                            curr_division["by_player"][p] = {}
                            curr_division["by_player"][p]["games_nondrop"] = 0
                            curr_division["by_player"][p]["wins_nondrop"] = 0
                            curr_division["by_player"][p]["losses_nondrop"] = 0
                            curr_division["by_player"][p]["wins"] = 0
                            curr_division["by_player"][p]["losses"] = 0
                    print(1, end='')

                    # Match results
                    num_matches = 0 if p1s == [''] else len(p1s)
                    if (division == "A1"):
                        print(p1s)
                        print(p2s)
                        print(wins1s)
                        print(wins2s)

                    for idx in range(num_matches):
                        p1 = p1s[idx]
                        p2 = p2s[idx]
                        wins1 = wins1s[idx]
                        wins2 = wins2s[idx]

                        result = {"player1":p1, "player2":p2, "wins1":wins1, "wins2":wins2} #, "comments":comment}

                        if p1 not in curr_division["by_player"][p2]:
                            curr_division["by_player"][p2][p1] = {"wins": 0, "losses": 0, "complete": "No", "sessions": 0}
                        if p2 not in curr_division["by_player"][p1]:
                            curr_division["by_player"][p1][p2] = {"wins": 0, "losses": 0, "complete": "No", "sessions": 0}
                        curr_division["results"].append(result)
                        curr_division["by_player"][p1]["wins"] += float(wins1)
                        curr_division["by_player"][p2]["wins"] += float(wins2)
                        curr_division["by_player"][p1]["losses"] += float(wins2)
                        curr_division["by_player"][p2]["losses"] += float(wins1)
                        curr_division["by_player"][p1][p2]["wins"] += float(wins1)
                        curr_division["by_player"][p1][p2]["losses"] += float(wins2)
                        curr_division["by_player"][p2][p1]["wins"] += float(wins2)
                        curr_division["by_player"][p2][p1]["losses"] += float(wins1)
                        curr_division["by_player"][p1][p2]["sessions"] += 1
                        curr_division["by_player"][p2][p1]["sessions"] += 1
                        if int(curr_division["by_player"][p1][p2]["wins"] + curr_division["by_player"][p1][p2]["losses"]) == 6:
                            curr_division["by_player"][p1][p2]["complete"] = "Yes"
                            curr_division["by_player"][p2][p1]["complete"] = "Yes"
                            matches_complete += 1
                        if p1 not in late_drops:
                            curr_division["by_player"][p2]["games_nondrop"] += int(float(wins1) + float(wins2))
                            curr_division["by_player"][p2]["wins_nondrop"] += float(wins2)
                            curr_division["by_player"][p2]["losses_nondrop"] += float(wins1)
                        if p2 not in late_drops:
                            curr_division["by_player"][p1]["games_nondrop"] += int(float(wins1) + float(wins2))
                            curr_division["by_player"][p1]["wins_nondrop"] += float(wins1)
                            curr_division["by_player"][p1]["losses_nondrop"] += float(wins2)

                    print(2, end='')
                    total_games = (len(players) - len(late_drops) - 1)*6
                    # Member standings
                    curr_division["members"] = {}
                    error = False
                    for p_idx, player in enumerate(players):
                        if player == "":
                            break
                        p_pct = pcts[p_idx]
                        if p_pct == "":
                            error = True
                            continue
                        print("2a", end='')
                        color = assign_color(float(pcts[p_idx][:-1]))
                        drop = "Yes" if player in late_drops else "No"
                        if curr_division["by_player"][player]["games_nondrop"] < total_games or "TBD" in tiers[p_idx]:
                            curr_division["complete?"] = "No"
                        print("2b", end='')

                        returning = "?" if returnings[p_idx] == "" else returnings[p_idx]
                        curr_division["members"][player] = \
                            {"name": player, "wins":wins[p_idx], "losses":losses[p_idx], \
                             "pct": pcts[p_idx], "color": color, "tiebreaker": 0, \
                             "drop":drop, "next tier":tiers[p_idx], \
                             "returning": returning,\
                             "games_wdrop":curr_division["by_player"][player]["wins"]+curr_division["by_player"][player]["losses"], \
                             "wins_wdrop":curr_division["by_player"][player]["wins"], \
                             "losses_wdrop":curr_division["by_player"][player]["losses"], \
                             "games_nondrop":curr_division["by_player"][player]["games_nondrop"], \
                             "wins_nondrop":curr_division["by_player"][player]["wins_nondrop"], \
                             "losses_nondrop":curr_division["by_player"][player]["losses_nondrop"]}

                    print(3, end='')
                    # Tiebreaker values
                    for player in players:
                        if player == "" or player in late_drops:
                            break
                        for opponent in players:
                            if opponent == "":
                                break
                            if player != opponent and opponent not in late_drops and opponent in curr_division["by_player"][player]:
                                if curr_division["members"][player]["pct"] == curr_division["members"][opponent]["pct"]:
                                        curr_division["members"][player]["tiebreaker"] += curr_division["by_player"][player][opponent]["wins"]
                    print(4, end='')

                    # Figure out ranks
                    rank = 1
                    for p_idx, player in enumerate(players):
                        if player == "":
                            break
                        if p_idx == 0:
                            curr_division["members"][player]["rank"] = rank
                            continue
                        opponent = players[p_idx-1]
                        if curr_division["members"][player]["pct"] == curr_division["members"][opponent]["pct"] and curr_division["members"][opponent]["tiebreaker"] == curr_division["members"][player]["tiebreaker"]:
                            curr_division["members"][player]["rank"] = rank
                        else:
                            rank = p_idx + 1
                            curr_division["members"][player]["rank"] = rank

                    curr_season[division] = curr_division
                    print(5)

                except Exception as e:
                    print("*****************")
                    print(f"ERROR with {division}")
                    print(e)
                    print("*****************")

    if curr_season["matches complete"] - matches_complete > THRESHOLD:
        print(f"Error retrieving up to date results. Did not meet THRESHOLD={THRESHOLD}")
    else:
        print(f"Retrieved {len(curr_season)} divisions...")
        curr_season_matches_complete = curr_season["matches complete"]
        print(f"Retrieved {matches_complete} matches (old = {curr_season_matches_complete})...")
        curr_season["matches complete"] = matches_complete
        print(f"Writing to {FILE}...")
        with open(FILE, 'w') as filetowrite:
            json.dump(curr_season, filetowrite)

if __name__ == '__main__':
    getCurrentSeasonResults()
