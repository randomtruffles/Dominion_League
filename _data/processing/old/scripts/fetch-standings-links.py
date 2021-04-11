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
SEASON = 44
# Various sheets pages

MONITORING_SHEET = '1MlvGT4LUM-fWd3InOiyqLKQmDRlW4dxfHnCqLC5H9nU'

RESULTS = 'Divisions!A2:J'
IDX = 8

# S33_SHEET = ''1YAyT6mhcAu-xW0eVkJCcFgZ8MyHCvnBo78fzi30E3XA'
# S34_SHEET = '17yDJGab7FBQDLQp1jv7VitqsuX46m3hLdWEyZ2Wl9oc';
# S35_SHEET = '1X5O5jxKJnB9g8t5UX3P6yXuxGEVQrm5hDychA66-Jiw'
# S36_SHEET = '1ium9KCOvtHbukxKtk0adI-fvQLF0AVcTHtPEbsf9QDk'
# S37_SHEET = '1o2Hnwxj1EyrR3OLW4lVLFOjwx52XnnFusH_CqrJdpOQ'
# S38_SHEET = '1NyisBjXFD35mobM3pv0R4fly6Sbw2MzyXXf3v86Vj_I'
# S39_SHEET = '1zE_zO77UvmIsrTVkcKxWff9LK_w8T7R2j40hXy4Hpls'
# S40_SHEET = '1CngQ5sbD2snbyG3DYm62Mc-YgJ1oP5iL5O8PxTkoeTg'
# S41_SHEET =  '1ZRQIQmL1Z8i1nd21ivAD4Dg1eWoD00K-gvf_U6_Ci40'
# S42_SHEET = '1gIgGelsX9ZwS3vPrEc6zWvBbNy0N2zzkz1f_YPGcNgs'
# S43_SHEET = '1XkrotZ4ssniYYsWt-W_aJt_nrrT4GQltRcdBNDrcG_c'

def getCurrentSeasonDivisions():
    """Shows basic usage of the Sheets API.
    Prints values from a sample spreadsheet.
    """
    with open('./_data/sheet_links.json') as file:
        data = json.load(file)

    curr_season = {}
    file = './_data/sheet_links.json'
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
            if cols >= IDX + 1 and row[0] != "":
                    division = row[0]
                    link = row[IDX]
                    curr_season[division] = link
                    print(f"{division}: {link}")

    print(f"Retrieved {len(curr_season)} divisions for Season {SEASON}...")
    print(f"Writing to {file}...")
    data[SEASON] = curr_season
    with open(file, 'w') as filetowrite:
        json.dump(data, filetowrite)

if __name__ == '__main__':
    getCurrentSeasonDivisions()
