import os
import json
import requests
from dotenv import load_dotenv

# Cargar variables de entorno (asume que existe un .env.local en la carpeta principal)
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(env_path)

WEBHOOK_URL = os.environ.get("N8N_JSON_WEBHOOK_URL")

# Archivos a subir
FILES_TO_UPLOAD = {
    "h2h": os.path.join(os.path.dirname(__file__), "data", "european_h2h_insights_5_matches.json"),
    "classification": os.path.join(os.path.dirname(__file__), "data", "european_football_data.json")
}

def upload_files():
    if not WEBHOOK_URL:
        print("ERROR: No se encontró N8N_WEBHOOK_URL en el archivo .env.local")
        # Fallback manual por si acaso
        # WEBHOOK_URL = "TU_URL_DEL_WEBHOOK_AQUI"
        return

    for doc_type, file_path in FILES_TO_UPLOAD.items():
        if not os.path.exists(file_path):
            print(f"Omitiendo {doc_type}: No se encontró el archivo {file_path}")
            continue
            
        print(f"Subiendo {doc_type} a n8n...")
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                payload = {
                    "type": doc_type,
                    "data": json.load(f)
                }
                
            response = requests.post(WEBHOOK_URL, json=payload, headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                print(f" [OK] {doc_type} subido correctamente.")
            else:
                print(f" [FAIL] Error al subir {doc_type}. Código: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f" [ERROR] Excepción al enviar {doc_type}: {e}")

if __name__ == "__main__":
    upload_files()
