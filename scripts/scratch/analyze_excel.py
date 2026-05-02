import pandas as pd

try:
    df = pd.read_excel('ligas_automatico_v5 (4).xlsx', sheet_name='n8n_Consolidado')
    print("Columns:", df.columns.tolist())
    print("\nFirst 5 rows:")
    print(df.head())
except Exception as e:
    print("Error:", e)
