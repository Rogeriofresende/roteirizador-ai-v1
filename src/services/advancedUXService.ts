/**
 * 🎨 ADVANCED UX SERVICE
 * Week 7 Day 5: Advanced UX patterns with adaptive design, contextual interfaces, and intelligent user flows
 */

import { logger } from '../utils/logger';
import { performanceService } from './performance';
import { analyticsService } from './analyticsService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface UXPreferences {
  theme: 'light' | 'dark' | 'auto';
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
  colorScheme: 'default' | 'colorblind' | 'custom';
  animations: 'none' | 'reduced' | 'full';
  contextualHelp: boolean;
}

interface UserContext {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  connectionSpeed: 'slow' | 'medium' | 'fast';
  batteryLevel?: number;
  screenSize: 'small' | 'medium' | 'large';
  inputMethod: 'touch' | 'mouse' | 'keyboard';
  capabilities: Set<string>;
}

interface AdaptiveLayout {
  breakpoints: Record<string, number>;
  gridColumns: Record<string, number>;
  spacing: Record<string, number>;
  typography: Record<string, any>;
  components: Record<string, any>;
}

interface UXMetrics {
  interactionLatency: number;
  visualStability: number;
  taskCompletionRate: number;
  errorRate: number;
  userSatisfaction: number;
  accessibilityScore: number;
}

// =============================================================================
// CONTEXT ANALYZER
// =============================================================================

class ContextAnalyzer {
  private userContext: UserContext;
  private metrics: UXMetrics;

  constructor() {
    this.userContext = this.analyzeUserContext();
    this.metrics = this.initializeMetrics();
  }

  private analyzeUserContext(): UserContext {
    const context: UserContext = {
      deviceType: this.detectDeviceType(),
      orientation: this.getOrientation(),
      connectionSpeed: this.analyzeConnectionSpeed(),
      batteryLevel: this.getBatteryLevel(),
      screenSize: this.getScreenSize(),
      inputMethod: this.detectInputMethod(),
      capabilities: this.analyzeCapabilities()
    };

    return context;
  }

  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;

    if (screenWidth < 768) return 'mobile';
    if (screenWidth < 1024) return 'tablet';
    return 'desktop';
  }

  private getOrientation(): 'portrait' | 'landscape' {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  private analyzeConnectionSpeed(): 'slow' | 'medium' | 'fast' {
    const connection = (navigator as any).connection;
    if (!connection) return 'medium';

    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g') return 'medium';
    return 'fast';
  }

  private getBatteryLevel(): number | undefined {
    // Battery API is deprecated, return undefined for now
    return undefined;
  }

  private getScreenSize(): 'small' | 'medium' | 'large' {
    const width = window.innerWidth;
    if (width < 768) return 'small';
    if (width < 1200) return 'medium';
    return 'large';
  }

  private detectInputMethod(): 'touch' | 'mouse' | 'keyboard' {
    if ('ontouchstart' in window) return 'touch';
    if (navigator.maxTouchPoints > 0) return 'touch';
    return 'mouse';
  }

  private analyzeCapabilities(): Set<string> {
    const capabilities = new Set<string>();

    // Animation support
    if ('animate' in document.createElement('div')) {
      capabilities.add('web-animations');
    }

    // Intersection Observer
    if ('IntersectionObserver' in window) {
      capabilities.add('intersection-observer');
    }

    // Vibration API
    if ('vibrate' in navigator) {
      capabilities.add('vibration');
    }

    // Web Share API
    if ('share' in navigator) {
      capabilities.add('web-share');
    }

    // Clipboard API
    if ('clipboard' in navigator) {
      capabilities.add('clipboard');
    }

    return capabilities;
  }

  private initializeMetrics(): UXMetrics {
    return {
      interactionLatency: 0,
      visualStability: 0,
      taskCompletionRate: 0,
      errorRate: 0,
      userSatisfaction: 0,
      accessibilityScore: 0
    };
  }

  getUserContext(): UserContext {
    return { ...this.userContext };
  }

  updateContext(): void {
    this.userContext = this.analyzeUserContext();
    
    performanceService.recordMetric('ux_context_updated', Date.now(), 'timestamp', 'ux_service', {
      deviceType: this.userContext.deviceType,
      screenSize: this.userContext.screenSize,
      inputMethod: this.userContext.inputMethod
    });
  }

  getMetrics(): UXMetrics {
    return { ...this.metrics };
  }

  recordInteraction(latency: number, success: boolean): void {
    this.metrics.interactionLatency = (this.metrics.interactionLatency * 0.9) + (latency * 0.1);
    
    if (success) {
      this.metrics.taskCompletionRate = Math.min(1, this.metrics.taskCompletionRate + 0.01);
    } else {
      this.metrics.errorRate = Math.max(0, this.metrics.errorRate + 0.01);
    }
  }
}

// =============================================================================
// ADAPTIVE LAYOUT MANAGER
// =============================================================================

class AdaptiveLayoutManager {
  private layouts: Map<string, AdaptiveLayout> = new Map();
  private currentLayout: AdaptiveLayout | null = null;
  private observer: ResizeObserver | null = null;

  constructor() {
    this.initializeLayouts();
    this.setupObserver();
  }

  private initializeLayouts(): void {
    // Mobile layout
    this.layouts.set('mobile', {
      breakpoints: { xs: 0, sm: 640 },
      gridColumns: { default: 1, form: 1, list: 1 },
      spacing: { xs: 8, sm: 12, md: 16, lg: 20 },
      typography: {
        h1: { fontSize: '1.5rem', lineHeight: '1.2' },
        h2: { fontSize: '1.25rem', lineHeight: '1.3' },
        body: { fontSize: '0.875rem', lineHeight: '1.4' }
      },
      components: {
        button: { height: 44, fontSize: '0.875rem' },
        input: { height: 40, fontSize: '0.875rem' },
        card: { padding: 12, borderRadius: 8 }
      }
    });

    // Tablet layout
    this.layouts.set('tablet', {
      breakpoints: { sm: 640, md: 768, lg: 1024 },
      gridColumns: { default: 2, form: 2, list: 2 },
      spacing: { xs: 12, sm: 16, md: 20, lg: 24 },
      typography: {
        h1: { fontSize: '2rem', lineHeight: '1.2' },
        h2: { fontSize: '1.5rem', lineHeight: '1.3' },
        body: { fontSize: '1rem', lineHeight: '1.5' }
      },
      components: {
        button: { height: 40, fontSize: '1rem' },
        input: { height: 38, fontSize: '1rem' },
        card: { padding: 16, borderRadius: 10 }
      }
    });

    // Desktop layout
    this.layouts.set('desktop', {
      breakpoints: { lg: 1024, xl: 1280, '2xl': 1536 },
      gridColumns: { default: 3, form: 2, list: 3 },
      spacing: { xs: 16, sm: 20, md: 24, lg: 32 },
      typography: {
        h1: { fontSize: '2.5rem', lineHeight: '1.1' },
        h2: { fontSize: '2rem', lineHeight: '1.2' },
        body: { fontSize: '1rem', lineHeight: '1.6' }
      },
      components: {
        button: { height: 38, fontSize: '1rem' },
        input: { height: 36, fontSize: '1rem' },
        card: { padding: 20, borderRadius: 12 }
      }
    });
  }

  private setupObserver(): void {
    if ('ResizeObserver' in window) {
      this.observer = new ResizeObserver(() => {
        this.updateLayout();
      });
      this.observer.observe(document.body);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', () => {
        this.updateLayout();
      });
    }
  }

  private updateLayout(): void {
    const width = window.innerWidth;
    let layoutType = 'desktop';

    if (width < 768) {
      layoutType = 'mobile';
    } else if (width < 1024) {
      layoutType = 'tablet';
    }

    const newLayout = this.layouts.get(layoutType);
    if (newLayout && newLayout !== this.currentLayout) {
      this.currentLayout = newLayout;
      this.applyLayout(newLayout);
      
      performanceService.recordMetric('layout_change', Date.now(), 'timestamp', 'ux_service', {
        layoutType,
        screenWidth: width
      });
    }
  }

  private applyLayout(layout: AdaptiveLayout): void {
    // Apply CSS custom properties
    const root = document.documentElement;
    
    // Spacing
    Object.entries(layout.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, `${value}px`);
    });

    // Typography
    Object.entries(layout.typography).forEach(([element, styles]) => {
      Object.entries(styles).forEach(([property, value]) => {
        root.style.setProperty(`--${element}-${property}`, value as string);
      });
    });

    // Components
    Object.entries(layout.components).forEach(([component, styles]) => {
      Object.entries(styles).forEach(([property, value]) => {
        root.style.setProperty(`--${component}-${property}`, 
          typeof value === 'number' ? `${value}px` : value as string);
      });
    });

    // Dispatch layout change event
    window.dispatchEvent(new CustomEvent('layoutChange', {
      detail: { layout }
    }));
  }

  getCurrentLayout(): AdaptiveLayout | null {
    return this.currentLayout;
  }

  getLayoutForDevice(deviceType: string): AdaptiveLayout | null {
    return this.layouts.get(deviceType) || null;
  }

  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// =============================================================================
// ACCESSIBILITY ENHANCER
// =============================================================================

class AccessibilityEnhancer {
  private preferences: UXPreferences;
  private focusManager: FocusManager;

  constructor(preferences: UXPreferences) {
    this.preferences = preferences;
    this.focusManager = new FocusManager();
    this.applyAccessibilitySettings();
  }

  private applyAccessibilitySettings(): void {
    const root = document.documentElement;

    // High contrast mode
    if (this.preferences.highContrast) {
      root.classList.add('high-contrast');
    }

    // Reduced motion
    if (this.preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    }

    // Font size
    root.classList.add(`font-size-${this.preferences.fontSize}`);

    // Color scheme
    root.classList.add(`color-scheme-${this.preferences.colorScheme}`);

    // Animations
    root.classList.add(`animations-${this.preferences.animations}`);
  }

  updatePreferences(newPreferences: Partial<UXPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.applyAccessibilitySettings();
    
    analyticsService.trackEvent('accessibility_preferences_updated', {
      preferences: newPreferences
    });
  }

  enhanceFocus(): void {
    this.focusManager.enhanceFocusVisibility();
  }

  announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  getAccessibilityScore(): number {
    // Simple accessibility score calculation
    let score = 100;
    
    // Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    score -= (imagesWithoutAlt.length / images.length) * 10;
    
    // Check for form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.id;
      return !id || !document.querySelector(`label[for="${id}"]`);
    });
    score -= (inputsWithoutLabels.length / inputs.length) * 15;
    
    // Check color contrast (simplified)
    const hasHighContrast = document.documentElement.classList.contains('high-contrast');
    if (!hasHighContrast) score -= 10;
    
    return Math.max(0, score);
  }
}

// Helper class for focus management
class FocusManager {
  private focusedElement: HTMLElement | null = null;
  private focusHistory: HTMLElement[] = [];

  enhanceFocusVisibility(): void {
    const style = document.createElement('style');
    style.textContent = `
      .focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
        border-radius: 4px;
      }
      
      .focus-visible:focus {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    `;
    document.head.appendChild(style);
  }

  storeFocus(): void {
    const focused = document.activeElement as HTMLElement;
    if (focused && focused !== document.body) {
      this.focusedElement = focused;
      this.focusHistory.push(focused);
      
      // Keep history manageable
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }
    }
  }

  restoreFocus(): void {
    if (this.focusedElement && document.contains(this.focusedElement)) {
      this.focusedElement.focus();
    }
  }

  getFocusHistory(): HTMLElement[] {
    return [...this.focusHistory];
  }
}

// =============================================================================
// MAIN ADVANCED UX SERVICE
// =============================================================================

export class AdvancedUXService {
  private static contextAnalyzer: ContextAnalyzer;
  private static layoutManager: AdaptiveLayoutManager;
  private static accessibilityEnhancer: AccessibilityEnhancer;
  private static isInitialized = false;

  static async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Initialize context analyzer
      this.contextAnalyzer = new ContextAnalyzer();
      
      // Initialize layout manager
      this.layoutManager = new AdaptiveLayoutManager();
      
      // Initialize accessibility enhancer with default preferences
      const defaultPreferences: UXPreferences = {
        theme: 'auto',
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        fontSize: 'medium',
        density: 'comfortable',
        colorScheme: 'default',
        animations: 'full',
        contextualHelp: true
      };
      
      this.accessibilityEnhancer = new AccessibilityEnhancer(defaultPreferences);
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      
      logger.info('Advanced UX Service initialized', {
        context: this.contextAnalyzer.getUserContext(),
        layout: this.layoutManager.getCurrentLayout(),
        accessibility: true
      }, 'UX_SERVICE');

      return true;
    } catch (error) {
      logger.error('Failed to initialize Advanced UX Service', { error }, 'UX_SERVICE');
      return false;
    }
  }

  private static setupEventListeners(): void {
    // Window resize
    window.addEventListener('resize', () => {
      this.contextAnalyzer.updateContext();
    });

    // Orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.contextAnalyzer.updateContext();
      }, 100);
    });

    // Focus management
    document.addEventListener('focusin', () => {
      this.accessibilityEnhancer.enhanceFocus();
    });

    // Interaction tracking
    document.addEventListener('click', (event) => {
      const startTime = performance.now();
      requestAnimationFrame(() => {
        const endTime = performance.now();
        this.contextAnalyzer.recordInteraction(endTime - startTime, true);
      });
    });
  }

  /**
   * Get user context information
   */
  static getUserContext(): UserContext {
    this.ensureInitialized();
    return this.contextAnalyzer.getUserContext();
  }

  /**
   * Get current adaptive layout
   */
  static getCurrentLayout(): AdaptiveLayout | null {
    this.ensureInitialized();
    return this.layoutManager.getCurrentLayout();
  }

  /**
   * Update UX preferences
   */
  static updatePreferences(preferences: Partial<UXPreferences>): void {
    this.ensureInitialized();
    this.accessibilityEnhancer.updatePreferences(preferences);
  }

  /**
   * Announce message to screen readers
   */
  static announceToScreenReader(message: string): void {
    this.ensureInitialized();
    this.accessibilityEnhancer.announceToScreenReader(message);
  }

  /**
   * Get comprehensive UX metrics
   */
  static getUXMetrics(): {
    context: UserContext;
    performance: UXMetrics;
    accessibility: number;
  } {
    this.ensureInitialized();
    
    return {
      context: this.contextAnalyzer.getUserContext(),
      performance: this.contextAnalyzer.getMetrics(),
      accessibility: this.accessibilityEnhancer.getAccessibilityScore()
    };
  }

  /**
   * Optimize for current context
   */
  static optimizeForContext(): void {
    this.ensureInitialized();
    
    const context = this.contextAnalyzer.getUserContext();
    
    // Optimize based on connection speed
    if (context.connectionSpeed === 'slow') {
      this.updatePreferences({
        animations: 'reduced',
        density: 'compact'
      });
    }
    
    // Optimize for mobile
    if (context.deviceType === 'mobile') {
      this.updatePreferences({
        density: 'comfortable',
        fontSize: 'medium'
      });
    }
    
    // Optimize for battery
    if (context.batteryLevel && context.batteryLevel < 0.2) {
      this.updatePreferences({
        animations: 'none',
        theme: 'dark'
      });
    }
  }

  private static ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('AdvancedUXService not initialized. Call initialize() first.');
    }
  }

  static cleanup(): void {
    if (this.layoutManager) {
      this.layoutManager.cleanup();
    }
    this.isInitialized = false;
  }
} 