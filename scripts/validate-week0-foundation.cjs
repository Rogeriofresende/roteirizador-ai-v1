/**
 * Week 0 Foundation Validation Script (Simplified)
 * Validates foundation readiness by checking file structure and completeness
 * Ensures 100% readiness for Week 1 handoff to IA Beta
 */

const fs = require('fs');
const path = require('path');

class Week0FoundationValidator {
  constructor() {
    this.results = {
      services: {},
      repositories: {},
      documentation: {},
      apiLayer: {},
      architecture: {},
      errors: [],
      startTime: Date.now()
    };
  }

  async validateFoundation() {
    console.log('🧪 Starting Week 0 Foundation Validation...\n');
    
    try {
      // 1. Validate Service Files
      await this.validateServiceFiles();
      
      // 2. Validate Repository Files
      await this.validateRepositoryFiles();
      
      // 3. Validate Architecture
      await this.validateArchitecture();
      
      // 4. Validate API Layer
      await this.validateApiLayer();
      
      // 5. Validate Documentation
      await this.validateDocumentation();
      
      // Generate comprehensive report
      this.generateValidationReport();
      
    } catch (error) {
      console.error('💥 Validation failed:', error);
      this.results.errors.push({
        phase: 'validation',
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  async validateServiceFiles() {
    console.log('🏗️  Validating Service Files...');
    
    const serviceFiles = [
      // Core Services
      { path: 'src/services/core/CostManagementService.ts', name: 'CostManagementService' },
      { path: 'src/services/core/BudgetControlService.ts', name: 'BudgetControlService' },
      { path: 'src/services/core/RateLimitingService.ts', name: 'RateLimitingService' },
      { path: 'src/services/core/PriorityQueueService.ts', name: 'PriorityQueueService' },
      { path: 'src/services/core/FallbackService.ts', name: 'FallbackService' },
      { path: 'src/services/core/UsageTierService.ts', name: 'UsageTierService' },
      { path: 'src/services/external/GeminiService.ts', name: 'GeminiService' },
      
      // Business Services
      { path: 'src/services/business/IdeaBankService.ts', name: 'IdeaBankService' },
      { path: 'src/services/business/PersonalizationService.ts', name: 'PersonalizationService' },
      { path: 'src/services/business/ReferralService.ts', name: 'ReferralService' },
      
      // Infrastructure Services
      { path: 'src/services/analytics/AnalyticsService.ts', name: 'AnalyticsService' },
      { path: 'src/services/infrastructure/NotificationService.ts', name: 'NotificationService' }
    ];

    for (const service of serviceFiles) {
      try {
        const exists = fs.existsSync(service.path);
        let hasClass = false;
        let hasInitialize = false;
        let hasHealthCheck = false;
        let fileSize = 0;

        if (exists) {
          const content = fs.readFileSync(service.path, 'utf8');
          fileSize = Math.round(content.length / 1024); // KB
          hasClass = content.includes(`class ${service.name}`);
          hasInitialize = content.includes('initialize') || content.includes('onInitialize');
          hasHealthCheck = content.includes('healthCheck');
        }

        this.results.services[service.name] = {
          exists,
          hasClass,
          hasInitialize,
          hasHealthCheck,
          fileSize,
          status: exists && hasClass ? '✅' : '❌'
        };

        console.log(`  ${this.results.services[service.name].status} ${service.name} (${fileSize}KB)`);
        
      } catch (error) {
        this.results.services[service.name] = {
          exists: false,
          error: error.message,
          status: '❌'
        };
        console.log(`  ❌ ${service.name} - Error: ${error.message}`);
      }
    }
    
    console.log('✅ Service Files validation complete\n');
  }

  async validateRepositoryFiles() {
    console.log('🗄️  Validating Repository Files...');
    
    const repositoryFiles = [
      { path: 'src/repositories/UserRepository.ts', name: 'UserRepository' },
      { path: 'src/repositories/IdeaRepository.ts', name: 'IdeaRepository' },
      { path: 'src/repositories/PreferencesRepository.ts', name: 'PreferencesRepository' }
    ];

    for (const repo of repositoryFiles) {
      try {
        const exists = fs.existsSync(repo.path);
        let hasClass = false;
        let hasBaseMethods = false;
        let fileSize = 0;

        if (exists) {
          const content = fs.readFileSync(repo.path, 'utf8');
          fileSize = Math.round(content.length / 1024);
          hasClass = content.includes(`class ${repo.name}`);
          hasBaseMethods = content.includes('findById') && content.includes('create') && content.includes('update');
        }

        this.results.repositories[repo.name] = {
          exists,
          hasClass,
          hasBaseMethods,
          fileSize,
          status: exists && hasClass && hasBaseMethods ? '✅' : '❌'
        };

        console.log(`  ${this.results.repositories[repo.name].status} ${repo.name} (${fileSize}KB)`);
        
      } catch (error) {
        this.results.repositories[repo.name] = {
          exists: false,
          error: error.message,
          status: '❌'
        };
      }
    }
    
    console.log('✅ Repository Files validation complete\n');
  }

  async validateArchitecture() {
    console.log('🏛️  Validating Architecture...');
    
    const architectureFiles = [
      { path: 'src/architecture/ServiceArchitecture.ts', name: 'ServiceArchitecture' }
    ];

    for (const arch of architectureFiles) {
      try {
        const exists = fs.existsSync(arch.path);
        let hasApplication = false;
        let hasContainer = false;
        let hasServiceRegistration = false;
        let fileSize = 0;

        if (exists) {
          const content = fs.readFileSync(arch.path, 'utf8');
          fileSize = Math.round(content.length / 1024);
          hasApplication = content.includes('class Application');
          hasContainer = content.includes('ServiceContainer');
          hasServiceRegistration = content.includes('registerBusinessServices') && content.includes('registerInfrastructureServices');
        }

        this.results.architecture[arch.name] = {
          exists,
          hasApplication,
          hasContainer,
          hasServiceRegistration,
          fileSize,
          status: exists && hasApplication && hasContainer && hasServiceRegistration ? '✅' : '❌'
        };

        console.log(`  ${this.results.architecture[arch.name].status} ${arch.name} (${fileSize}KB)`);
        
      } catch (error) {
        this.results.architecture[arch.name] = {
          exists: false,
          error: error.message,
          status: '❌'
        };
      }
    }
    
    console.log('✅ Architecture validation complete\n');
  }

  async validateApiLayer() {
    console.log('🔗 Validating API Integration Layer...');
    
    const apiFiles = [
      { path: 'src/api/ApiIntegrationLayer.ts', name: 'ApiIntegrationLayer' }
    ];

    for (const api of apiFiles) {
      try {
        const exists = fs.existsSync(api.path);
        let hasApiClasses = false;
        let hasResponse = false;
        let fileSize = 0;

        if (exists) {
          const content = fs.readFileSync(api.path, 'utf8');
          fileSize = Math.round(content.length / 1024);
          hasApiClasses = content.includes('IdeaBankAPI') && content.includes('PersonalizationAPI') && content.includes('AnalyticsAPI');
          hasResponse = content.includes('ApiResponse') && content.includes('RequestContext');
        }

        this.results.apiLayer[api.name] = {
          exists,
          hasApiClasses,
          hasResponse,
          fileSize,
          status: exists && hasApiClasses && hasResponse ? '✅' : '❌'
        };

        console.log(`  ${this.results.apiLayer[api.name].status} ${api.name} (${fileSize}KB)`);
        
      } catch (error) {
        this.results.apiLayer[api.name] = {
          exists: false,
          error: error.message,
          status: '❌'
        };
      }
    }
    
    console.log('✅ API Layer validation complete\n');
  }

  async validateDocumentation() {
    console.log('📚 Validating Documentation...');
    
    const docFiles = [
      { path: 'docs/integration/WEEK_1_INTEGRATION_GUIDE.md', name: 'Week 1 Integration Guide' },
      { path: 'docs/integration/API_USAGE_EXAMPLES.md', name: 'API Usage Examples' },
      { path: 'COORDENACAO_MULTI_AI.md', name: 'Multi-AI Coordination' }
    ];

    for (const doc of docFiles) {
      try {
        const exists = fs.existsSync(doc.path);
        let hasContent = false;
        let hasExamples = false;
        let fileSize = 0;

        if (exists) {
          const content = fs.readFileSync(doc.path, 'utf8');
          fileSize = Math.round(content.length / 1024);
          hasContent = content.length > 1000;
          hasExamples = content.includes('```') || content.includes('typescript') || content.includes('tsx');
        }

        this.results.documentation[doc.name] = {
          exists,
          hasContent,
          hasExamples,
          fileSize,
          status: exists && hasContent ? '✅' : '❌'
        };

        console.log(`  ${this.results.documentation[doc.name].status} ${doc.name} (${fileSize}KB)`);
        
      } catch (error) {
        this.results.documentation[doc.name] = {
          exists: false,
          error: error.message,
          status: '❌'
        };
      }
    }
    
    console.log('✅ Documentation validation complete\n');
  }

  generateValidationReport() {
    const totalTime = Date.now() - this.results.startTime;
    
    console.log('📊 WEEK 0 FOUNDATION VALIDATION REPORT');
    console.log('=====================================\n');
    
    // Overall Status
    const hasErrors = this.results.errors.length > 0;
    const readinessScore = this.calculateReadinessScore();
    const overallStatus = readinessScore >= 95 ? '✅' : readinessScore >= 85 ? '⚠️' : '❌';
    
    console.log(`Overall Status: ${overallStatus} ${readinessScore >= 95 ? 'EXCELLENT' : readinessScore >= 85 ? 'GOOD' : 'NEEDS ATTENTION'}`);
    console.log(`Foundation Score: ${readinessScore}%`);
    console.log(`Validation Time: ${totalTime}ms\n`);
    
    // Service Status
    console.log('🏗️  SERVICE FILES:');
    Object.entries(this.results.services).forEach(([service, status]) => {
      console.log(`  ${status.status} ${service} (${status.fileSize || 0}KB)`);
    });
    console.log();
    
    // Repository Status
    console.log('🗄️  REPOSITORY FILES:');
    Object.entries(this.results.repositories).forEach(([repo, status]) => {
      console.log(`  ${status.status} ${repo} (${status.fileSize || 0}KB)`);
    });
    console.log();
    
    // Architecture Status
    console.log('🏛️  ARCHITECTURE:');
    Object.entries(this.results.architecture).forEach(([arch, status]) => {
      console.log(`  ${status.status} ${arch} (${status.fileSize || 0}KB)`);
    });
    console.log();
    
    // API Layer Status
    console.log('🔗 API INTEGRATION LAYER:');
    Object.entries(this.results.apiLayer).forEach(([api, status]) => {
      console.log(`  ${status.status} ${api} (${status.fileSize || 0}KB)`);
    });
    console.log();
    
    // Documentation Status
    console.log('📚 DOCUMENTATION:');
    Object.entries(this.results.documentation).forEach(([doc, status]) => {
      console.log(`  ${status.status} ${doc} (${status.fileSize || 0}KB)`);
    });
    console.log();
    
    // Errors
    if (this.results.errors.length > 0) {
      console.log('⚠️  WARNINGS/ERRORS:');
      this.results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.phase}] ${error.error}`);
      });
      console.log();
    }
    
    // Summary
    console.log('📋 SUMMARY:');
    const totalServices = Object.keys(this.results.services).length;
    const healthyServices = Object.values(this.results.services).filter(s => s.status === '✅').length;
    
    const totalRepos = Object.keys(this.results.repositories).length;
    const healthyRepos = Object.values(this.results.repositories).filter(r => r.status === '✅').length;
    
    const totalDocs = Object.keys(this.results.documentation).length;
    const healthyDocs = Object.values(this.results.documentation).filter(d => d.status === '✅').length;
    
    console.log(`✅ Services: ${healthyServices}/${totalServices} implemented`);
    console.log(`✅ Repositories: ${healthyRepos}/${totalRepos} implemented`);
    console.log(`✅ Architecture: ${Object.values(this.results.architecture).filter(a => a.status === '✅').length}/1 implemented`);
    console.log(`✅ API Layer: ${Object.values(this.results.apiLayer).filter(a => a.status === '✅').length}/1 implemented`);
    console.log(`✅ Documentation: ${healthyDocs}/${totalDocs} completed`);
    console.log();
    
    // File size summary
    const totalSize = this.calculateTotalSize();
    console.log(`📦 Total Foundation Size: ${totalSize}KB`);
    console.log();
    
    // Week 1 Readiness
    console.log('🚀 WEEK 1 READINESS:');
    console.log(`Foundation Score: ${readinessScore}%`);
    console.log(`Status: ${readinessScore >= 95 ? '✅ EXCELLENT - Ready for Week 1!' : readinessScore >= 85 ? '⚠️ GOOD - Minor issues' : '❌ NEEDS ATTENTION'}`);
    
    if (readinessScore >= 95) {
      console.log(`🎉 Foundation quality EXCEEDS EXPECTATIONS!`);
      console.log(`🚀 IA Beta can start Week 1 implementation immediately!`);
    } else if (readinessScore >= 85) {
      console.log(`⚠️ Foundation is solid but has minor gaps. Safe to proceed.`);
    } else {
      console.log(`❌ Foundation needs attention before Week 1.`);
    }
    
    console.log();
    console.log('🎯 WEEK 0 FOUNDATION VALIDATION COMPLETE!');
    
    if (readinessScore >= 95) {
      console.log('🎊 MISSION ACCOMPLISHED! Ready for IA Beta handoff! 🎉');
    }
  }

  calculateReadinessScore() {
    let score = 0;
    let maxScore = 0;
    
    // Services score (40%)
    const serviceEntries = Object.values(this.results.services);
    if (serviceEntries.length > 0) {
      const healthyServices = serviceEntries.filter(s => s.status === '✅').length;
      score += (healthyServices / serviceEntries.length) * 40;
    }
    maxScore += 40;
    
    // Repositories score (20%)
    const repoEntries = Object.values(this.results.repositories);
    if (repoEntries.length > 0) {
      const healthyRepos = repoEntries.filter(r => r.status === '✅').length;
      score += (healthyRepos / repoEntries.length) * 20;
    }
    maxScore += 20;
    
    // Architecture score (15%)
    const archEntries = Object.values(this.results.architecture);
    if (archEntries.length > 0) {
      const healthyArch = archEntries.filter(a => a.status === '✅').length;
      score += (healthyArch / archEntries.length) * 15;
    }
    maxScore += 15;
    
    // API Layer score (15%)
    const apiEntries = Object.values(this.results.apiLayer);
    if (apiEntries.length > 0) {
      const healthyApi = apiEntries.filter(a => a.status === '✅').length;
      score += (healthyApi / apiEntries.length) * 15;
    }
    maxScore += 15;
    
    // Documentation score (10%)
    const docEntries = Object.values(this.results.documentation);
    if (docEntries.length > 0) {
      const healthyDocs = docEntries.filter(d => d.status === '✅').length;
      score += (healthyDocs / docEntries.length) * 10;
    }
    maxScore += 10;
    
    return Math.round((score / maxScore) * 100);
  }

  calculateTotalSize() {
    let totalSize = 0;
    
    Object.values(this.results.services).forEach(s => totalSize += s.fileSize || 0);
    Object.values(this.results.repositories).forEach(r => totalSize += r.fileSize || 0);
    Object.values(this.results.architecture).forEach(a => totalSize += a.fileSize || 0);
    Object.values(this.results.apiLayer).forEach(a => totalSize += a.fileSize || 0);
    Object.values(this.results.documentation).forEach(d => totalSize += d.fileSize || 0);
    
    return totalSize;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new Week0FoundationValidator();
  validator.validateFoundation().catch(console.error);
}

module.exports = Week0FoundationValidator; 