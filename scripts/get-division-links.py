from __future__ import print_function
import pickle
import os.path
import json
from unidecode import unidecode
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
SEASON = 43
# Various sheets pages
MONITORING_SHEET = '1XkrotZ4ssniYYsWt-W_aJt_nrrT4GQltRcdBNDrcG_c'
RESULTS = 'Divisions!A2:I'

def getCurrentSeasonDivisions():
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    curr_season = {}
    file = './_data/current_season_links.json'
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
            if row[0] != "":
                division = row[0]
                link = row[8]
                curr_season[division] = link
                print(f"{division}: {link}")

    print(f"Retrieved {len(curr_season)} divisions...")
    print(f"Writing to {file}...")
    with open(file, 'w') as filetowrite:
        json.dump(curr_season, filetowrite)

if __name__ == '__main__':
    getCurrentSeasonDivisions()
