/**
 * 🧪 TESTE REAL DE PERFIS SOCIAIS
 * Script para testar verificação com perfis verdadeiros
 */

import { socialMediaService } from './src/services/socialMediaAPI.ts';

// Perfis reais para testar
const REAL_PROFILES = [
  '@nasa',
  '@natgeo', 
  '@google',
  '@cocacola',
  'linkedin.com/in/satyanadella',
  'linkedin.com/in/williamhgates'
];

// Perfis falsos para testar  
const FAKE_PROFILES = [
  '@profile_fake_test_123',
  '@abcdefghijklmnop',
  '@test_user_fake'
];

async function testProfile(handle) {
  console.log(`\n🔍 Testando: ${handle}`);
  
  try {
    const result = await socialMediaService.analyzeProfile(handle);
    
    console.log(`✅ Resultado:`);
    console.log(`   Existe: ${result.exists ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Plataforma: ${result.platform}`);
    console.log(`   Handle: ${result.handle}`);
    console.log(`   Confiança: ${result.confidence}%`);
    
    if (result.exists) {
      console.log(`   Tipo: ${result.creatorType}`);
      console.log(`   Seguidores: ${result.followers?.toLocaleString() || 'N/A'}`);
      console.log(`   Verificado: ${result.isVerified ? '✅' : '❌'}`);
      
      if (result.verificationData) {
        console.log(`   🔍 Verificação:`);
        console.log(`      Perfil Real: ${result.verificationData.realProfile ? '✅' : '❌'}`);
        console.log(`      Dados Extraídos: ${result.verificationData.extractedData ? '✅' : '❌'}`);
        console.log(`      Verificado em: ${new Date(result.verificationData.checkedAt).toLocaleString()}`);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Erro ao testar ${handle}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 INICIANDO TESTE DE PERFIS REAIS');
  console.log('=' .repeat(50));
  
  console.log('\n📈 TESTANDO PERFIS QUE DEVEM EXISTIR:');
  const realResults = [];
  for (const profile of REAL_PROFILES) {
    const result = await testProfile(profile);
    realResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay para evitar rate limit
  }
  
  console.log('\n📉 TESTANDO PERFIS QUE NÃO DEVEM EXISTIR:');
  const fakeResults = [];
  for (const profile of FAKE_PROFILES) {
    const result = await testProfile(profile);
    fakeResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay para evitar rate limit
  }
  
  console.log('\n📊 RESUMO DOS RESULTADOS:');
  console.log('=' .repeat(50));
  
  const realExisting = realResults.filter(r => r && r.exists).length;
  const realTotal = realResults.filter(r => r !== null).length;
  const fakeExisting = fakeResults.filter(r => r && r.exists).length;
  const fakeTotal = fakeResults.filter(r => r !== null).length;
  
  console.log(`✅ Perfis reais encontrados: ${realExisting}/${realTotal} (${Math.round(realExisting/realTotal*100)}%)`);
  console.log(`❌ Perfis falsos encontrados: ${fakeExisting}/${fakeTotal} (${Math.round(fakeExisting/fakeTotal*100)}%)`);
  
  console.log('\n🎯 CONCLUSÃO:');
  if (realExisting > realTotal * 0.7) {
    console.log('✅ Sistema detecta perfis reais corretamente');
  } else {
    console.log('⚠️  Sistema pode ter problemas para detectar perfis reais');
  }
  
  if (fakeExisting < fakeTotal * 0.3) {
    console.log('✅ Sistema rejeita perfis falsos corretamente');
  } else {
    console.log('⚠️  Sistema aceita muitos perfis falsos');
  }
}

// Executar testes
runTests().catch(console.error);