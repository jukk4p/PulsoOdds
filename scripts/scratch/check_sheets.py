import pandas as pd

try:
    xl = pd.ExcelFile('ligas_automatico_v5 (4).xlsx')
    print("Sheet names:", xl.sheet_names)
except Exception as e:
    print("Error:", e)
