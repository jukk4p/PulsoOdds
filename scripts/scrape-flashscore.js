const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

/**
 * CONFIGURACIÓN
 */
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

const LEAGUES = [
  { name: "La Liga", slug: "espana/laliga-ea-sports", id: "140" },
  { name: "Premier League", slug: "inglaterra/premier-league", id: "39" },
  { name: "Bundesliga", slug: "alemania/bundesliga", id: "78" },
  { name: "Serie A", slug: "italia/serie-a", id: "135" },
  { name: "Ligue 1", slug: "francia/ligue-1", id: "61" },
  { name: "Eredivisie", slug: "paises-bajos/eredivisie", id: "88" },
  { name: "Segunda División", slug: "espana/laliga-hypermotion", id: "141" },
  { name: "Championship", slug: "inglaterra/championship", id: "40" },
  { name: "2. Bundesliga", slug: "alemania/2-bundesliga", id: "79" },
  { name: "Serie B", slug: "italia/serie-b", id: "136" },
  { name: "Ligue 2", slug: "francia/ligue-2", id: "62" }
];

const TEAM_IDS = {
  // España - LaLiga
  "Barcelona": "529", "Real Madrid": "541", "Villarreal": "533", "Atlético de Madrid": "530",
  "Real Betis": "543", "Celta de Vigo": "538", "Real Sociedad": "548", "Getafe": "546",
  "Osasuna": "727", "Espanyol": "532", "Athletic Club": "531", "Girona": "547",
  "Rayo Vallecano": "728", "Valencia": "532", "Mallorca": "798", "Sevilla": "536",
  "Alavés": "542", "Elche": "797", "Levante": "168", "Real Oviedo": "718",
  // Inglaterra - Premier
  "Arsenal": "42", "Manchester City": "50", "Manchester Utd": "33", "Aston Villa": "66",
  "Liverpool": "40", "Chelsea": "49", "Brentford": "55", "Bournemouth": "35",
  "Brighton": "51", "Everton": "45", "Sunderland": "60", "Fulham": "36",
  "Crystal Palace": "52", "Newcastle": "34", "Leeds": "63", "Nottingham": "65",
  "West Ham": "48", "Tottenham": "47", "Burnley": "44", "Wolverhampton": "39",
  // Alemania - Bundesliga
  "Bayern": "157", "Dortmund": "165", "RB Leipzig": "173", "Stuttgart": "172",
  "Hoffenheim": "167", "Bayer Leverkusen": "168", "Eintracht Frankfurt": "169", "Friburgo": "160",
  "Augsburgo": "170", "Mainz": "164", "Unión Berlín": "182", "Colonia": "163",
  "Hamburgo": "180", "Werder Bremen": "162", "B. Mönchengladbach": "163", "St. Pauli": "186",
  "Wolfsburgo": "161", "Heidenheim": "180",
  // Italia - Serie A
  "Inter": "505", "Nápoles": "492", "AC Milan": "489", "Juventus": "496",
  "Como": "981", "AS Roma": "497", "Atalanta": "499", "Bolonia": "500",
  "Lazio": "487", "Sassuolo": "490", "Udinese": "494", "Torino": "503",
  "Parma": "109", "Génova": "495", "Fiorentina": "502", "Cagliari": "488",
  "Cremonese": "517", "Lecce": "507", "Verona": "504", "Pisa": "519",
  // Francia - Ligue 1
  "PSG": "85", "Lens": "116", "Lille": "79", "Marsella": "81",
  "Lyon": "80", "Rennes": "111", "Mónaco": "91", "Estrasburgo": "95",
  "Lorient": "101", "Toulouse": "96", "Brest": "130", "Paris FC": "109",
  "Angers": "84", "Le Havre": "113", "Niza": "108", "Auxerre": "778",
  "Nantes": "83",  "Metz": "114",
  // Países Bajos - Eredivisie
  "Ajax": "194", "PSV": "197", "Feyenoord": "196", "AZ Alkmaar": "201",
  "Twente": "198", "Utrecht": "199", "Sparta Rotterdam": "205"
};

const BASE_URL = "https://www.flashscore.es/futbol";

async function scrapeStandings() {
  console.log("\n========================================");
  console.log("🚀 INICIANDO ACTUALIZACIÓN DE CLASIFICACIONES");
  console.log("========================================\n");
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  });

  const csvRows = [];
  // Cabecera con comillas para que n8n no se confunda
  csvRows.push('"Liga","Pos","Equipo","PJ","PG","PE","PP","Goles","Pts","Forma","Logo Liga","Logo Equipo"');

  for (const league of LEAGUES) {
    process.stdout.write(`📡 Procesando ${league.name}... `);
    const page = await context.newPage();
    
    try {
      await page.goto(`${BASE_URL}/${league.slug}/clasificacion/`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForSelector('.ui-table__row', { timeout: 10000 });

      const standings = await page.evaluate((leagueName) => {
        const rows = Array.from(document.querySelectorAll('.ui-table__row'));
        return rows.map(row => {
          const cells = Array.from(row.querySelectorAll('.table__cell'));
          
          // Extraer racha (Forma)
          const formCell = cells[9];
          const racha = formCell ? Array.from(formCell.querySelectorAll('div'))
            .map(el => el.innerText.trim())
            .filter(t => t && t.length === 1) // Solo letras G, E, P individuales
            .join('') : "";
          
          return {
            rank: row.querySelector('.tableCellRank')?.innerText.replace('.', '').trim(),
            team: row.querySelector('.tableCellParticipant__name')?.innerText.trim(),
            pj: cells[2]?.innerText.trim() || "0",
            pg: cells[3]?.innerText.trim() || "0",
            pe: cells[4]?.innerText.trim() || "0",
            pp: cells[5]?.innerText.trim() || "0",
            goles: cells[6]?.innerText.trim() || "0:0",
            pts: cells[8]?.innerText.trim() || "0",
            forma: racha,
            logo: row.querySelector('img')?.src || ""
          };
        });
      });

      // Mapeo de logos de liga (api-sports style como en tu imagen)
      const leagueLogos = {
        "La Liga": "https://media.api-sports.io/football/leagues/140.png",
        "Premier League": "https://media.api-sports.io/football/leagues/39.png",
        "Bundesliga": "https://media.api-sports.io/football/leagues/78.png",
        "Serie A": "https://media.api-sports.io/football/leagues/135.png",
        "Ligue 1": "https://media.api-sports.io/football/leagues/61.png",
        "Eredivisie": "https://media.api-sports.io/football/leagues/88.png"
      };
      const leagueLogo = leagueLogos[league.name] || "";

      for (const row of standings) {
        // Envolvemos TODO en comillas para que n8n no se confunda jamás
        const csvRow = [
          `"${league.name}"`,
          `"${row.rank || ""}"`,
          `"${row.team || ""}"`,
          `"${row.pj || "0"}"`,
          `"${row.pg || "0"}"`,
          `"${row.pe || "0"}"`,
          `"${row.pp || "0"}"`,
          `"${row.goles || "0:0"}"`,
          `"${row.pts || "0"}"`,
          `"${row.forma || ""}"`,
          `"${leagueLogo || ""}"`,
          `"${row.logo || ""}"`
        ];
        csvRows.push(csvRow.join(','));
      }
      
      console.log(`✅ (${standings.length} equipos)`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  const fullCsv = csvRows.join('\n');

  // Guardar archivo local
  const outputPath = path.join(__dirname, '../flashscore_standings.csv');
  fs.writeFileSync(outputPath, fullCsv, 'utf8');
  console.log(`\n📂 Archivo local actualizado en: ${outputPath}`);

  // ENVIAR A N8N
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error("N8N_WEBHOOK_URL no está definida en .env.local");
    }

    console.log(`📤 Enviando archivo a n8n (${webhookUrl})...`);
    
    // Usamos FormData nativo de Node 24
    const formData = new FormData();
    const blob = new Blob([fullCsv], { type: 'text/csv' });
    formData.append('data', blob, 'standings.csv');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      console.log(`✅ Respuesta de n8n: ${response.status}`);
      console.log("✨ ¡Sincronización enviada y recibida como archivo!");
    } else {
      console.log(`❌ Error en n8n: ${response.status} ${await response.text()}`);
    }
  } catch (error) {
    console.log(`⚠️ No se pudo enviar a n8n: ${error.message}`);
  }

  console.log("\n========================================");
  console.log(`🎉 ¡PROCESO COMPLETADO!`);
  console.log("========================================\n");

  await browser.close();
}

scrapeStandings();
