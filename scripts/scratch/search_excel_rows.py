import pandas as pd
import sys

sys.stdout.reconfigure(encoding='utf-8')

try:
    xl = pd.ExcelFile('ligas_automatico_v5 (4).xlsx')
    for name in xl.sheet_names:
        df = pd.read_excel('ligas_automatico_v5 (4).xlsx', sheet_name=name)
        if not df.empty:
            # Search for Inter Miami or Palmeiras in any column
            mask = df.astype(str).apply(lambda x: x.str.contains('Miami|Palmeiras', case=False)).any(axis=1)
            matches = df[mask]
            if not matches.empty:
                print(f"--- MATCHES IN SHEET: {name} ---")
                print(matches)
                # Export these to help me later
                matches.to_json(f'PulsoOdds/scripts/data/matches_{name.replace(" ", "_")}.json', orient='records')
except Exception as e:
    print("Error:", e)
