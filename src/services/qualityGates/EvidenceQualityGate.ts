// Evidence Quality Gate - Validates evidence quality automatically
interface Screenshot {
  filename: string;
  resolution: { width: number; height: number };
  timestamp: string;
  path: string;
  quality: number;
}

interface PerformanceMetrics {
  loadTime: number;
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  domContentLoaded: number;
  timestamp: string;
}

interface TestResult {
  testName: string;
  status: 'passed' | 'failed';
  duration: number;
  screenshots: string[];
  errors: string[];
  timestamp: string;
}

interface UserJourneyEvidence {
  stepName: string;
  screenshot: string;
  timestamp: string;
  success: boolean;
  details: any;
}

interface BrowserCompatibilityReport {
  browser: string;
  version: string;
  os: string;
  tests: TestResult[];
  screenshots: Screenshot[];
  issues: string[];
  timestamp: string;
}

interface EvidencePackage {
  screenshots: Screenshot[];
  performanceMetrics: PerformanceMetrics;
  testResults: TestResult[];
  userJourneyProof: UserJourneyEvidence[];
  browserCompatibility: BrowserCompatibilityReport[];
}

interface QualityGateResult {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  timestamp: string;
  details: any;
}

interface ValidationResult {
  passed: boolean;
  details: any;
}

export class EvidenceQualityGate {
  private qualityThresholds = {
    minScreenshotResolution: { width: 1200, height: 800 },
    minPerformanceScore: 85,
    maxLoadTime: 3000,
    maxLCP: 2500,
    maxFID: 100,
    maxCLS: 0.1,
    minTestPassRate: 95,
    minEvidenceQuality: 80
  };

  async validateEvidence(evidence: EvidencePackage): Promise<QualityGateResult> {
    console.log('🔍 Starting Evidence Quality Gate validation...');
    
    const validationResults = {
      screenshots: await this.validateScreenshots(evidence.screenshots),
      performance: await this.validatePerformanceMetrics(evidence.performanceMetrics),
      testResults: await this.validateTestResults(evidence.testResults),
      userJourney: await this.validateUserJourney(evidence.userJourneyProof),
      browserCompat: await this.validateBrowserCompatibility(evidence.browserCompatibility)
    };
    
    const overallScore = this.calculateOverallScore(validationResults);
    const issues = this.identifyIssues(validationResults);
    const recommendations = this.generateRecommendations(validationResults);
    
    const result = {
      passed: overallScore >= this.qualityThresholds.minEvidenceQuality && issues.length === 0,
      score: overallScore,
      issues,
      recommendations,
      timestamp: new Date().toISOString(),
      details: validationResults
    };
    
    // Log detailed results
    this.logValidationResults(result);
    
    return result;
  }
  
  private async validateScreenshots(screenshots: Screenshot[]): Promise<ValidationResult> {
    if (!screenshots || screenshots.length === 0) {
      return {
        passed: false,
        details: { error: 'No screenshots provided', count: 0 }
      };
    }
    
    const requirements = this.qualityThresholds.minScreenshotResolution;
    const validScreenshots: any[] = [];
    const invalidScreenshots: any[] = [];
    
    for (const screenshot of screenshots) {
      const isValid = 
        screenshot.resolution.width >= requirements.width &&
        screenshot.resolution.height >= requirements.height &&
        screenshot.quality >= 0.8;
      
      if (isValid) {
        validScreenshots.push({
          filename: screenshot.filename,
          resolution: screenshot.resolution,
          quality: screenshot.quality,
          timestamp: screenshot.timestamp
        });
      } else {
        invalidScreenshots.push({
          filename: screenshot.filename,
          issues: this.getScreenshotIssues(screenshot, requirements)
        });
      }
    }
    
    const passRate = validScreenshots.length / screenshots.length;
    
    return {
      passed: passRate >= 0.9, // 90% of screenshots must be valid
      details: {
        total: screenshots.length,
        valid: validScreenshots.length,
        invalid: invalidScreenshots.length,
        passRate: passRate * 100,
        validScreenshots,
        invalidScreenshots
      }
    };
  }
  
  private async validatePerformanceMetrics(metrics: PerformanceMetrics): Promise<ValidationResult> {
    if (!metrics) {
      return {
        passed: false,
        details: { error: 'No performance metrics provided' }
      };
    }
    
    const thresholds = this.qualityThresholds;
    const validationResults = {
      loadTime: metrics.loadTime <= thresholds.maxLoadTime,
      lcp: metrics.lcp <= thresholds.maxLCP,
      fid: metrics.fid <= thresholds.maxFID,
      cls: metrics.cls <= thresholds.maxCLS
    };
    
    const passedChecks = Object.values(validationResults).filter(Boolean).length;
    const totalChecks = Object.keys(validationResults).length;
    const score = (passedChecks / totalChecks) * 100;
    
    return {
      passed: score >= thresholds.minPerformanceScore,
      details: {
        metrics,
        thresholds: {
          maxLoadTime: thresholds.maxLoadTime,
          maxLCP: thresholds.maxLCP,
          maxFID: thresholds.maxFID,
          maxCLS: thresholds.maxCLS
        },
        validationResults,
        score,
        passedChecks,
        totalChecks
      }
    };
  }
  
  private async validateTestResults(testResults: TestResult[]): Promise<ValidationResult> {
    if (!testResults || testResults.length === 0) {
      return {
        passed: false,
        details: { error: 'No test results provided', count: 0 }
      };
    }
    
    const passedTests = testResults.filter(test => test.status === 'passed');
    const failedTests = testResults.filter(test => test.status === 'failed');
    const passRate = (passedTests.length / testResults.length) * 100;
    
    return {
      passed: passRate >= this.qualityThresholds.minTestPassRate,
      details: {
        total: testResults.length,
        passed: passedTests.length,
        failed: failedTests.length,
        passRate,
        failedTests: failedTests.map(test => ({
          name: test.testName,
          errors: test.errors,
          duration: test.duration
        }))
      }
    };
  }
  
  private async validateUserJourney(userJourneyProof: UserJourneyEvidence[]): Promise<ValidationResult> {
    if (!userJourneyProof || userJourneyProof.length === 0) {
      return {
        passed: false,
        details: { error: 'No user journey evidence provided', count: 0 }
      };
    }
    
    const successfulSteps = userJourneyProof.filter(step => step.success);
    const failedSteps = userJourneyProof.filter(step => !step.success);
    const successRate = (successfulSteps.length / userJourneyProof.length) * 100;
    
    return {
      passed: successRate >= 95, // 95% success rate required
      details: {
        total: userJourneyProof.length,
        successful: successfulSteps.length,
        failed: failedSteps.length,
        successRate,
        steps: userJourneyProof.map(step => ({
          stepName: step.stepName,
          success: step.success,
          timestamp: step.timestamp,
          hasScreenshot: !!step.screenshot
        }))
      }
    };
  }
  
  private async validateBrowserCompatibility(browserCompatibility: BrowserCompatibilityReport[]): Promise<ValidationResult> {
    if (!browserCompatibility || browserCompatibility.length === 0) {
      return {
        passed: false,
        details: { error: 'No browser compatibility evidence provided', count: 0 }
      };
    }
    
    const requiredBrowsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const testedBrowsers = browserCompatibility.map(report => report.browser);
    const allRequiredTested = requiredBrowsers.every(browser => 
      testedBrowsers.some(tested => tested.toLowerCase().includes(browser.toLowerCase()))
    );
    
    const compatibilityScore = browserCompatibility.reduce((acc, report) => {
      const passedTests = report.tests.filter(test => test.status === 'passed').length;
      const totalTests = report.tests.length;
      return acc + (totalTests > 0 ? (passedTests / totalTests) : 0);
    }, 0) / browserCompatibility.length * 100;
    
    return {
      passed: allRequiredTested && compatibilityScore >= 90,
      details: {
        requiredBrowsers,
        testedBrowsers,
        allRequiredTested,
        compatibilityScore,
        browserReports: browserCompatibility.map(report => ({
          browser: report.browser,
          version: report.version,
          os: report.os,
          testsPassed: report.tests.filter(test => test.status === 'passed').length,
          testsTotal: report.tests.length,
          issues: report.issues
        }))
      }
    };
  }
  
  private calculateOverallScore(validationResults: any): number {
    const weights = {
      screenshots: 0.2,
      performance: 0.25,
      testResults: 0.25,
      userJourney: 0.15,
      browserCompat: 0.15
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(validationResults).forEach(([key, result]: [string, any]) => {
      const weight = weights[key as keyof typeof weights] || 0;
      const score = result.passed ? 100 : 0;
      totalScore += score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }
  
  private identifyIssues(validationResults: any): string[] {
    const issues: string[] = [];
    
    Object.entries(validationResults).forEach(([category, result]: [string, any]) => {
      if (!result.passed) {
        switch (category) {
          case 'screenshots':
            issues.push(`Screenshot quality insufficient: ${result.details.invalid}/${result.details.total} screenshots failed validation`);
            break;
          case 'performance':
            issues.push(`Performance metrics below threshold: Score ${result.details.score}%`);
            break;
          case 'testResults':
            issues.push(`Test pass rate insufficient: ${result.details.passRate}% (required: 95%)`);
            break;
          case 'userJourney':
            issues.push(`User journey validation failed: ${result.details.successRate}% success rate`);
            break;
          case 'browserCompat':
            issues.push(`Browser compatibility insufficient: ${result.details.compatibilityScore}% compatibility`);
            break;
        }
      }
    });
    
    return issues;
  }
  
  private generateRecommendations(validationResults: any): string[] {
    const recommendations: string[] = [];
    
    Object.entries(validationResults).forEach(([category, result]: [string, any]) => {
      if (!result.passed) {
        switch (category) {
          case 'screenshots':
            recommendations.push('Improve screenshot quality: Use higher resolution and ensure all required elements are visible');
            break;
          case 'performance':
            recommendations.push('Optimize performance: Focus on load time, LCP, FID, and CLS metrics');
            break;
          case 'testResults':
            recommendations.push('Fix failing tests: Review and address test failures before proceeding');
            break;
          case 'userJourney':
            recommendations.push('Complete user journey validation: Ensure all user flow steps are successful');
            break;
          case 'browserCompat':
            recommendations.push('Improve browser compatibility: Test on all required browsers and fix compatibility issues');
            break;
        }
      }
    });
    
    return recommendations;
  }
  
  private getScreenshotIssues(screenshot: Screenshot, requirements: any): string[] {
    const issues: string[] = [];
    
    if (screenshot.resolution.width < requirements.width) {
      issues.push(`Width too low: ${screenshot.resolution.width} (required: ${requirements.width})`);
    }
    
    if (screenshot.resolution.height < requirements.height) {
      issues.push(`Height too low: ${screenshot.resolution.height} (required: ${requirements.height})`);
    }
    
    if (screenshot.quality < 0.8) {
      issues.push(`Quality too low: ${screenshot.quality} (required: 0.8)`);
    }
    
    return issues;
  }
  
  private logValidationResults(result: QualityGateResult): void {
    console.log('\n🚪 EVIDENCE QUALITY GATE RESULTS:');
    console.log(`✅ Status: ${result.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`📊 Score: ${result.score.toFixed(2)}%`);
    console.log(`⏰ Timestamp: ${result.timestamp}`);
    
    if (result.issues.length > 0) {
      console.log('\n❌ Issues Found:');
      result.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n📋 Detailed Results:');
    Object.entries(result.details).forEach(([category, details]: [string, any]) => {
      console.log(`  ${category}: ${details.passed ? '✅ PASSED' : '❌ FAILED'}`);
    });
  }
} 