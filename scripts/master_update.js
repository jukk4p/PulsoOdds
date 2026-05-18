const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 INICIANDO AUTOMATIZACIÓN TOTAL...');

// Resolviendo las rutas absolutas de los scripts para que funcione sin importar desde qué directorio se llame
const scrapeScript = path.join(__dirname, 'scrape-flashscore.js');
const syncScript = path.join(__dirname, 'sync_supabase.js');

try {
  console.log('📡 1/2 Lanzando Scraper de Flashscore...');
  execSync(`node "${scrapeScript}"`, { stdio: 'inherit' });
  
  console.log('\n✅ Scraper completado. Esperando 10 segundos para que n8n procese el Google Sheets...');
  
  // Pequeña pausa para asegurar que n8n termine de escribir en el Sheet
  execSync('node -e "setTimeout(() => {}, 10000)"'); 
  
  console.log('\n🔄 2/2 Sincronizando con Supabase...');
  execSync(`node "${syncScript}"`, { stdio: 'inherit' });
  
  console.log('\n✨ ¡PROCESO FINALIZADO CON ÉXITO! Todo actualizado.');
} catch (error) {
  console.error('\n❌ ERROR EN LA AUTOMATIZACIÓN:', error.message);
  process.exit(1);
}
