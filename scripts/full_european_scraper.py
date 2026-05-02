import json
import time
import os
from scrapling.fetchers import StealthyFetcher

# Mapeo de ligas extraído de PulsoOdds y IDs descubiertos
LEAGUES = [
    {"name": "LaLiga EA Sports", "slug": "espana/laliga-ea-sports", "id": "vcm2MhGk"},
    {"name": "Premier League", "slug": "inglaterra/premier-league", "id": "OEEq9Yvp"},
    {"name": "Bundesliga", "slug": "alemania/bundesliga", "id": "8UYeqfiD"},
    {"name": "Serie A", "slug": "italia/serie-a", "id": "6PWwAsA7"},
    {"name": "Ligue 1", "slug": "francia/ligue-1", "id": "j9QeTLPP"},
    {"name": "Eredivisie", "slug": "paises-bajos/eredivisie", "id": "dWKtjvdd"},
    {"name": "LaLiga Hypermotion", "slug": "espana/laliga-hypermotion", "id": "zPtBKWp2"},
    {"name": "Championship", "slug": "inglaterra/championship", "id": "WvIi7C9d"},
    {"name": "Liga Portugal", "slug": "portugal/liga-portugal", "id": "IgF19YCc"},
    {"name": "2. Bundesliga", "slug": "alemania/2-bundesliga", "id": "McQM1y7s"},
    {"name": "Serie B", "slug": "italia/serie-b", "id": "jwYYXp2E"},
    {"name": "Ligue 2", "slug": "francia/ligue-2", "id": "0STrMwIa"},
    {"name": "Serie A Betano / Brasil", "slug": "brasil/serie-a-betano", "id": "hdLUdQGi"},
    {"name": "MLS", "slug": "usa/mls", "id": "bgQzSI5N"}
]

TABS = [
    ("clasificacion", ["general", "local", "visitante"]),
    ("forma", ["general", "local", "visitante"]),
    ("mas-de_menos-de", ["general", "local", "visitante"]),
    ("ht_ft", ["general", "local", "visitante"]),
    ("goleadores", ["main"])
]

def extract_rows(page, tab_type):
    data = []
    if tab_type == "goleadores":
        rows = page.css('div.topScorers__row')
        for r in rows:
            texts = [t.strip() for t in r.css('*::text').getall() if t.strip() and t.strip() != "."]
            if len(texts) >= 4:
                data.append({
                    "pos": texts[0].replace(".", ""),
                    "jugador": texts[1],
                    "equipo": texts[2],
                    "goles": texts[3]
                })
    else:
        rows = page.css('div.ui-table__row')
        for r in rows:
            texts = [t.strip() for t in r.css('*::text').getall() if t.strip() and t.strip() != "."]
            if len(texts) >= 9:
                row_data = {
                    "pos": texts[0].replace(".", ""),
                    "equipo": texts[1],
                    "pj": texts[2],
                    "g": texts[3],
                    "e": texts[4],
                    "p": texts[5],
                    "goles": texts[6],
                    "pts": texts[8]
                }
                # Data specific to HT/FT or Over/Under is often in the extra cells
                if len(texts) > 9:
                    row_data["extra"] = texts[9:]
                data.append(row_data)
    return data

def run_full_scrape():
    all_leagues_data = []
    
    for league in LEAGUES:
        league_entry = {
            "liga": league["name"],
            "pais": league["slug"].split('/')[0],
            "data": {}
        }
        print(f"\n>>> PROCESANDO LIGA: {league['name']}")
        
        for tab_name, subtabs in TABS:
            league_entry["data"][tab_name] = {}
            for subtab in subtabs:
                if tab_name == "goleadores":
                    url = f"https://www.flashscore.es/futbol/{league['slug']}/clasificacion/{league['id']}/goleadores/"
                elif tab_name == "forma":
                    url = f"https://www.flashscore.es/futbol/{league['slug']}/clasificacion/{league['id']}/{tab_name}/{subtab}/5/"
                elif tab_name == "mas-de_menos-de":
                    url = f"https://www.flashscore.es/futbol/{league['slug']}/clasificacion/{league['id']}/{tab_name}/{subtab}/2.5/"
                else:
                    url = f"https://www.flashscore.es/futbol/{league['slug']}/clasificacion/{league['id']}/{tab_name}/{subtab}/"
                
                print(f"  -> Extrayendo {tab_name} / {subtab}...")
                try:
                    page = StealthyFetcher.fetch(url, network_idle=True)
                    rows = extract_rows(page, tab_name)
                    league_entry["data"][tab_name][subtab] = rows
                    print(f"     [OK] {len(rows)} filas extraidas.")
                except Exception as e:
                    print(f"     [ERROR] {e}")
                
                time.sleep(1.5) # Respeto por el servidor
        
        all_leagues_data.append(league_entry)

    # Guardar a JSON
    output_path = os.path.join(os.path.dirname(__file__), "data", "european_football_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_leagues_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nPROCESO COMPLETADO. Datos guardados en {output_path}")

if __name__ == "__main__":
    run_full_scrape()
