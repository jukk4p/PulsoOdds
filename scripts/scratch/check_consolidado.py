import pandas as pd
import sys

# Set encoding for output
sys.stdout.reconfigure(encoding='utf-8')

try:
    df = pd.read_excel('ligas_automatico_v5 (4).xlsx', sheet_name='n8n_Consolidado', header=None)
    print("Shape:", df.shape)
    if df.shape[0] > 0:
        print(df.head(20))
    else:
        print("Sheet is truly empty")
except Exception as e:
    print("Error:", e)
