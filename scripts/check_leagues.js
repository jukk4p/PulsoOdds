const axios = require('axios');

const SHEET_ID = "1oN_W3RTwVaxZm5zyKv8HQwgUsjAEZlpJSCFDe21GJWI";
const CONSOLIDATED_GID = "1177125270";

async function checkSheet() {
  console.log("🔍 Verificando ligas en el Google Sheet...");
  const response = await axios.get(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${CONSOLIDATED_GID}`);
  const csvData = response.data;
  
  const rows = csvData.split('\n').map(row => row.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
  const header = rows[0].map(h => h.toLowerCase());
  const leagueIdx = header.indexOf("liga");

  if (leagueIdx === -1) {
    console.log("❌ No se encontró la columna 'Liga'. Cabecera:", header);
    return;
  }

  const leaguesInSheet = [...new Set(rows.slice(1).map(r => r[leagueIdx]).filter(Boolean))];
  console.log("✅ Ligas encontradas en el Sheet:", leaguesInSheet);
}

checkSheet();
