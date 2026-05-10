const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const LEAGUES = [
  { name: "LaLiga EA Sports", slug: "espana/laliga-ea-sports" },
  { name: "Premier League", slug: "inglaterra/premier-league" },
  { name: "Bundesliga", slug: "alemania/bundesliga" },
  { name: "Serie A", slug: "italia/serie-a" },
  { name: "Ligue 1", slug: "francia/ligue-1" },
  { name: "Eredivisie", slug: "paises-bajos/eredivisie" },
  { name: "LaLiga Hypermotion", slug: "espana/laliga-hypermotion" },
  { name: "Championship", slug: "inglaterra/championship" },
  { name: "2. Bundesliga", slug: "alemania/2-bundesliga" },
  { name: "Serie B", slug: "italia/serie-b" },
  { name: "Ligue 2", slug: "francia/ligue-2" },
  { name: "Serie A Betano / Brasil", slug: "brasil/serie-a-betano" },
  { name: "MLS", slug: "usa/mls" },
  { name: "Liga Portugal", slug: "portugal/liga-portugal" },
  { name: "Eurocopa", slug: "europa/eurocopa" },
  { name: "Mundial", slug: "mundial/copa-del-mundo" }
];

async function scrapeUpcomingMatches() {
  console.log("🚀 Iniciando extracción de próximos partidos...");
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const results = {};

  for (const league of LEAGUES) {
    console.log(`🔍 Buscando partidos para: ${league.name}`);
    const url = `https://www.flashscore.es/futbol/${league.slug}/partidos/`;
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Esperar a que carguen los partidos
      await page.waitForSelector('.event__match', { timeout: 10000 });

      const matches = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.event__header, .event__match'));
        let currentMonth = ""; // Flashscore no siempre pone el año, pero pone el día/mes
        let matchesList = [];
        
        let currentDateHeader = "";

        for (const item of items) {
          if (item.classList.contains('event__header')) {
            // No siempre es una fecha, a veces es el nombre del torneo
            continue; 
          }

          if (item.classList.contains('event__match')) {
            const time = item.querySelector('.event__time')?.innerText || "";
            const home = item.querySelector('.event__homeParticipant [data-testid="wcl-scores-simple-text-01"]')?.innerText || item.querySelector('.event__participant--home')?.innerText || "";
            const away = item.querySelector('.event__awayParticipant [data-testid="wcl-scores-simple-text-01"]')?.innerText || item.querySelector('.event__participant--away')?.innerText || "";
            const id = item.id.split('_').pop();
            
            // Intentar buscar el header de fecha previo
            let prev = item.previousElementSibling;
            while (prev && !prev.classList.contains('event__header')) {
                prev = prev.previousElementSibling;
            }
            const date = prev ? prev.innerText.split('\n')[0] : "";

            matchesList.push({ id, date, time, home, away });
          }
          
          if (matchesList.length >= 15) break;
        }
        return matchesList;
      });

      results[league.name] = matches;
      console.log(`✅ ${league.name}: ${matches.length} partidos encontrados.`);
    } catch (err) {
      console.error(`❌ Error en ${league.name}: ${err.message}`);
    }
  }

  await browser.close();

  const outputPath = path.join(__dirname, '../public/upcoming_matches_detailed.json');
  
  // 🔄 MERGE LOGIC
  let finalResults = results;
  
  try {
    if (fs.existsSync(outputPath)) {
      const existingData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      
      for (const leagueName in results) {
        const newMatches = results[leagueName];
        const oldMatches = existingData[leagueName] || [];
        
        // Merge and remove duplicates by ID
        const combined = [...newMatches];
        const newIds = new Set(newMatches.map(m => m.id));
        
        // Add old matches that are not in the new list
        for (const oldMatch of oldMatches) {
          if (!newIds.has(oldMatch.id)) {
            // Optional: Filter out matches that are TOO old (e.g. more than 3 days)
            // For now, we keep them to satisfy the user request of not losing recent/current matches
            combined.push(oldMatch);
          }
        }
        
        // Sort by date/time (simple string sort works reasonably well for DD.MM. HH:MM)
        combined.sort((a, b) => {
          const dateA = a.time.split('.').reverse().join('.');
          const dateB = b.time.split('.').reverse().join('.');
          return dateA.localeCompare(dateB);
        });

        finalResults[leagueName] = combined;
      }
    }
  } catch (err) {
    console.error("⚠️ Error merging data, overwriting instead:", err.message);
  }

  fs.writeFileSync(outputPath, JSON.stringify(finalResults, null, 2), 'utf8');
  console.log(`\n🎉 Proceso completado. Datos (mezclados) guardados en: ${outputPath}`);
}

scrapeUpcomingMatches();
