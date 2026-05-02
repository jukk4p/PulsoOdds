/**
 * upload-h2h-to-vps.js
 * Sube el JSON de H2H al VPS via webhook de n8n.
 * Uso: node scripts/upload-h2h-to-vps.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const JSON_PATH = path.join(__dirname, 'data/european_h2h_insights_5_matches.json');

// TEST:       https://n8n.ivangonzalez.cloud/webhook-test/recibir-datos-locales  (activa "Listen for test event" en n8n)
// PRODUCCIÓN: https://n8n.ivangonzalez.cloud/webhook/recibir-datos-locales       (flujo activado)
const WEBHOOK_URL = process.env.N8N_JSON_WEBHOOK_URL
  || 'https://n8n.ivangonzalez.cloud/webhook-test/recibir-datos-locales';

async function upload() {
  if (WEBHOOK_URL === 'PEGA_AQUI_TU_WEBHOOK_URL') {
    console.error('❌ Configura N8N_H2H_WEBHOOK_URL en .env.local o directamente en el script.');
    process.exit(1);
  }

  console.log('📂 Leyendo JSON local...');
  const raw = fs.readFileSync(JSON_PATH, 'utf8');
  const data = JSON.parse(raw);

  const totalPartidos = Object.values(data).reduce((acc, arr) => acc + arr.length, 0);
  console.log(`📊 ${Object.keys(data).length} ligas, ${totalPartidos} partidos.`);

  console.log(`📤 Enviando a n8n: ${WEBHOOK_URL}`);

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      h2h_data: data,
      fileName: '/tmp/european_h2h_insights_5_matches.json'
    }),
  });

  if (response.ok) {
    const text = await response.text();
    console.log(`✅ Subido correctamente. Respuesta n8n: ${text}`);
  } else {
    console.error(`❌ Error: ${response.status} ${response.statusText}`);
    const body = await response.text();
    console.error('Body:', body);
    process.exit(1);
  }
}

upload();
