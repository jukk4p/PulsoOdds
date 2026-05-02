import pandas as pd
import sys

# Set encoding for output
sys.stdout.reconfigure(encoding='utf-8')

try:
    df = pd.read_excel('ligas_automatico_v5 (4).xlsx', sheet_name='📊 Resumen Global')
    print("Shape:", df.shape)
    print(df.head(10))
    print("\nUnique values in first column:")
    print(df.iloc[:, 0].unique())
except Exception as e:
    print("Error:", e)
