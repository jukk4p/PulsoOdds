import json
import os

def update_json():
    json_path = r'c:\Users\jukkaP\Desktop\skill\PulsoOdds\scripts\data\european_football_data.json'
    logos_path = r'c:\Users\jukkaP\Desktop\skill\PulsoOdds\scripts\data\logos_dictionary.json'
    
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found")
        return
        
    with open(json_path, 'r', encoding='utf-8') as f:
        all_data = json.load(f)
        
    logos_dict = {"teams": {}, "leagues": {}}
    if os.path.exists(logos_path):
        with open(logos_path, 'r', encoding='utf-8') as f:
            logos_dict = json.load(f)
            
    for league_item in all_data:
        league_name = league_item.get('liga')
        
        # Actualizar logo de liga si existe en el diccionario
        if league_name in logos_dict['leagues']:
            league_item['league_logo'] = logos_dict['leagues'][league_name]
            
        clasificacion = league_item.get('data', {}).get('clasificacion', {}).get('general', [])
        
        for row in clasificacion:
            # 1. Integrar la forma (racha)
            raw_form = row.get('extra', [])
            clean_form = "".join([f for f in raw_form if f != '?'])[-5:]
            row['racha'] = clean_form
            
            # 2. Integrar logos de equipos
            team_name = row.get('equipo')
            if team_name in logos_dict['teams']:
                row['logo'] = logos_dict['teams'][team_name]
                
    # Guardar el JSON actualizado
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully updated {json_path} with logos and form.")

if __name__ == "__main__":
    update_json()
