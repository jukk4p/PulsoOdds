const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join('c:', 'Users', 'jukkaP', 'Desktop', 'skill', 'PulsoOdds', 'ligas_v6_logos.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['La Liga'];
const rows = XLSX.utils.sheet_to_json(sheet, {header: 1});

const clean = (s) => (s || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

rows.forEach(row => {
  if (row[1] && row[1].match(/Alav/i)) {
    console.log(`Original: "${row[1]}", Cleaned: "${clean(row[1])}"`);
  }
});
