const ExcelJS = require('exceljs');
const path = require('path');

async function consolidateExcel() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('ligas_automatico_v5.xlsx');

    const leagues = [
        'La Liga', 'Premier League', 'Bundesliga', 'Serie A', 'Ligue 1',
        'Segunda División', 'Championship', '2. Bundesliga', 'Serie B', 'Ligue 2'
    ];

    // Buscamos si ya existe la hoja, si no la creamos
    let consolidatedSheet = workbook.getWorksheet('n8n_Consolidado');
    if (consolidatedSheet) {
        workbook.removeWorksheet('n8n_Consolidado');
    }
    consolidatedSheet = workbook.addWorksheet('n8n_Consolidado');

    // Definir columnas
    consolidatedSheet.columns = [
        { header: 'Liga', key: 'liga', width: 20 },
        { header: 'Pos', key: 'pos', width: 5 },
        { header: 'Equipo', key: 'equipo', width: 25 },
        { header: 'SIGLA', key: 'sigla', width: 8 },
        { header: 'PJ', key: 'pj', width: 5 },
        { header: 'PG', key: 'pg', width: 5 },
        { header: 'PE', key: 'pe', width: 5 },
        { header: 'PP', key: 'pp', width: 5 },
        { header: 'Pts', key: 'pts', width: 5 }
    ];

    console.log('--- Iniciando consolidación de ligas ---');

    leagues.forEach(leagueName => {
        const sheet = workbook.getWorksheet(leagueName);
        if (!sheet) {
            console.log(`⚠️ Hoja ${leagueName} no encontrada.`);
            return;
        }

        // Iteramos las filas saltando encabezados (empezamos en la 4 que es donde suele estar el primer equipo)
        sheet.eachRow((row, rowNumber) => {
            // Buscamos filas que tengan un número en la primera columna (la posición)
            const posValue = row.getCell(1).value;
            if (typeof posValue === 'number') {
                consolidatedSheet.addRow({
                    liga: leagueName,
                    pos: posValue,
                    equipo: row.getCell(2).value,
                    sigla: row.getCell(3).value,
                    pj: row.getCell(4).value,
                    pg: row.getCell(5).value,
                    pe: row.getCell(6).value,
                    pp: row.getCell(7).value,
                    pts: row.getCell(8).value
                });
            }
        });
        console.log(`✅ ${leagueName} consolidada.`);
    });

    await workbook.xlsx.writeFile('ligas_automatico_v5.xlsx');
    console.log('--- ¡Excel actualizado con éxito! ---');
    console.log('Ahora n8n puede leer la pestaña "n8n_Consolidado" y conocer a todos los equipos.');
}

consolidateExcel().catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
});
