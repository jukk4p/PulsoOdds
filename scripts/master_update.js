const { execSync } = require('child_process');

console.log('🚀 INICIANDO AUTOMATIZACIÓN TOTAL...');

try {
  console.log('📡 1/2 Lanzando Scraper de Flashscore...');
  execSync('node scripts/scrape-flashscore.js', { stdio: 'inherit' });
  
  console.log('\n✅ Scraper completado. Esperando 10 segundos para que n8n procese el Google Sheets...');
  
  // Pequeña pausa para asegurar que n8n termine de escribir en el Sheet
  execSync('node -e "setTimeout(() => {}, 10000)"'); 
  
  console.log('\n🔄 2/2 Sincronizando con Supabase...');
  execSync('node scripts/sync_supabase.js', { stdio: 'inherit' });
  
  console.log('\n✨ ¡PROCESO FINALIZADO CON ÉXITO! Todo actualizado.');
} catch (error) {
  console.error('\n❌ ERROR EN LA AUTOMATIZACIÓN:', error.message);
  process.exit(1);
}
