import csv
import re
import os

# Paths
csv_path = 'PulsoOdds/flashscore_standings.csv'
md_path = 'PulsoOdds/diccionario_maestro_equipos.md'

# Load logos from CSV
logos = {}
with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        team_name = row['Nombre Publico'].strip()
        logo_url = row['Logo Equipo'].strip()
        if logo_url and not logo_url.endswith('bg.png'):
            logos[team_name] = logo_url

print(f"Loaded {len(logos)} logos from CSV.")

# Update Markdown
with open(md_path, mode='r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
updated_count = 0

for line in lines:
    if '|' in line and not '---' in line and not 'Origen Sheets' in line:
        parts = line.split('|')
        if len(parts) >= 5:
            # parts[0] is empty before first |
            # parts[1] is Origen Sheets
            # parts[2] is Puente API
            # parts[3] is Nombre Publico (usually **Name**)
            # parts[4] is Logo
            
            public_name = parts[3].strip().replace('**', '')
            current_logo = parts[4].strip()
            
            if public_name in logos and (not current_logo or current_logo == ''):
                logo_url = logos[public_name]
                parts[4] = f" ![Logo]({logo_url}) "
                line = '|'.join(parts)
                updated_count += 1
    new_lines.append(line)

with open(md_path, mode='w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Updated {updated_count} logos in {md_path}")
