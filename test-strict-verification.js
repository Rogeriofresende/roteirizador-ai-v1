import { socialMediaService } from './src/services/socialMediaAPI.ts';

async function testStrictVerification() {
  console.log('🔧 Testando verificação rigorosa...');
  
  const testCases = [
    { handle: 'rogerioresende', expected: true, desc: 'Perfil real conhecido' },
    { handle: 'roorrdge', expected: false, desc: 'Perfil inexistente' },
    { handle: 'usuarioteste', expected: false, desc: 'Perfil com teste' },
    { handle: 'nasa', expected: true, desc: 'Perfil real conhecido' },
    { handle: 'profilefake123', expected: false, desc: 'Perfil fake' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Testando: ${testCase.handle} (${testCase.desc})`);
    
    try {
      const result = await socialMediaService.analyzeProfile(testCase.handle);
      const isCorrect = result.exists === testCase.expected;
      
      console.log(`Resultado: exists=${result.exists}, esperado=${testCase.expected} ${isCorrect ? '✅' : '❌'}`);
      
      if (!isCorrect) {
        console.log(`⚠️  PROBLEMA: Resultado incorreto para ${testCase.handle}`);
      }
      
    } catch (error) {
      console.error(`❌ Erro: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testStrictVerification().catch(console.error);