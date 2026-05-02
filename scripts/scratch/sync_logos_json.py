import json
import re
import os

md_path = 'PulsoOdds/diccionario_maestro_equipos.md'
logos_path = 'PulsoOdds/scripts/data/logos_dictionary.json'

logos_dict = {"teams": {}, "leagues": {}}

# Extraer logos de ligas
with open(md_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Ligas: ### Nombre \n ![Logo](url)
league_matches = re.finditer(r'### (.*?)\n!\[Logo .*?\]\((.*?)\)', content)
for m in league_matches:
    name = m.group(1).strip()
    url = m.group(2).strip()
    logos_dict["leagues"][name] = url
    # Aliases
    if "LaLiga EA Sports" in name: logos_dict["leagues"]["La Liga"] = url

# Equipos: | Origen | Puente | Nombre | Logo |
lines = content.split('\n')
for line in lines:
    if '|' in line and not '---' in line and not 'Origen Sheets' in line:
        parts = [p.strip() for p in line.split('|')]
        if len(parts) >= 5:
            sheet_name = parts[1]
            public_name = parts[3].replace('**', '')
            logo_part = parts[4]
            logo_match = re.search(r'\((.*?)\)', logo_part)
            logo_url = logo_match.group(1) if logo_match else ""
            
            if logo_url:
                if sheet_name: logos_dict["teams"][sheet_name] = logo_url
                if public_name: logos_dict["teams"][public_name] = logo_url

with open(logos_path, 'w', encoding='utf-8') as f:
    json.dump(logos_dict, f, indent=2, ensure_ascii=False)

print(f"Updated {logos_path} with logos from markdown.")
