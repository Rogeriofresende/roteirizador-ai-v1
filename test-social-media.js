// Teste manual do serviço de redes sociais
import { socialMediaService } from './src/services/socialMediaAPI.js';

async function testSocialMediaService() {
  console.log('🔍 Testando serviço de redes sociais...\n');
  
  const testCases = [
    '@instagram_user',
    '@teste_business',
    '@tech_developer',
    '@fake_profile',
    'linkedin.com/in/professional',
    '@professor_edu'
  ];
  
  for (const handle of testCases) {
    console.log(`\n📱 Testando: ${handle}`);
    try {
      const result = await socialMediaService.analyzeProfile(handle);
      console.log(`✅ Existe: ${result.exists}`);
      console.log(`📊 Plataforma: ${result.platform}`);
      console.log(`🎯 Tipo: ${result.creatorType}`);
      console.log(`📈 Seguidores: ${result.followers}`);
      console.log(`🔍 Confiança: ${result.confidence}%`);
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
  }
}

testSocialMediaService();