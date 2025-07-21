/**
 * 🐛 DEBUG: Teste específico para perfil do usuário
 */

import { socialMediaService } from './src/services/socialMediaAPI.ts';

async function debugUserProfile() {
  console.log('🐛 DEBUG: Testando perfil do usuário');
  console.log('=' .repeat(50));
  
  // Pedir ao usuário qual handle está usando
  console.log('\n❓ QUAL HANDLE VOCÊ ESTÁ TESTANDO?');
  console.log('Exemplos que funcionaram:');
  console.log('  - @rogerioresende');
  console.log('  - @rogerio_resende');
  console.log('  - @rogerio.resende');
  console.log('  - linkedin.com/in/rogerioresende');
  
  // Teste com diferentes formatos
  const testCases = [
    // Instagram variants
    'rogerioresende',
    '@rogerioresende',
    'rogerio_resende',
    '@rogerio_resende',
    'rogerio.resende',
    '@rogerio.resende',
    
    // LinkedIn variants
    'linkedin.com/in/rogerioresende',
    'linkedin.com/in/rogerio-resende',
    'rogerioresende', // LinkedIn direct
    'rogerio-resende', // LinkedIn direct
  ];
  
  for (const handle of testCases) {
    console.log(`\n🔍 Testando: "${handle}"`);
    
    try {
      const result = await socialMediaService.analyzeProfile(handle);
      
      if (result.exists) {
        console.log(`✅ ENCONTRADO!`);
        console.log(`   Plataforma: ${result.platform}`);
        console.log(`   Handle: ${result.handle}`);
        console.log(`   Tipo: ${result.creatorType}`);
        console.log(`   Seguidores: ${result.followers?.toLocaleString() || 'N/A'}`);
        console.log(`   Confiança: ${result.confidence}%`);
        
        if (result.verificationData) {
          console.log(`   🔍 Verificação:`);
          console.log(`      Perfil Real: ${result.verificationData.realProfile ? '✅' : '❌'}`);
          console.log(`      Dados Extraídos: ${result.verificationData.extractedData ? '✅' : '❌'}`);
        }
      } else {
        console.log(`❌ NÃO ENCONTRADO`);
        console.log(`   Plataforma: ${result.platform}`);
        console.log(`   Handle: ${result.handle}`);
        console.log(`   Confiança: ${result.confidence}%`);
      }
      
    } catch (error) {
      console.error(`❌ ERRO: ${error.message}`);
    }
    
    // Delay para evitar rate limit
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📋 POSSÍVEIS PROBLEMAS:');
  console.log('1. ❓ Handle está sendo digitado com formato incorreto');
  console.log('2. ❓ Perfil está privado ou restrito');
  console.log('3. ❓ Username específico não está na lista conhecida');
  console.log('4. ❓ Problema de CORS com plataforma específica');
  console.log('5. ❓ Rate limit temporário');
  
  console.log('\n💡 SOLUÇÕES:');
  console.log('1. ✅ Teste com @ no início ou sem @');
  console.log('2. ✅ Confirme se o perfil é público');
  console.log('3. ✅ Tente LinkedIn: linkedin.com/in/username');
  console.log('4. ✅ Aguarde 1 minuto e tente novamente');
}

debugUserProfile().catch(console.error);