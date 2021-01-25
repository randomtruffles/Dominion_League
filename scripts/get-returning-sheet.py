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
RETURNING_SHEET = '1Y46GqJXROk0weVtVgriu7MTYROUDP-K4a2T--vhNmBU'
RETURNING_RESPONSES = 'Returning Responses!B2:C'

def getCurrentSeasonReturning():
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    returning_responses = {}
    file = './_data/current_season_returning.json'
    if RETURNING_SHEET == '':
        print("No returning sheet detected. Writing empty file")
        with open(file, 'w') as filetowrite:
            json.dump(returning_responses, filetowrite)
        return
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
    result = sheet.values().get(spreadsheetId=RETURNING_SHEET,
                                range=RETURNING_RESPONSES).execute()
    values = result.get('values', [])

    if not values:
        print('No data found.')
    else:
        print("Getting the returning responses of players...")
        for row in values:
            player = row[0]
            response = row[1]
            if player in returning_responses and returning_responses[player] != response:
                returning_responses[player] = "?"
            else:
                returning_responses[player] = "Y" if response == "Yes!" else "N"

        print(f"Retrieved {len(returning_responses)} responses...")

    print(f"Writing to file: {file}")
    with open(file, 'w') as filetowrite:
        json.dump(returning_responses, filetowrite)

if __name__ == '__main__':
    getCurrentSeasonReturning()
