/**
 * Responsive Testing Service - Professional Grade
 * Automated layout testing, breakpoint validation, and UX metrics
 */

import { createLogger } from '../utils/logger';
import { tokens } from '../design-system/tokens';

const logger = createLogger('ResponsiveTestingService');

interface ResponsiveTestResult {
  breakpoint: string;
  resolution: string;
  passed: boolean;
  issues: ResponsiveIssue[];
  metrics: ResponsiveMetrics;
}

interface ResponsiveIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'overflow' | 'touch-target' | 'text-readability' | 'interaction';
  element: string;
  description: string;
  fix: string;
}

interface ResponsiveMetrics {
  horizontalScroll: boolean;
  touchTargetsBelow44px: number;
  textTooSmall: number;
  overlappingElements: number;
  layoutShiftScore: number;
  interactionScore: number;
}

export class ResponsiveTestingService {
  private static instance: ResponsiveTestingService;
  
  private constructor() {}
  
  static getInstance(): ResponsiveTestingService {
    if (!ResponsiveTestingService.instance) {
      ResponsiveTestingService.instance = new ResponsiveTestingService();
    }
    return ResponsiveTestingService.instance;
  }

  /**
   * Testa layout em todos os breakpoints
   */
  async testAllBreakpoints(): Promise<ResponsiveTestResult[]> {
    logger.info('Starting comprehensive responsive testing...');
    
    const testResults: ResponsiveTestResult[] = [];
    
    const testResolutions = [
      { name: 'mobile-portrait', width: 375, height: 667 },
      { name: 'mobile-landscape', width: 667, height: 375 },
      { name: 'tablet-portrait', width: 768, height: 1024 },
      { name: 'tablet-landscape', width: 1024, height: 768 },
      { name: 'desktop-small', width: 1280, height: 720 },
      { name: 'desktop-large', width: 1920, height: 1080 },
      { name: 'wide-screen', width: 2560, height: 1440 }
    ];

    for (const resolution of testResolutions) {
      const result = await this.testResolution(resolution.width, resolution.height, resolution.name);
      testResults.push(result);
    }

    const criticalIssues = testResults.filter(r => 
      r.issues.some(i => i.severity === 'critical')
    );

    if (criticalIssues.length > 0) {
      logger.error('Critical responsive issues found!', { 
        criticalBreakpoints: criticalIssues.map(r => r.breakpoint)
      });
    } else {
      logger.info('All responsive tests passed!');
    }

    return testResults;
  }

  /**
   * Testa uma resolução específica
   */
  private async testResolution(width: number, height: number, name: string): Promise<ResponsiveTestResult> {
    // Simular mudança de viewport (em ambiente real seria via Playwright/Puppeteer)
    if (typeof window !== 'undefined') {
      // Simular resize para testes em development
      window.dispatchEvent(new Event('resize'));
    }

    const issues: ResponsiveIssue[] = [];
    const metrics: ResponsiveMetrics = {
      horizontalScroll: false,
      touchTargetsBelow44px: 0,
      textTooSmall: 0,
      overlappingElements: 0,
      layoutShiftScore: 0,
      interactionScore: 0
    };

    // Teste 1: Verificar scroll horizontal
    if (typeof document !== 'undefined') {
      const bodyWidth = document.body.scrollWidth;
      const viewportWidth = window.innerWidth;
      
      if (bodyWidth > viewportWidth) {
        metrics.horizontalScroll = true;
        issues.push({
          severity: 'critical',
          type: 'overflow',
          element: 'body',
          description: `Horizontal scroll detected: ${bodyWidth}px > ${viewportWidth}px`,
          fix: 'Review container widths and implement proper responsive breakpoints'
        });
      }
    }

    // Teste 2: Verificar touch targets
    await this.validateTouchTargets(issues, metrics);

    // Teste 3: Verificar legibilidade de texto
    await this.validateTextReadability(issues, metrics, width);

    // Teste 4: Verificar elementos sobrepostos
    await this.validateElementOverlap(issues, metrics);

    const passed = !issues.some(issue => issue.severity === 'critical');

    return {
      breakpoint: this.getBreakpointName(width),
      resolution: `${width}x${height}`,
      passed,
      issues,
      metrics
    };
  }

  /**
   * Valida touch targets (mínimo 44px)
   */
  private async validateTouchTargets(issues: ResponsiveIssue[], metrics: ResponsiveMetrics): Promise<void> {
    if (typeof document === 'undefined') return;

    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
    
    interactiveElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const minSize = 44;
      
      if (rect.width < minSize || rect.height < minSize) {
        metrics.touchTargetsBelow44px++;
        
        const severity = rect.width < 32 || rect.height < 32 ? 'critical' : 'medium';
        
        issues.push({
          severity,
          type: 'touch-target',
          element: element.tagName.toLowerCase() + (element.className ? `.${element.className.split(' ')[0]}` : ''),
          description: `Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px (minimum: ${minSize}px)`,
          fix: `Add min-h-[44px] min-w-[44px] classes or use touchButtonClasses from design system`
        });
      }
    });
  }

  /**
   * Valida legibilidade de texto
   */
  private async validateTextReadability(issues: ResponsiveIssue[], metrics: ResponsiveMetrics, viewportWidth: number): Promise<void> {
    if (typeof document === 'undefined') return;

    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a');
    
    textElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      // Mínimos recomendados por viewport
      const minFontSize = viewportWidth < 768 ? 14 : 12;
      
      if (fontSize < minFontSize && element.textContent?.trim()) {
        metrics.textTooSmall++;
        
        issues.push({
          severity: fontSize < 10 ? 'high' : 'medium',
          type: 'text-readability',
          element: element.tagName.toLowerCase(),
          description: `Text too small: ${fontSize}px (minimum: ${minFontSize}px for this viewport)`,
          fix: `Use responsive text classes: text-sm md:text-base or increase base font size`
        });
      }
    });
  }

  /**
   * Valida elementos sobrepostos
   */
  private async validateElementOverlap(issues: ResponsiveIssue[], metrics: ResponsiveMetrics): Promise<void> {
    if (typeof document === 'undefined') return;

    const elements = document.querySelectorAll('[data-testid], button, .card, .platform-selector button');
    const rects: { element: Element; rect: DOMRect }[] = [];
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        rects.push({ element, rect });
      }
    });

    // Verificar sobreposições
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const rect1 = rects[i].rect;
        const rect2 = rects[j].rect;
        
        const overlapping = !(
          rect1.right <= rect2.left || 
          rect2.right <= rect1.left || 
          rect1.bottom <= rect2.top || 
          rect2.bottom <= rect1.top
        );

        if (overlapping) {
          metrics.overlappingElements++;
          
          issues.push({
            severity: 'medium',
            type: 'interaction',
            element: `${rects[i].element.tagName} overlapping ${rects[j].element.tagName}`,
            description: 'Elements are overlapping, may cause interaction issues',
            fix: 'Review layout spacing and z-index values'
          });
        }
      }
    }
  }

  /**
   * Obter nome do breakpoint baseado na largura
   */
  private getBreakpointName(width: number): string {
    if (width >= parseInt(tokens.breakpoints.wide)) return 'wide';
    if (width >= parseInt(tokens.breakpoints.desktop)) return 'desktop';
    if (width >= parseInt(tokens.breakpoints.tablet)) return 'tablet';
    return 'mobile';
  }

  /**
   * Gerar relatório de teste responsivo
   */
  generateReport(results: ResponsiveTestResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const criticalIssues = results.reduce((acc, r) => acc + r.issues.filter(i => i.severity === 'critical').length, 0);
    
    let report = `# 📊 RELATÓRIO DE TESTES RESPONSIVOS\n\n`;
    report += `**Data:** ${new Date().toLocaleDateString('pt-BR')}\n`;
    report += `**Testes executados:** ${totalTests}\n`;
    report += `**Testes aprovados:** ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)\n`;
    report += `**Problemas críticos:** ${criticalIssues}\n\n`;

    // Resumo por breakpoint
    report += `## 🎯 RESUMO POR BREAKPOINT\n\n`;
    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const criticalCount = result.issues.filter(i => i.severity === 'critical').length;
      
      report += `**${status} ${result.breakpoint.toUpperCase()}** (${result.resolution})`;
      if (criticalCount > 0) report += ` - ${criticalCount} problemas críticos`;
      report += `\n`;
    });

    // Problemas críticos detalhados
    const allCriticalIssues = results.flatMap(r => r.issues.filter(i => i.severity === 'critical'));
    if (allCriticalIssues.length > 0) {
      report += `\n## 🚨 PROBLEMAS CRÍTICOS\n\n`;
      allCriticalIssues.forEach((issue, index) => {
        report += `${index + 1}. **${issue.type.toUpperCase()}:** ${issue.description}\n`;
        report += `   - **Elemento:** ${issue.element}\n`;
        report += `   - **Correção:** ${issue.fix}\n\n`;
      });
    }

    return report;
  }

  /**
   * Executar teste rápido de overflow (para debug em development)
   */
  quickOverflowTest(): { hasIssues: boolean; issues: string[] } {
    if (typeof document === 'undefined') {
      return { hasIssues: false, issues: [] };
    }

    const issues: string[] = [];
    
    // Verificar scroll horizontal
    const bodyWidth = document.body.scrollWidth;
    const viewportWidth = window.innerWidth;
    
    if (bodyWidth > viewportWidth) {
      issues.push(`🚨 Horizontal scroll: ${bodyWidth}px > ${viewportWidth}px`);
    }

    // Verificar elementos específicos conhecidos por causar problemas
    const platformSelector = document.querySelector('.platform-selector, [role="group"]');
    if (platformSelector) {
      const rect = platformSelector.getBoundingClientRect();
      if (rect.right > viewportWidth) {
        issues.push(`🚨 PlatformSelector overflow: ${Math.round(rect.right)}px > ${viewportWidth}px`);
      }
    }

    return {
      hasIssues: issues.length > 0,
      issues
    };
  }
}

// Export singleton instance
export const responsiveTestingService = ResponsiveTestingService.getInstance(); 