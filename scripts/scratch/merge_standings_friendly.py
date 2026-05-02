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

# Friendly mapping for merger
FRIENDLY_NAMES = {
    "Spain - LaLiga": "LaLiga EA Sports",
    "Spain - LaLiga2": "LaLiga Hypermotion",
    "England - Premier League": "Premier League",
    "Germany - Bundesliga": "Bundesliga",
    "Italy - Serie A": "Serie A",
    "France - Ligue 1": "Ligue 1",
    "Netherlands - Eredivisie": "Eredivisie",
    "Portugal - Primeira Liga": "Liga Portugal",
    "England - Championship": "Championship",
    "Germany - 2. Bundesliga": "2. Bundesliga",
    "Italy - Serie B": "Serie B",
    "France - Ligue 2": "Ligue 2",
    "Brazil - Brasileiro Serie A": "Serie A Betano / Brasil",
    "USA - MLS": "MLS",
    "Europe - Euro": "Eurocopa",
    "World - World Cup": "Mundial"
}

# Group flat data by league
leagues_dict = {}
for entry in flat_data:
    original_liga = entry['liga']
    
    # Try to find friendly name
    liga_name = original_liga
    for k, v in FRIENDLY_NAMES.items():
        if original_liga.startswith(k):
            liga_name = original_liga.replace(k, v)
            break
            
    if liga_name not in leagues_dict:
        leagues_dict[liga_name] = []
    
    # Map to european_football_data format
    extra = ['?'] + list(entry['forma'])
    
    leagues_dict[liga_name].append({
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

# Merge into master_data
for liga_name, teams in leagues_dict.items():
    found = False
    for item in master_data:
        if item['liga'] == liga_name:
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

print(f"Merged standings with friendly names into {data_json}")
