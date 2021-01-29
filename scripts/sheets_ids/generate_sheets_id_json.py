import json
with open('./scripts/sheets_ids/sheets_ids.txt') as raw:
    sheets_id = [id.rstrip('\n') for id in raw]

tier_names = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "P"]
tier_counts = [1, 2, 4, 4, 8, 14, 13, 25, 25, 26, 4]

sheets_id_dict = {}
tier_idx = 0
tier_count = 1
for id in sheets_id:
    tier = tier_names[tier_idx] + str(tier_count)
    print(f"Current tier: {tier}")
    if tier_count == tier_counts[tier_idx]:
        tier_count = 1
        tier_idx += 1
    else:
        tier_count += 1
    sheets_id_dict[tier] = id.replace('https://docs.google.com/spreadsheets/d/','')

with open(f"./scripts/sheets_ids.json", 'w') as filetowrite:
    json.dump(sheets_id_dict, filetowrite)
