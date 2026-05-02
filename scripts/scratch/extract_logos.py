import pandas as pd
import sys

# Set encoding for output
sys.stdout.reconfigure(encoding='utf-8')

try:
    xl = pd.ExcelFile('ligas_automatico_v5 (4).xlsx')
    names = xl.sheet_names
    print("Sheet names:", [n for n in names])
    
    for name in names:
        if 'Consolidado' in name:
            df = pd.read_excel('ligas_automatico_v5 (4).xlsx', sheet_name=name)
            print(f"\nSheet: {name}")
            print(f"Rows: {len(df)}")
            if len(df) > 0:
                print(df[['Nombre Publico', 'Logo Equipo']].dropna().head(10))
                # Save all unique team logos
                logos = df[['Nombre Publico', 'Logo Equipo']].dropna().drop_duplicates()
                logos.to_json('PulsoOdds/scripts/data/temp_logos.json', orient='records')
except Exception as e:
    print("Error:", e)
