import { socialMediaService } from './services/socialMediaAPI';

// Teste funcional do serviço
async function testSocialService() {
  console.log('🔍 Testando serviço de redes sociais...');
  
  // Teste 1: Instagram com keywords
  console.log('\n📱 Teste 1: @professor_edu');
  const result1 = await socialMediaService.analyzeProfile('@professor_edu');
  console.log('Resultado:', {
    exists: result1.exists,
    platform: result1.platform,
    creatorType: result1.creatorType,
    confidence: result1.confidence,
    followers: result1.followers
  });

  // Teste 2: LinkedIn
  console.log('\n👔 Teste 2: linkedin.com/in/business-ceo');
  const result2 = await socialMediaService.analyzeProfile('linkedin.com/in/business-ceo');
  console.log('Resultado:', {
    exists: result2.exists,
    platform: result2.platform,
    creatorType: result2.creatorType,
    confidence: result2.confidence,
    followers: result2.followers
  });

  // Teste 3: Perfil que não existe
  console.log('\n❌ Teste 3: @fake_profile_123');
  const result3 = await socialMediaService.analyzeProfile('@fake_profile_123');
  console.log('Resultado:', {
    exists: result3.exists,
    platform: result3.platform,
    confidence: result3.confidence
  });

  console.log('\n✅ Testes concluídos!');
}

testSocialService().catch(console.error);