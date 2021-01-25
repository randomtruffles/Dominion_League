from __future__ import print_function
import pickle
import os.path
import json
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

# Various sheets pages
MONITORING_SHEET = '1CIvRxhLL2XrwR0eQDt2FWhEgN1twtl6_r7BmHdFQeEE'
RESULTS = 'Condensed Results!A2:K'

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
    curr_season = {}
    file = './_data/current_season.json'
    creds = None
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

    if not values:
        print('No data found.')
    else:
        division_info = []
        for row in values:
            cols = len(row)
            if cols >= 7:
                division = row[0]
                players = row[1].split(',')
                pcts = row[2].split(',')
                wins = row[3].split(',')
                losses = row[4].split(',')
                ranks = row[5].split(',')
                p1s = row[6].split(',')
                p2s = row[7].split(',')
                wins1s = row[8].split(',')
                wins2s = row[9].split(',')
                late_drops = []
                if cols >= 11:
                    late_drops = row[10].split(',')
                    print(f"Getting the results for {division} with late drops: {late_drops}...")
                else:
                    print(f"Getting the results for {division}...")

                # Match results
                for idx in range(len(p1s)):
                    p1 = p1s[idx]
                    p2 = p2s[idx]
                    wins1 = wins1s[idx]
                    wins2 = wins2s[idx]
                    result = {"player1":p1, "player2":p2, "wins1":wins1, "wins2":wins2}
                    if division not in curr_season:
                        curr_season[division]={}
                        curr_season[division]["name"] = division
                        curr_season[division]["tier"] = division[0]
                        curr_season[division]["results"] = []
                        curr_season[division]["by_player"] = {}
                        curr_season[division]["late drops"] = late_drops
                        print(curr_season[division]["late drops"])
                    if p1 not in curr_season[division]["by_player"]:
                        curr_season[division]["by_player"][p1] = {}
                    if p2 not in curr_season[division]["by_player"]:
                        curr_season[division]["by_player"][p2] = {}
                    curr_season[division]["results"].append(result)
                    curr_season[division]["by_player"][p1][p2] = {"wins": wins1, "losses": wins2}
                    curr_season[division]["by_player"][p2][p1] = {"wins": wins2, "losses": wins1}

                # Member standings
                curr_season[division]["members"] = {}
                for p_idx, player in enumerate(players):
                    if player == "":
                        break
                    color = assign_color(float(pcts[p_idx][:-1]))
                    drop = "Yes" if player in late_drops else "No"
                    curr_season[division]["members"][player] = {"name": player, "rank":int(ranks[p_idx]), "wins":wins[p_idx], "losses":losses[p_idx], "pct": pcts[p_idx], "color": color, "drop":drop}


                # Tiebreaker values
                for player in players:
                    if player == "" or player in late_drops:
                        break
                    for opponent in players:
                        if opponent == "":
                            break
                        if player != opponent and opponent not in late_drops and opponent in curr_season[division]["by_player"][player]:
                            if curr_season[division]["members"][player]["pct"] == curr_season[division]["members"][opponent]["pct"]:
                                if "tiebreaker" in curr_season[division]["members"][player]:
                                    curr_season[division]["members"][player]["tiebreaker"] += curr_season[division]["by_player"][player][opponent]["wins"]
                                else:
                                    curr_season[division]["members"][player]["tiebreaker"] = curr_season[division]["by_player"][player][opponent]["wins"]

    print(f"Retrieved {len(curr_season)} divisions...")
    print(f"Writing to {file}...")
    with open(file, 'w') as filetowrite:
        json.dump(curr_season, filetowrite)

if __name__ == '__main__':
    getCurrentSeasonResults()
