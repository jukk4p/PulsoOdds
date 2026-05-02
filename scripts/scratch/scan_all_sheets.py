import pandas as pd
import sys

# Set encoding for output
sys.stdout.reconfigure(encoding='utf-8')

try:
    xl = pd.ExcelFile('ligas_automatico_v5 (4).xlsx')
    names = xl.sheet_names
    
    for name in names:
        df = pd.read_excel('ligas_automatico_v5 (4).xlsx', sheet_name=name)
        print(f"Sheet: {name}, Rows: {len(df)}")
        if len(df) > 0:
            cols = df.columns.tolist()
            print(f"  Columns: {cols[:5]}")
            # Look for MLS or Brazil in the content
            if df.astype(str).apply(lambda x: x.str.contains('MLS|Brasil|Brazil', case=False)).any().any():
                print(f"  *** Potential Match in {name} ***")
                # Save logos if found
                if 'Nombre Publico' in df.columns and 'Logo Equipo' in df.columns:
                    logos = df[['Nombre Publico', 'Logo Equipo']].dropna().drop_duplicates()
                    if len(logos) > 0:
                        logos.to_json(f'PulsoOdds/scripts/data/logos_{name.replace(" ", "_")}.json', orient='records')
                        print(f"  Saved {len(logos)} logos")

except Exception as e:
    print("Error:", e)
