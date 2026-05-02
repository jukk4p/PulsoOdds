import json
import time
import os
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

MATCHES_FILE = os.path.join(os.path.dirname(__file__), "data", "upcoming_matches.json")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "data", "european_h2h_insights_5_matches.json")

def calculate_form_points(results):
    pts = 0
    for r in results:
        res = r.get("resultado", "").upper()
        if "G" in res or "W" in res or "V" in res: pts += 3
        elif "E" in res or "D" in res: pts += 1
    return pts

def extract_h2h_section(section):
    title_el = section.select_one('.h2h__sectionTitle')
    title = title_el.text.strip() if title_el else "Unknown"
    
    rows = section.select('.h2h__row')
    data = []
    
    for r in rows[:5]: # Aseguramos capturar hasta 5
        date_el = r.select_one('.h2h__datetime')
        date = date_el.text.strip() if date_el else "N/A"
        
        event_el = r.select_one('.h2h__event')
        event = event_el.text.strip() if event_el and event_el.text.strip() else (event_el.get('title', 'N/A') if event_el else "N/A")
            
        teams = [t.text.strip() for t in r.select('.h2h__participantInner')]
        
        score_parts = [s.text.strip() for s in r.select('.h2h__result span')]
        score = ":".join(score_parts) if score_parts else "N/A"
        
        icon_el = r.select_one('.h2h__icon')
        icon = icon_el.get('title', '?') if icon_el else "?"
        
        data.append({
            "fecha": date,
            "evento": event,
            "equipos": teams,
            "marcador": score,
            "resultado": icon
        })
    return title, data

def run_h2h_scrape():
    with open(MATCHES_FILE, "r", encoding="utf-8") as f:
        leagues = json.load(f)

    all_h2h_results = {}
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        for league_name, match_ids in leagues.items():
            print(f"\n>>> PROCESANDO: {league_name}")
            all_h2h_results[league_name] = []
            
            for mid in match_ids:
                url = f"https://www.flashscore.es/partido/{mid}/#/h2h/general"
                try:
                    page.goto(url)
                    time.sleep(2) # Espera a carga inicial
                    
                    # Intentar clickar todos los botones de "Mostrar más partidos"
                    buttons = page.locator("text='Mostrar más partidos'")
                    for i in range(buttons.count()):
                        try:
                            buttons.nth(i).click()
                            time.sleep(0.5)
                        except:
                            pass
                            
                    time.sleep(1) # Espera a que se desplieguen los nuevos datos
                    
                    # Parsear con BeautifulSoup para facilitar extracción
                    html = page.content()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    home_el = soup.select_one('.duelParticipant__home .participant__participantName')
                    away_el = soup.select_one('.duelParticipant__away .participant__participantName')
                    
                    if not home_el:
                        print(f"     [FAIL] No cargó H2H para {mid}")
                        continue
                        
                    h2h_data = {
                        "match_id": mid,
                        "home": home_el.text.strip(),
                        "away": away_el.text.strip(),
                        "sections": {}
                    }
                    
                    sections = soup.select('.h2h__section')
                    for sec in sections:
                        title, rows = extract_h2h_section(sec)
                        if title:
                            h2h_data["sections"][title] = rows
                            
                    # Insights
                    insights = {}
                    for title, rows in h2h_data["sections"].items():
                        if "Últimos partidos" in title:
                            team_name = title.replace("Últimos partidos:", "").strip()
                            pts = calculate_form_points(rows)
                            key = "puntos_forma_home" if team_name in h2h_data["home"] else "puntos_forma_away"
                            insights[key] = f"{pts}/{len(rows)*3}"
                        elif "Enfrentamientos directos" in title:
                            wins_home = 0
                            for r in rows:
                                if "G" in r.get("resultado", "").upper(): wins_home += 1
                            insights["dominio_h2h"] = f"H2H con {len(rows)} partidos previos"
                            
                    h2h_data["insights"] = insights
                    all_h2h_results[league_name].append(h2h_data)
                    print(f"     [OK] {h2h_data['home']} vs {h2h_data['away']} | 5 enfrentamientos expandidos")
                    
                    # Guardado incremental
                    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                        json.dump(all_h2h_results, f, indent=2, ensure_ascii=False)
                        
                except Exception as e:
                    print(f"     [ERROR] {mid}: {e}")
                
                time.sleep(1)
        
        browser.close()
    print(f"\nTODO LISTO. Archivo: {OUTPUT_FILE}")

if __name__ == "__main__":
    run_h2h_scrape()
