import pandas as pd
try:
    df = pd.read_excel('ligas_automatico_v5 (4).xlsx', sheet_name='Picks')
    print(df.head(20))
    print(df.columns)
except Exception as e:
    print(e)
