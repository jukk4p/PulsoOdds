import json
import os
from scrapling.fetchers import StealthyFetcher

NEW_LEAGUES = [
    {"name": "2. Bundesliga", "slug": "alemania/2-bundesliga"},
    {"name": "Serie B", "slug": "italia/serie-b"},
    {"name": "Ligue 2", "slug": "francia/ligue-2"},
    {"name": "Serie A Betano / Brasil", "slug": "brasil/serie-a-betano"},
    {"name": "MLS", "slug": "usa/mls"}
]

UPCOMING_FILE = os.path.join(os.path.dirname(__file__), "data", "upcoming_matches.json")

def get_matches():
    with open(UPCOMING_FILE, "r", encoding="utf-8") as f:
        matches_data = json.load(f)
        
    for league in NEW_LEAGUES:
        url = f"https://www.flashscore.es/futbol/{league['slug']}/partidos/"
        try:
            page = StealthyFetcher.fetch(url, network_idle=True)
            # Find elements with id starting with g_1_
            event_els = page.css('[id^="g_1_"]')
            match_ids = []
            for el in event_els[:10]: # Top 10 upcoming matches
                element_id = el.attrib.get("id", "")
                if element_id.startswith("g_1_"):
                    match_ids.append(element_id[4:])
                    
            if match_ids:
                matches_data[league["name"]] = match_ids
                print(f"[{league['name']}] Found {len(match_ids)} matches")
            else:
                print(f"[{league['name']}] No matches found")
        except Exception as e:
            print(f"[{league['name']}] Error: {e}")
            
    with open(UPCOMING_FILE, "w", encoding="utf-8") as f:
        json.dump(matches_data, f, indent=2, ensure_ascii=False)
        
if __name__ == "__main__":
    get_matches()
