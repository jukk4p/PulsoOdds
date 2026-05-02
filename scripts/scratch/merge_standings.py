import json
import os

# Paths
standings_json = 'PulsoOdds/public/standings.json'
data_json = 'PulsoOdds/scripts/data/european_football_data.json'

if not os.path.exists(standings_json):
    print(f"Error: {standings_json} not found.")
    exit(1)

with open(standings_json, 'r', encoding='utf-8') as f:
    flat_data = json.load(f)

with open(data_json, 'r', encoding='utf-8') as f:
    master_data = json.load(f)

# Group flat data by league
leagues_dict = {}
for entry in flat_data:
    liga = entry['liga']
    if liga not in leagues_dict:
        leagues_dict[liga] = []
    
    # Map to european_football_data format
    # "extra" field is used for racha in the API
    extra = ['?'] + list(entry['forma'])
    
    leagues_dict[liga].append({
        "pos": str(entry['pos']),
        "equipo": entry['equipo'],
        "pj": str(entry['pj']),
        "g": str(entry['pg']),
        "e": str(entry['pe']),
        "p": str(entry['pp']),
        "goles": entry['goles'],
        "pts": str(entry['pts']),
        "extra": extra,
        "racha": entry['forma'],
        "logo": entry['logo_equipo']
    })

# Leagues to ensure are in master_data
target_leagues = ["Eurocopa", "Mundial", "MLS", "Serie A Betano / Brasil"]

for liga_name, teams in leagues_dict.items():
    # Find if league already exists in master_data
    found = False
    for item in master_data:
        if item['liga'] == liga_name:
            # Update existing league data (general only since scraper only does general)
            item['data']['clasificacion']['general'] = teams
            found = True
            break
    
    if not found:
        # Add new league
        new_league = {
            "liga": liga_name,
            "pais": "internacional",
            "data": {
                "clasificacion": {
                    "general": teams,
                    "local": [],
                    "visitante": []
                }
            }
        }
        master_data.append(new_league)

with open(data_json, 'w', encoding='utf-8') as f:
    json.dump(master_data, f, indent=2, ensure_ascii=False)

print(f"Merged standings into {data_json}")
