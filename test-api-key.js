// Quick test script for new Gemini API key
// Run this in browser console or save as file

async function testNewApiKey() {
  const apiKey = 'AIzaSyAnKw8AoRzSBnu2NFYW5UvdYsosF2pA_ec';
  
  console.log('🧪 Testing new Gemini API key...');
  console.log('🔑 Key prefix:', apiKey.substring(0, 10) + '...');
  
  const modelsToTest = [
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest', 
    'gemini-1.5-flash'
  ];
  
  for (const model of modelsToTest) {
    console.log(`\n🧪 Testing model: ${model}`);
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Hello'
              }]
            }]
          })
        }
      );
      
      console.log(`📊 Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS with ${model}!`);
        console.log('📝 Response:', data.candidates[0].content.parts[0].text);
        return { success: true, model, apiKey };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log(`❌ Failed with ${model}:`, {
          status: response.status,
          error: errorData?.error?.message || 'Unknown error'
        });
      }
    } catch (error) {
      console.log(`💥 Network error with ${model}:`, error.message);
    }
  }
  
  console.log('\n❌ All models failed with this API key');
  return { success: false };
}

// Auto-run the test
testNewApiKey().then(result => {
  if (result.success) {
    console.log(`\n🎉 NEW API KEY WORKS! Model: ${result.model}`);
    console.log('💡 To use it permanently, run:');
    console.log(`localStorage.setItem('GEMINI_API_KEY', '${result.apiKey}');`);
    console.log('Then reload the page.');
  } else {
    console.log('\n🚨 New API key failed. Check if it\'s properly configured.');
  }
});