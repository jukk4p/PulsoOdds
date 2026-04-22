const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

/**
 * CONFIGURACIÓN
 */
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const BASE_URL = "https://www.flashscore.es/futbol";

const LEAGUES = [
  { name: "LaLiga EA Sports", slug: "espana/laliga-ea-sports", id: "140" },
  { name: "Premier League", slug: "inglaterra/premier-league", id: "39" },
  { name: "Bundesliga", slug: "alemania/bundesliga", id: "78" },
  { name: "Serie A", slug: "italia/serie-a", id: "135" },
  { name: "Ligue 1", slug: "francia/ligue-1", id: "61" },
  { name: "Eredivisie", slug: "paises-bajos/eredivisie", id: "88" },
  { name: "LaLiga Hypermotion", slug: "espana/laliga-hypermotion", id: "141" },
  { name: "Championship", slug: "inglaterra/championship", id: "40" },
  { name: "2. Bundesliga", slug: "alemania/2-bundesliga", id: "79" },
  { name: "Serie B", slug: "italia/serie-b", id: "136" },
  { name: "Ligue 2", slug: "francia/ligue-2", id: "62" }
];

// Mapeo dinámico desde el diccionario maestro
const TEAM_MAP = {};
const LEAGUE_MAP = {};

function normalize(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function loadTeamDictionary() {
  try {
    const dictPath = path.join(__dirname, '../diccionario_maestro_equipos.md');
    if (!fs.existsSync(dictPath)) {
        console.warn("⚠️ Diccionario maestro no encontrado.");
        return;
    }

    const content = fs.readFileSync(dictPath, 'utf8');
    
    // 1. Extraer logos de ligas (están sobre los ###)
    const leagueRegex = /### (.*?)\n!\[Logo .*?\]\((.*?)\)/g;
    let match;
    while ((match = leagueRegex.exec(content)) !== null) {
        const name = match[1].trim();
        const logo = match[2].trim();
        // Mapeamos el nombre de la liga (limpio) al logo
        LEAGUE_MAP[normalize(name)] = logo;
        // También por si acaso el nombre exacto
        if (name === "LaLiga EA Sports") LEAGUE_MAP[normalize("La Liga")] = logo;
        if (name === "LaLiga Hypermotion") LEAGUE_MAP[normalize("Segunda División")] = logo;
    }

    // 2. Extraer mapeo de equipos
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('|') && !line.includes('---') && !line.includes('Origen Sheets')) {
        const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
        if (parts.length >= 4) {
          const sheetName = parts[0]; // Origen Sheets
          let apiFull = parts[1];      // Puente API (ID)
          const publicName = parts[2].replace(/\*\*/g, ''); // Nombre Público
          const logoPart = parts[3];   // Logo: ![Logo](url)
          
          const logoMatch = logoPart.match(/\((.*?)\)/);
          const logoUrl = logoMatch ? logoMatch[1] : "";

          const apiName = (apiFull && apiFull !== '-') 
            ? apiFull.replace(/\s*\(\d+\)\s*$/, '').trim()
            : sheetName;
            
          const data = { apiName, publicName, logo: logoUrl };
          
          TEAM_MAP[normalize(sheetName)] = data;
          TEAM_MAP[normalize(publicName)] = data;
        }
      }
    });
    console.log(`✅ Diccionario cargado: ${Object.keys(TEAM_MAP).length} equipos y ${Object.keys(LEAGUE_MAP).length} ligas.`);
  } catch (err) {
    console.error("❌ Error cargando diccionario:", err.message);
  }
}

function getTeamData(name) {
  const norm = normalize(name);
  if (TEAM_MAP[norm]) return TEAM_MAP[norm];
  
  for (const variant in TEAM_MAP) {
      if (variant.includes(norm) || norm.includes(variant)) {
          return TEAM_MAP[variant];
      }
  }
  return { apiName: name, publicName: name, logo: "" };
}

async function scrapeLeague(context, league) {
  const page = await context.newPage();
  const url = `${BASE_URL}/${league.slug}/clasificacion/`;
  
  console.log(`📡 Procesando: ${league.name}...`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    
    // Intentar esperar a la tabla con varios selectores posibles
    await Promise.race([
        page.waitForSelector('.ui-table__row', { timeout: 15000 }),
        page.waitForSelector('.table__row', { timeout: 15000 })
    ]);

    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.ui-table__row, .table__row'));
      return rows.map(row => {
        // Selectores modernos de Flashscore
        const rankEl = row.querySelector('.ui-table__cell--rank, .tableCellRank');
        const teamEl = row.querySelector('.ui-table__cell--team, .tableCellParticipant__name');
        
        const cells = Array.from(row.querySelectorAll('.ui-table__cell, .table__cell'));
        
        // Mapeo de celdas por posición típica
        // 0: rank, 1: team, 2: pj, 3: pg, 4: pe, 5: pp, 6: goles, 7: diff, 8: pts, 9: forma
        
        // Extraer racha (Forma)
        const formCell = row.querySelector('.ui-table__cell--form, .table__cell--form');
        let form = "";
        if (formCell) {
            const dots = formCell.querySelectorAll('.ui-table__cell--form-dot, a > div');
            dots.forEach(dot => {
                const text = dot.innerText.trim();
                if (text === 'W' || text === 'G') form += 'G';
                else if (text === 'D' || text === 'E') form += 'E';
                else if (text === 'L' || text === 'P') form += 'P';
            });
        }

        return {
          pos: rankEl?.innerText.replace('.', '').trim() || "0",
          team: teamEl?.innerText.trim() || "Unknown",
          pj: cells[2]?.innerText.trim() || "0",
          g: cells[3]?.innerText.trim() || "0",
          e: cells[4]?.innerText.trim() || "0",
          p: cells[5]?.innerText.trim() || "0",
          goals: cells[6]?.innerText.trim() || "0:0",
          pts: cells[8]?.innerText.trim() || "0",
          form: form
        };
      });
    });

    await page.close();
    
    return data.map(r => {
      const teamData = getTeamData(r.team);
      return {
        ...r,
        team: teamData.apiName,
        publicName: teamData.publicName,
        teamLogo: teamData.logo,
        league: league.name
      };
    });

  } catch (error) {
    console.error(`❌ Error en ${league.name}:`, error.message);
    await page.close();
    return [];
  }
}

function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function run() {
  console.log("\n========================================");
  console.log("🚀 INICIANDO ACTUALIZACIÓN DE CLASIFICACIONES");
  console.log("========================================\n");

  loadTeamDictionary();
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  let allData = [];

  for (const league of LEAGUES) {
    const data = await scrapeLeague(context, league);
    if (data.length > 0) {
        console.log(`✅ ${league.name}: ${data.length} equipos.`);
        allData = allData.concat(data);
    }
  }

  await browser.close();

  if (allData.length > 0) {
    // Generar CSV
    // A:Liga, B:Pos, C:Equipo, D:PJ, E:PG, F:PE, G:PP, H:Goles, I:Pts, J:Forma, K:Logo Liga, L:Logo Equipo, M:Nombre Público
    const header = '"Liga","Pos","Equipo","PJ","PG","PE","PP","Goles","Pts","Forma","Logo Liga","Logo Equipo","Nombre Público"\n';
    const csvRows = allData.map(r => {
      const leagueNorm = normalize(r.league);
      const leagueLogo = LEAGUE_MAP[leagueNorm] || "";
      
      // r.g, r.e, r.p son PG, PE, PP
      return `"${r.league}","${r.pos}","${r.team}","${r.pj}","${r.g}","${r.e}","${r.p}","${r.goals}","${r.pts}","${r.form}","${leagueLogo}","${r.teamLogo}","${r.publicName}"`;
    }).join('\n');

    const csvContent = header + csvRows;
    const filePath = path.join(__dirname, '../flashscore_standings.csv');
    fs.writeFileSync(filePath, csvContent, 'utf8');
    console.log(`\n📂 Archivo CSV actualizado en: ${filePath}`);

    // --- GENERAR JSON PARA LA WEB ---
    const webData = allData.map(r => {
        const leagueNorm = normalize(r.league);
        const leagueLogo = LEAGUE_MAP[leagueNorm] || "";
        return {
            liga: r.league,
            pos: parseInt(r.pos),
            equipo: r.publicName, // Nombre público para la web
            pj: parseInt(r.pj),
            pg: parseInt(r.g),
            pe: parseInt(r.e),
            pp: parseInt(r.p),
            goles: r.goals,
            pts: parseInt(r.pts),
            forma: r.form,
            logo_liga: leagueLogo,
            logo_equipo: r.teamLogo
        };
    });

    const jsonPath = path.join(__dirname, '../public/standings.json');
    fs.writeFileSync(jsonPath, JSON.stringify(webData, null, 2), 'utf8');
    console.log(`🌐 Archivo JSON para la WEB generado en: ${jsonPath}`);
    // --------------------------------

    // Enviar a n8n
    if (N8N_WEBHOOK_URL) {
      try {
        console.log(`📤 Enviando datos a n8n...`);
        const formData = new FormData();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        formData.append('data', blob, 'standings.csv');

        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          console.log(`🚀 Datos enviados correctamente a n8n. Status: ${response.status}`);
        } else {
          console.error(`❌ Error enviando a n8n: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error(`❌ Error de conexión con n8n:`, err.message);
      }
    }
  }
  
  console.log("\n========================================");
  console.log(`🎉 ¡PROCESO COMPLETADO!`);
  console.log("========================================\n");
}

run();
