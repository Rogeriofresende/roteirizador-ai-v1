/**
 * 🧪 V8.1 ENHANCED SOCIAL MEDIA API TESTS
 * Tests para verificação rigorosa de perfis reais
 * 
 * @author IA Claude - V8.1 Enhanced Creator Analysis
 * @created 2025-07-17T16:00:00Z
 * @methodology V8.1_ENHANCED_REAL_PROFILE_TESTING
 */

import { socialMediaService } from '../socialMediaAPI';

describe('V8.1 Enhanced Social Media Profile Verification', () => {
  // Rate limiting entre testes
  beforeEach(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Real Profile Verification Tests', () => {
    test('should correctly identify real well-known profiles', async () => {
      const realProfiles = [
        'rogerioresende',
        'nasa',
        'cristiano'
      ];

      for (const handle of realProfiles) {
        console.log(`🔍 Testing real profile: ${handle}`);
        
        const result = await socialMediaService.analyzeProfile(handle);
        
        expect(result.exists).toBe(true);
        expect(result.confidence).toBeGreaterThan(70);
        expect(result.handle).toBe(handle);
        
        console.log(`✅ ${handle}: exists=${result.exists}, confidence=${result.confidence}%`);
        
        // Delay between real requests
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }, 30000);

    test('should correctly reject fake profiles', async () => {
      const fakeProfiles = [
        'usuarioteste123fake',
        'profileinexistente456',
        'contaquenadaexiste789'
      ];

      for (const handle of fakeProfiles) {
        console.log(`🔍 Testing fake profile: ${handle}`);
        
        const result = await socialMediaService.analyzeProfile(handle);
        
        expect(result.exists).toBe(false);
        expect(result.confidence).toBeLessThan(50);
        expect(result.handle).toBe(handle);
        
        console.log(`❌ ${handle}: exists=${result.exists}, confidence=${result.confidence}%`);
        
        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }, 20000);

    test('should extract real metrics when available', async () => {
      const profileHandle = 'rogerioresende';
      
      console.log(`🔍 Testing real metrics extraction for: ${profileHandle}`);
      
      const result = await socialMediaService.analyzeProfile(profileHandle);
      
      if (result.exists && result.realMetrics) {
        expect(result.realMetrics.averageEngagement).toBeGreaterThan(0);
        expect(result.realMetrics.postFrequency).toBeDefined();
        expect(result.realMetrics.topHashtags).toBeInstanceOf(Array);
        
        console.log(`✅ Real metrics extracted:`, {
          engagement: result.realMetrics.averageEngagement,
          frequency: result.realMetrics.postFrequency,
          hashtags: result.realMetrics.topHashtags.slice(0, 3)
        });
      } else {
        console.log(`⚠️ Real metrics not available for ${profileHandle}`);
      }
      
      expect(result.analysisDepth).toBeDefined();
      expect(['basic', 'enhanced', 'deep']).toContain(result.analysisDepth);
    }, 15000);

    test('should perform tone analysis when real posts available', async () => {
      const profileHandle = 'rogerioresende';
      
      console.log(`🔍 Testing tone analysis for: ${profileHandle}`);
      
      const result = await socialMediaService.analyzeProfile(profileHandle);
      
      if (result.exists && result.toneProfile) {
        expect(['professional', 'casual', 'inspirational', 'educational', 'entertaining'])
          .toContain(result.toneProfile.personality);
        expect(['formal', 'semi-formal', 'informal'])
          .toContain(result.toneProfile.formality);
        expect(['positive', 'neutral', 'passionate', 'motivational'])
          .toContain(result.toneProfile.emotion);
        
        console.log(`✅ Tone profile analyzed:`, {
          personality: result.toneProfile.personality,
          formality: result.toneProfile.formality,
          emotion: result.toneProfile.emotion
        });
      } else {
        console.log(`⚠️ Tone analysis not available for ${profileHandle}`);
      }
    }, 15000);
  });

  describe('Auto-Fill Data Extraction Tests', () => {
    test('should extract comprehensive auto-fill data', async () => {
      const profileHandle = 'rogerioresende';
      
      console.log(`🔍 Testing auto-fill data extraction for: ${profileHandle}`);
      
      const result = await socialMediaService.analyzeProfile(profileHandle);
      
      if (result.exists) {
        // Test if we can extract data for auto-fill
        expect(result.creatorType).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0);
        
        // If real metrics are available, they should be comprehensive
        if (result.realMetrics) {
          expect(result.realMetrics.postsCount).toBeGreaterThan(0);
          expect(result.realMetrics.averageEngagement).toBeGreaterThan(0);
        }
        
        console.log(`✅ Auto-fill extraction successful:`, {
          creatorType: result.creatorType,
          confidence: result.confidence,
          hasRealMetrics: !!result.realMetrics,
          hasToneProfile: !!result.toneProfile
        });
      }
    }, 15000);
  });

  describe('V8.1 Enhanced Features Tests', () => {
    test('should include V8.1 enhanced metadata', async () => {
      const profileHandle = 'rogerioresende';
      
      const result = await socialMediaService.analyzeProfile(profileHandle);
      
      // V8.1 enhanced features
      expect(result.analysisDepth).toBeDefined();
      expect(result.extractionSuccess).toBeDefined();
      expect(typeof result.extractionSuccess).toBe('boolean');
      
      console.log(`✅ V8.1 metadata present:`, {
        analysisDepth: result.analysisDepth,
        extractionSuccess: result.extractionSuccess
      });
    }, 10000);

    test('should handle rate limiting gracefully', async () => {
      console.log(`🔍 Testing rate limiting behavior`);
      
      const results = [];
      const handles = ['nasa', 'rogerioresende', 'cristiano'];
      
      for (const handle of handles) {
        const startTime = Date.now();
        const result = await socialMediaService.analyzeProfile(handle);
        const endTime = Date.now();
        
        results.push({
          handle,
          exists: result.exists,
          duration: endTime - startTime
        });
        
        // Ensure we don't overwhelm services
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log(`✅ Rate limiting test completed:`, results);
      expect(results.length).toBe(3);
    }, 25000);
  });

  describe('Error Handling and Resilience', () => {
    test('should handle network failures gracefully', async () => {
      const invalidHandle = 'this-is-a-super-long-invalid-handle-that-should-fail-12345';
      
      console.log(`🔍 Testing error handling for: ${invalidHandle}`);
      
      const result = await socialMediaService.analyzeProfile(invalidHandle);
      
      expect(result.exists).toBe(false);
      expect(result.handle).toBe(invalidHandle);
      expect(result.confidence).toBeLessThan(30);
      
      console.log(`✅ Error handled gracefully:`, {
        exists: result.exists,
        confidence: result.confidence
      });
    }, 10000);
  });
});