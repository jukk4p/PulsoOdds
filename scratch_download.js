const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const https = require('https');

const filePath = path.join('c:', 'Users', 'jukkaP', 'Desktop', 'skill', 'PulsoOdds', 'ligas_v6_logos.xlsx');
const workbook = XLSX.readFile(filePath);

const targetSheets = [
  'La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1',
  'Segunda División', 'Championship', '2. Bundesliga', 'Serie B', 'Ligue 2'
];

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve(); // Skip if exists
    
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  const teamsMap = new Set();
  const leaguesMap = new Set();

  targetSheets.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;
    const rows = XLSX.utils.sheet_to_json(sheet, {header: 1});
    
    rows.forEach(row => {
      if (typeof row[0] === 'number') {
        const teamUrl = row[8]; // Logo Equipo
        const leagueUrl = row[9]; // Logo Liga
        
        if (teamUrl && teamUrl.startsWith('http')) teamsMap.add(teamUrl);
        if (leagueUrl && leagueUrl.startsWith('http')) leaguesMap.add(leagueUrl);
      }
    });
  });

  console.log(`Found ${teamsMap.size} teams and ${leaguesMap.size} leagues.`);

  console.log("Downloading teams...");
  for (const url of teamsMap) {
    const filename = url.split('/').pop();
    const dest = path.join('c:', 'Users', 'jukkaP', 'Desktop', 'skill', 'PulsoOdds', 'public', 'logos', 'teams', filename);
    try {
      await download(url, dest);
      console.log(`Downloaded: ${filename}`);
    } catch (e) {
      console.error(`Error downloading ${url}: ${e.message}`);
    }
  }

  console.log("Downloading leagues...");
  for (const url of leaguesMap) {
    const filename = url.split('/').pop();
    const dest = path.join('c:', 'Users', 'jukkaP', 'Desktop', 'skill', 'PulsoOdds', 'public', 'logos', 'leagues', filename);
    try {
      await download(url, dest);
      console.log(`Downloaded: ${filename}`);
    } catch (e) {
      console.error(`Error downloading ${url}: ${e.message}`);
    }
  }

  console.log("All downloads finished.");
}

run();
