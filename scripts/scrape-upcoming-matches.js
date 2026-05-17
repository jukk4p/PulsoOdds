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
  
  // Optimizaciones de Chromium para reducir uso de memoria y CPU
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--memory-pressure-off'
    ]
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  // Bloquear recursos pesados innecesarios para evitar que Next.js detecte umbral de memoria y se reinicie
  await context.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['image', 'font', 'media'].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  const results = {};

  for (const league of LEAGUES) {
    console.log(`🔍 Buscando partidos para: ${league.name}`);
    const url = `https://www.flashscore.es/futbol/${league.slug}/partidos/`;
    
    const page = await context.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      
      // Esperar a que carguen los partidos (si no hay, capturamos el error limpiamente sin fallar)
      const hasMatches = await page.waitForSelector('.event__match', { timeout: 15000 }).catch(() => null);
      if (!hasMatches) {
        console.log(`ℹ️ ${league.name}: No se encontraron próximos partidos (posible fin de temporada o sin calendario programado).`);
        results[league.name] = [];
        await page.close();
        continue;
      }

      const matches = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.event__header, .event__round, .event__match'));
        let matchesList = [];
        let firstRoundName = null;

        for (const item of items) {
          if (item.classList.contains('event__header')) {
            continue; 
          }

          if (item.classList.contains('event__round')) {
            const roundText = item.innerText.trim();
            if (!firstRoundName) {
              firstRoundName = roundText;
            } else if (firstRoundName && roundText !== firstRoundName) {
              // Si ya tenemos partidos de la primera jornada y encontramos otra jornada distinta (ej. Jornada 37),
              // PARAMOS para no mezclar partidos de distintas jornadas.
              if (matchesList.length > 0) {
                break;
              }
            }
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

            matchesList.push({ id, date, time, home, away, round: firstRoundName || "" });
          }
          
          if (matchesList.length >= 15) break;
        }
        return matchesList;
      });

      console.log(`⚡ Extrayendo detalles (Pronóstico, Bajas, H2H, TV) para ${matches.length} partidos de ${league.name}...`);
      
      // Procesar en lotes concurrentes de 4 para no saturar memoria ni CPU
      const BATCH_SIZE = 4;
      for (let i = 0; i < matches.length; i += BATCH_SIZE) {
        const batch = matches.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (match) => {
          const detailUrl = `https://www.flashscore.es/partido/${match.id}/#/resumen-del-partido/resumen-del-partido`;
          const detailPage = await context.newPage();
          try {
            await detailPage.goto(detailUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            // Esperar a que los widgets JS se rendericen en el DOM
            await detailPage.waitForTimeout(1000);
            await detailPage.evaluate(async () => {
              for (let s = 0; s < 5; s++) {
                window.scrollBy(0, 700);
                await new Promise(r => setTimeout(r, 400));
              }
            });

            const detailData = await detailPage.evaluate(() => {
              const data = {
                forecast: {
                  expectedGoals: { home: "", away: "" },
                  probableResults: "",
                  teamInsights: []
                },
                injuries: [],
                doubtful: [],
                tvChannels: [],
                recentForm: { home: [], away: [] },
                h2h: []
              };

              const findSectionContainer = (titleText, keyword) => {
                const allElms = Array.from(document.querySelectorAll('div, span, h1, h2, h3'));
                for (const el of allElms) {
                  const txt = el.innerText?.trim().toUpperCase() || "";
                  const firstLine = txt.split('\n')[0].trim();
                  if (firstLine === titleText.toUpperCase() || txt.startsWith(titleText.toUpperCase())) {
                    let curr = el;
                    while (curr && curr !== document.body) {
                      const pTxt = curr.innerText || "";
                      if (keyword && pTxt.toLowerCase().includes(keyword.toLowerCase())) {
                        return curr;
                      }
                      if (!keyword && pTxt.length > titleText.length + 25 && pTxt.length < 3000) {
                        return curr;
                      }
                      curr = curr.parentElement;
                    }
                  }
                }
                return null;
              };

              // 1. PRONÓSTICO DEL PARTIDO
              const forecastSection = findSectionContainer("PRONÓSTICO DEL PARTIDO", "goles previstos") || findSectionContainer("PRONÓSTICO DEL PARTIDO");
              if (forecastSection) {
                const lines = forecastSection.innerText.split('\n').map(l => l.trim()).filter(Boolean);
                const egIdx = lines.findIndex(l => l.toLowerCase().includes("goles previstos"));
                if (egIdx > 0 && egIdx < lines.length - 1) {
                  data.forecast.expectedGoals = { home: lines[egIdx - 1], away: lines[egIdx + 1] };
                } else {
                  const egNums = lines.filter(l => /^\d+([\.,]\d+)?$/.test(l));
                  if (egNums.length >= 2) {
                    data.forecast.expectedGoals = { home: egNums[0], away: egNums[egNums.length - 1] };
                  }
                }

                const prLine = lines.find(l => l.toLowerCase().includes("resultados más probables") || l.toLowerCase().includes("probables"));
                if (prLine) {
                  data.forecast.probableResults = prLine
                    .replace(/.*resultados más probables.*son:?\s*/i, '')
                    .replace(/.*resultados más probables:?\s*/i, '')
                    .replace(/.*resultados probables.*son:?\s*/i, '')
                    .replace(/.*resultados probables:?\s*/i, '')
                    .replace(/.*probables:?\s*/i, '')
                    .trim();
                }

                const insights = lines.filter(l => {
                  const low = l.toLowerCase();
                  return l.length > 20 && 
                         !/^\d+([\.,]\d+)?$/.test(l) &&
                         !low.includes("pronóstico del partido") && 
                         !low.includes("generado por ia") && 
                         !low.includes("goles previstos") && 
                         !low.includes("probables");
                });
                data.forecast.teamInsights = [...new Set(insights)];
              }

              const posiblesHeader = Array.from(document.querySelectorAll('div, span, h1, h2, h3')).find(e => e.innerText?.trim().toUpperCase() === "POSIBLES BAJAS");

              // 2. BAJAS
              const bajasSection = findSectionContainer("BAJAS");
              if (bajasSection) {
                const playerRows = Array.from(bajasSection.querySelectorAll('div')).filter(el => {
                  if (posiblesHeader && (posiblesHeader.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) {
                    return false;
                  }
                  const txt = el.innerText?.trim() || "";
                  const lines = txt.split('\n').map(l => l.trim()).filter(Boolean);
                  const low = txt.toLowerCase();
                  return lines.length >= 2 && lines.length <= 6 &&
                         (low.includes('lesión') || low.includes('enfermedad') || low.includes('sanción') || low.includes('inactivo') || low.includes('motivos'));
                });

                for (const row of playerRows) {
                  const lines = row.innerText.split('\n').map(l => l.trim()).filter(Boolean);
                  if (lines.length >= 2) {
                    let player = lines[0];
                    let reason = lines[1];
                    if (player.length <= 3 && lines.length >= 3) {
                      player = lines[1];
                      reason = lines[2];
                    }
                    const reasonLow = reason.toLowerCase();
                    if (reasonLow.includes('lesión') || reasonLow.includes('enfermedad') || reasonLow.includes('sanción') || reasonLow.includes('inactivo') || reasonLow.includes('motivos')) {
                      if (!data.injuries.some(i => i.player === player)) {
                        data.injuries.push({ player, reason });
                      }
                    }
                  }
                }
              }

              // 3. POSIBLES BAJAS
              const posiblesSection = findSectionContainer("POSIBLES BAJAS");
              if (posiblesSection) {
                const playerRows = Array.from(posiblesSection.querySelectorAll('div')).filter(el => {
                  if (posiblesHeader && (posiblesHeader.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)) {
                    return false;
                  }
                  const txt = el.innerText?.trim() || "";
                  const lines = txt.split('\n').map(l => l.trim()).filter(Boolean);
                  const low = txt.toLowerCase();
                  return lines.length >= 2 && lines.length <= 6 &&
                         (low.includes('duda') || low.includes('lesión') || low.includes('enfermedad') || low.includes('inactivo'));
                });

                for (const row of playerRows) {
                  const lines = row.innerText.split('\n').map(l => l.trim()).filter(Boolean);
                  if (lines.length >= 2) {
                    let player = lines[0];
                    let reason = lines[1];
                    if (player.length <= 3 && lines.length >= 3) {
                      player = lines[1];
                      reason = lines[2];
                    }
                    const reasonLow = reason.toLowerCase();
                    if (reasonLow.includes('duda') || reasonLow.includes('lesión') || reasonLow.includes('enfermedad') || reasonLow.includes('inactivo')) {
                      if (!data.doubtful.some(d => d.player === player)) {
                        data.doubtful.push({ player, reason });
                      }
                    }
                  }
                }
              }

              // 4. CANAL TV
              const tvSection = findSectionContainer("CANAL TV");
              if (tvSection) {
                const links = Array.from(tvSection.querySelectorAll('a, span, div')).map(e => e.innerText?.trim()).filter(Boolean);
                const channels = links.filter(t => t.toUpperCase() !== "CANAL TV" && t.toUpperCase() !== "ANUNCIO" && t.length < 20 && !t.includes('\n'));
                data.tvChannels = [...new Set(channels)];
              }
              return data;
            });

            Object.assign(match, detailData);

            // AHORA NAVEGAMOS A LA PESTAÑA H2H PARA EXTRAER RECENT FORM Y ENFRENTAMIENTOS COMPLETOS
            try {
              const h2hUrl = `https://www.flashscore.es/partido/${match.id}/#/h2h/general`;
              await detailPage.goto(h2hUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
              await detailPage.waitForTimeout(1000);
              await detailPage.evaluate(async () => {
                for (let s = 0; s < 5; s++) {
                  window.scrollBy(0, 700);
                  await new Promise(r => setTimeout(r, 400));
                }
              });

              const h2hData = await detailPage.evaluate(() => {
                const res = { recentForm: { home: [], away: [] }, h2h: [] };
                const allHeaders = Array.from(document.querySelectorAll('div, span')).filter(e => {
                  const txt = e.innerText?.trim().toUpperCase() || "";
                  return txt.startsWith("ÚLTIMOS PARTIDOS") || txt.startsWith("ENFRENTAMIENTOS");
                });

                for (const header of allHeaders) {
                  const title = header.innerText.trim().toUpperCase();
                  let parent = header.parentElement;
                  while (parent && parent.parentElement && !parent.querySelector('.h2h__row, [class*="row"], [class*="match"]')) {
                    parent = parent.parentElement;
                  }
                  if (!parent) continue;

                  const rows = Array.from(parent.querySelectorAll('.h2h__row, div')).filter(el => {
                    const txt = el.innerText?.trim() || "";
                    return /\d{2}\.\d{2}\.\d{2}/.test(txt) && txt.includes('\n');
                  });

                  const parsedRows = rows.map(r => {
                    const lines = r.innerText.split('\n').map(l => l.trim()).filter(Boolean);
                    const date = lines.find(l => /\d{2}\.\d{2}\.\d{2}/.test(l)) || "";
                    const resultBadge = lines.find(l => ["P", "E", "G"].includes(l)) || "";
                    const textParts = lines.filter(l => !/\d{2}\.\d{2}\.\d{2}/.test(l) && !["P", "E", "G"].includes(l) && l.length > 2);
                    const numParts = lines.filter(l => /^\d+$/.test(l));
                    
                    let matchStr = textParts.join(' ');
                    if (textParts.length >= 2 && numParts.length >= 2) {
                      matchStr = `${textParts[0]} ${numParts[0]} - ${numParts[1]} ${textParts[1]}`;
                    }

                    return { date, match: matchStr, result: resultBadge };
                  }).filter(r => r.date && r.match && !r.match.toLowerCase().includes("mostrar más"));

                  if (title.startsWith("ÚLTIMOS PARTIDOS")) {
                    if (res.recentForm.home.length === 0) {
                      res.recentForm.home = parsedRows.slice(0, 5);
                    } else if (res.recentForm.away.length === 0) {
                      res.recentForm.away = parsedRows.slice(0, 5);
                    }
                  } else if (title.startsWith("ENFRENTAMIENTOS")) {
                    res.h2h = parsedRows.slice(0, 5);
                  }
                }
                return res;
              });

              if (h2hData.recentForm.home.length > 0) match.recentForm.home = h2hData.recentForm.home;
              if (h2hData.recentForm.away.length > 0) match.recentForm.away = h2hData.recentForm.away;
              if (h2hData.h2h.length > 0) match.h2h = h2hData.h2h;
            } catch (h2hErr) {
              // Silencioso ante errores en H2H
            }

            // NAVEGAMOS A LA PESTAÑA DE CUOTAS PARA EXTRAER LAS CUOTAS 1X2
            try {
              const cuotasUrl = `https://www.flashscore.es/partido/${match.id}/#/cuotas-de-las-apuestas/1x2-tiempo-reglamentario`;
              await detailPage.goto(cuotasUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
              await detailPage.waitForTimeout(2000);

              // 1. ACEPTAR VERIFICACIÓN DE EDAD DE FLASHSCORE ("SOY MAYOR DE 18 AÑOS")
              await detailPage.evaluate(() => {
                const elms = Array.from(document.querySelectorAll('*')).filter(e => e.innerText?.trim().toUpperCase().includes('MAYOR DE 18') && e.children.length === 0);
                if (elms.length > 0) elms[0].click();
              }).catch(() => {});

              await detailPage.waitForTimeout(2000);

              // 2. Hacer clic en la pestaña de Cuotas por si el router de la SPA lo requiere
              await detailPage.evaluate(() => {
                const cuotasTab = Array.from(document.querySelectorAll('a, button, div')).find(e => e.innerText?.trim().toUpperCase() === "CUOTAS" && e.children.length === 0);
                if (cuotasTab) cuotasTab.click();
              }).catch(() => {});

              await detailPage.waitForTimeout(3500); // Dar tiempo a que la API de cuotas responda

              // 3. EXTRAER 1X2 DE BET365
              const odds1x2 = await detailPage.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('.ui-table__row, tr, [class*="oddCell"], [class*="row"]'));
                for (const row of rows) {
                  const text = row.innerText?.trim().toLowerCase() || "";
                  const titleEl = row.querySelector('[title]');
                  const title = titleEl ? titleEl.getAttribute('title')?.toLowerCase() : "";
                  if (text.includes('bet365') || title?.includes('bet365')) {
                    const oddElms = Array.from(row.querySelectorAll('.oddsCell__odd'))
                      .map(e => e.innerText?.split('\n')[0]?.trim())
                      .filter(t => t && /^\d+[\.,]\d+$/.test(t));
                    if (oddElms.length >= 3) {
                      return { bookmaker: 'Bet365 (1X2)', type: '1x2', home: oddElms[0], draw: oddElms[1], away: oddElms[2] };
                    }
                  }
                }
                return null;
              });

              // 4. CLIC EN SUBPESTAÑA "MÁS DE/MENOS DE"
              await detailPage.evaluate(() => {
                const subtabs = Array.from(document.querySelectorAll('a, button, div, span')).filter(e => e.innerText?.trim().toUpperCase().includes('MÁS DE/MENOS DE') && e.children.length === 0);
                if (subtabs.length > 0) subtabs[0].click();
              }).catch(() => {});
              await detailPage.waitForTimeout(3000);

              // EXTRAER MÁS/MENOS DE BET365 (Buscando específicamente la línea dorada 2.5, o la más cercana)
              const oddsOverUnder = await detailPage.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('.ui-table__row, tr, [class*="oddCell"], [class*="row"]'));
                let bestRow = null;
                let fallbackRow = null;

                for (const row of rows) {
                  const text = row.innerText?.trim().toLowerCase() || "";
                  const titleEl = row.querySelector('[title]');
                  const title = titleEl ? titleEl.getAttribute('title')?.toLowerCase() : "";
                  if (text.includes('bet365') || title?.includes('bet365')) {
                    const oddElms = Array.from(row.querySelectorAll('.oddsCell__odd'))
                      .map(e => e.innerText?.split('\n')[0]?.trim())
                      .filter(t => t && /^\d+[\.,]\d+$/.test(t));
                    
                    let total = "2.5";
                    const totalEl = row.querySelector('[class*="oddsValue"], [class*="oddsInfo"]');
                    if (totalEl && totalEl.innerText?.includes('.5')) {
                      total = totalEl.innerText.trim();
                    } else {
                      const allTexts = Array.from(row.querySelectorAll('span, div')).map(e => e.innerText?.trim()).filter(Boolean);
                      const tMatch = allTexts.find(t => t.includes('.5') && parseFloat(t) < 10);
                      if (tMatch) total = tMatch;
                    }

                    if (oddElms.length >= 2) {
                      const item = { bookmaker: `Bet365 (Más/Menos ${total})`, type: 'over_under', total: total, over: oddElms[0], under: oddElms[1] };
                      if (total === "2.5") {
                        bestRow = item;
                        break; // Encontramos la línea dorada 2.5
                      }
                      if (!fallbackRow || total === "1.5" || total === "3.5") {
                        fallbackRow = item; // Guardamos 1.5 o 3.5 como respaldo
                      }
                    }
                  }
                }
                return bestRow || fallbackRow;
              });

              // 5. CLIC EN SUBPESTAÑA "AMBOS EQUIPOS MARCARÁN"
              await detailPage.evaluate(() => {
                const subtabs = Array.from(document.querySelectorAll('a, button, div, span')).filter(e => e.innerText?.trim().toUpperCase().includes('AMBOS EQUIPOS MARCARÁN') && e.children.length === 0);
                if (subtabs.length > 0) subtabs[0].click();
              }).catch(() => {});
              await detailPage.waitForTimeout(3000);

              // EXTRAER AMBOS MARCAN DE BET365
              const oddsBtts = await detailPage.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('.ui-table__row, tr, [class*="oddCell"], [class*="row"]'));
                for (const row of rows) {
                  const text = row.innerText?.trim().toLowerCase() || "";
                  const titleEl = row.querySelector('[title]');
                  const title = titleEl ? titleEl.getAttribute('title')?.toLowerCase() : "";
                  if (text.includes('bet365') || title?.includes('bet365')) {
                    const oddElms = Array.from(row.querySelectorAll('.oddsCell__odd'))
                      .map(e => e.innerText?.split('\n')[0]?.trim())
                      .filter(t => t && /^\d+[\.,]\d+$/.test(t));
                    if (oddElms.length >= 2) {
                      return { bookmaker: 'Bet365 (Ambos Marcan)', type: 'btts', yes: oddElms[0], no: oddElms[1] };
                    }
                  }
                }
                return null;
              });

              const combinedOdds = [odds1x2, oddsOverUnder, oddsBtts].filter(Boolean);

              if (combinedOdds.length > 0) {
                match.odds = combinedOdds;
              }
            } catch (cuotasErr) {
              // Silencioso ante errores en cuotas
            }

          } catch (detErr) {
            // Silencioso ante errores o timeouts en partidos sin detalles
          } finally {
            await detailPage.close();
          }
        }));
      }

      results[league.name] = matches;
      console.log(`✅ ${league.name}: ${matches.length} partidos encontrados y detallados.`);
    } catch (err) {
      console.error(`❌ Error en ${league.name}: ${err.message}`);
    } finally {
      // Cerrar la página para liberar memoria inmediatamente tras cada liga
      await page.close();
    }
  }

  await browser.close();

  const outputPath = path.join(__dirname, '../public/upcoming_matches_detailed.json');
  
  // 🔄 MERGE / OVERWRITE LOGIC
  let finalResults = {};
  
  try {
    let existingData = {};
    if (fs.existsSync(outputPath)) {
      existingData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    }
    
    // Todas las ligas conocidas en el archivo anterior o actual
    const allLeagues = new Set([...Object.keys(existingData), ...Object.keys(results)]);
    
    for (const leagueName of allLeagues) {
      const newMatches = results[leagueName];
      if (!newMatches || newMatches.length === 0) {
        // Si el scrapeador no obtuvo partidos nuevos para esta liga, mantenemos lo anterior
        finalResults[leagueName] = existingData[leagueName] || [];
      } else {
        // Si obtuvo partidos nuevos (ej. los 10 de la próxima jornada), SOBREESCRIBIMOS
        // para no acumular partidos antiguos ni mezclar con jornadas siguientes.
        finalResults[leagueName] = newMatches;
      }
    }
  } catch (err) {
    console.error("⚠️ Error en merge/overwrite, usando resultados actuales:", err.message);
    finalResults = results;
  }

  const tmpOutputPath = path.join(__dirname, '../public/upcoming_matches_detailed.tmp.json');
  fs.writeFileSync(tmpOutputPath, JSON.stringify(finalResults, null, 2), 'utf8');
  fs.renameSync(tmpOutputPath, outputPath);
  console.log(`\n🎉 Proceso completado. Datos guardados atómicamente en: ${outputPath}`);
}

scrapeUpcomingMatches();
