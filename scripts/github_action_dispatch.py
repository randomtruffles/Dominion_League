import requests
import time
import datetime

def send_dispatch_request():
    headers = {
        'Authorization': 'token 82dfb68e6059772aeefe2ec30a32f684be428af7',
        'Accept': 'application/vnd.github.v3+json',
    }
    data = '{"ref":"master"}'
    response = requests.post('https://api.github.com/repos/randomtruffles/Dominion_League/actions/workflows/5063578/dispatches', headers=headers, data=data)


if __name__ == '__main__':
    while True:
        print(f'{datetime.datetime.now()}: Sending request...')
        send_dispatch_request()
        print(f'{datetime.datetime.now()}: Done.')
        time.sleep(300)

#
# Save this for later
#
# curl \
# -H "Authorization: token 82dfb68e6059772aeefe2ec30a32f684be428af7" \
# -H "Accept: application/vnd.github.v3+json" \
# https://api.github.com/repos/randomtruffles/Dominion_League/actions/workflows
#
# {
#   "total_count": 1,
#   "workflows": [
#     {
#       "id": 5063578,
#       "node_id": "MDg6V29ya2Zsb3c1MDYzNTc4",
#       "name": "PullSheets",
#       "path": ".github/workflows/update_sheets.yml",
#       "state": "active",
#       "created_at": "2021-01-17T16:01:58.000-05:00",
#       "updated_at": "2021-01-31T18:13:29.000-05:00",
#       "url": "https://api.github.com/repos/randomtruffles/Dominion_League/actions/workflows/5063578",
#       "html_url": "https://github.com/randomtruffles/Dominion_League/blob/master/.github/workflows/update_sheets.yml",
#       "badge_url": "https://github.com/randomtruffles/Dominion_League/workflows/PullSheets/badge.svg"
#     }
#   ]
# }
#
#
# curl \
# -X POST \
# -H "Authorization: token 82dfb68e6059772aeefe2ec30a32f684be428af7" \
# -H "Accept: application/vnd.github.v3+json" \
# https://api.github.com/repos/randomtruffles/Dominion_League/actions/workflows/5063578/dispatches \
# -d '{"ref":"master"}'
