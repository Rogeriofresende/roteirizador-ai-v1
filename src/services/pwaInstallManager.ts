/**
 * 📱 PWA INSTALL MANAGER
 * Week 7 Day 5: Advanced PWA installation with user engagement and analytics
 */

import { logger } from '../utils/logger';
import { analyticsService } from './analyticsService';
import { performanceService } from './performance';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallPromptConfig {
  showDelay: number; // milliseconds
  sessionThreshold: number; // number of sessions
  engagementThreshold: number; // seconds on site
  dismissalCooldown: number; // hours
  maxPrompts: number; // max prompts per user
}

interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  supportsPush: boolean;
  supportsBackgroundSync: boolean;
  supportsServiceWorker: boolean;
}

interface InstallMetrics {
  promptsShown: number;
  promptsAccepted: number;
  promptsDismissed: number;
  installsCompleted: number;
  uninstallsDetected: number;
  engagementScore: number;
}

// =============================================================================
// PWA INSTALL MANAGER
// =============================================================================

export class PWAInstallManager {
  private static deferredPrompt: BeforeInstallPromptEvent | null = null;
  private static installPromptConfig: InstallPromptConfig = {
    showDelay: 30000, // 30 seconds
    sessionThreshold: 3, // 3 sessions
    engagementThreshold: 120, // 2 minutes
    dismissalCooldown: 24, // 24 hours
    maxPrompts: 3 // max 3 prompts
  };
  
  private static capabilities: PWACapabilities = {
    isInstallable: false,
    isInstalled: false,
    isStandalone: false,
    supportsPush: false,
    supportsBackgroundSync: false,
    supportsServiceWorker: false
  };
  
  private static metrics: InstallMetrics = {
    promptsShown: 0,
    promptsAccepted: 0,
    promptsDismissed: 0,
    installsCompleted: 0,
    uninstallsDetected: 0,
    engagementScore: 0
  };
  
  private static isInitialized = false;
  private static engagementStartTime = Date.now();

  static async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Skip PWA initialization in development mode
      if (import.meta.env.DEV) {
        logger.info('PWA initialization skipped in development mode', {}, 'PWA');
        this.isInitialized = true;
        return true;
      }

      // Detect PWA capabilities
      this.detectCapabilities();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Load stored metrics
      this.loadStoredMetrics();
      
      // Start engagement tracking
      this.startEngagementTracking();
      
      // Check if should show install prompt
      this.scheduleInstallPrompt();
      
      this.isInitialized = true;
      
      logger.info('PWA Install Manager initialized', {
        capabilities: this.capabilities,
        metrics: this.metrics
      }, 'PWA_INSTALL');

      return true;
    } catch (error) {
      logger.error('Failed to initialize PWA Install Manager', { error }, 'PWA_INSTALL');
      return false;
    }
  }

  private static detectCapabilities(): void {
    // Service Worker support
    this.capabilities.supportsServiceWorker = 'serviceWorker' in navigator;
    
    // Check if app is installed (standalone mode)
    this.capabilities.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                                    (window.navigator as any).standalone === true;
    
    // Check if already installed
    this.capabilities.isInstalled = this.capabilities.isStandalone;
    
    // Push notifications support
    this.capabilities.supportsPush = 'PushManager' in window && 'serviceWorker' in navigator;
    
    // Background sync support
    this.capabilities.supportsBackgroundSync = 'serviceWorker' in navigator && 
                                              'sync' in window.ServiceWorkerRegistration.prototype;
    
    logger.debug('PWA capabilities detected', this.capabilities, 'PWA_INSTALL');
  }

  private static setupEventListeners(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.capabilities.isInstallable = true;
      
      logger.info('Install prompt available', {}, 'PWA_INSTALL');
      
      analyticsService.trackEvent('pwa_install_prompt_available', {
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      });
    });

    // Listen for app installation
    window.addEventListener('appinstalled', (e: Event) => {
      this.metrics.installsCompleted++;
      this.capabilities.isInstalled = true;
      this.saveMetrics();
      
      logger.info('PWA installed successfully', {}, 'PWA_INSTALL');
      
      analyticsService.trackEvent('pwa_installed', {
        installMethod: 'user_prompted',
        timestamp: Date.now()
      });
      
      // Show thank you message
      this.showInstallSuccessMessage();
    });

    // Detect uninstall (when app goes from standalone to browser)
    if (this.capabilities.isStandalone) {
      window.addEventListener('beforeunload', () => {
        if (!window.matchMedia('(display-mode: standalone)').matches) {
          this.metrics.uninstallsDetected++;
          this.saveMetrics();
          
          analyticsService.trackEvent('pwa_uninstalled', {
            timestamp: Date.now()
          });
        }
      });
    }

    // Track display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', (e) => {
      this.capabilities.isStandalone = e.matches;
      this.capabilities.isInstalled = e.matches;
      
      analyticsService.trackEvent('pwa_display_mode_changed', {
        isStandalone: e.matches,
        timestamp: Date.now()
      });
    });
  }

  private static loadStoredMetrics(): void {
    try {
      const stored = localStorage.getItem('pwa_install_metrics');
      if (stored) {
        this.metrics = { ...this.metrics, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.warn('Failed to load stored PWA metrics', { error }, 'PWA_INSTALL');
    }
  }

  private static saveMetrics(): void {
    try {
      localStorage.setItem('pwa_install_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      logger.warn('Failed to save PWA metrics', { error }, 'PWA_INSTALL');
    }
  }

  private static startEngagementTracking(): void {
    this.engagementStartTime = Date.now();
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.updateEngagementScore();
      } else {
        this.engagementStartTime = Date.now();
      }
    });
    
    // Track engagement on page unload
    window.addEventListener('beforeunload', () => {
      this.updateEngagementScore();
    });
  }

  private static updateEngagementScore(): void {
    const sessionTime = Date.now() - this.engagementStartTime;
    const sessionMinutes = sessionTime / (1000 * 60);
    
    // Update engagement score (weighted average)
    this.metrics.engagementScore = (this.metrics.engagementScore * 0.8) + (sessionMinutes * 0.2);
    
    this.saveMetrics();
  }

  private static scheduleInstallPrompt(): void {
    // Don't show if already installed or not installable
    if (this.capabilities.isInstalled || !this.capabilities.isInstallable) {
      return;
    }
    
    // Check if should show prompt based on criteria
    setTimeout(() => {
      this.checkAndShowInstallPrompt();
    }, this.installPromptConfig.showDelay);
  }

  private static checkAndShowInstallPrompt(): void {
    // Check all criteria
    if (!this.shouldShowInstallPrompt()) {
      return;
    }
    
    this.showInstallPrompt();
  }

  private static shouldShowInstallPrompt(): boolean {
    // Already installed
    if (this.capabilities.isInstalled) {
      return false;
    }
    
    // Not installable
    if (!this.capabilities.isInstallable || !this.deferredPrompt) {
      return false;
    }
    
    // Too many prompts shown
    if (this.metrics.promptsShown >= this.installPromptConfig.maxPrompts) {
      return false;
    }
    
    // Check dismissal cooldown
    const lastDismissal = localStorage.getItem('pwa_last_dismissal');
    if (lastDismissal) {
      const hoursSinceLastDismissal = (Date.now() - parseInt(lastDismissal)) / (1000 * 60 * 60);
      if (hoursSinceLastDismissal < this.installPromptConfig.dismissalCooldown) {
        return false;
      }
    }
    
    // Check engagement criteria
    this.updateEngagementScore();
    if (this.metrics.engagementScore < this.installPromptConfig.engagementThreshold / 60) {
      return false;
    }
    
    return true;
  }

  /**
   * Show install prompt to user
   */
  static async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      logger.warn('No install prompt available', {}, 'PWA_INSTALL');
      return false;
    }

    try {
      this.metrics.promptsShown++;
      this.saveMetrics();
      
      // Show the prompt
      await this.deferredPrompt.prompt();
      
      // Wait for user choice
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.metrics.promptsAccepted++;
        
        logger.info('User accepted install prompt', {
          platform: choiceResult.platform
        }, 'PWA_INSTALL');
        
        analyticsService.trackEvent('pwa_install_prompt_accepted', {
          platform: choiceResult.platform,
          promptNumber: this.metrics.promptsShown
        });
        
        return true;
      } else {
        this.metrics.promptsDismissed++;
        localStorage.setItem('pwa_last_dismissal', Date.now().toString());
        
        logger.info('User dismissed install prompt', {}, 'PWA_INSTALL');
        
        analyticsService.trackEvent('pwa_install_prompt_dismissed', {
          promptNumber: this.metrics.promptsShown
        });
        
        return false;
      }
    } catch (error) {
      logger.error('Failed to show install prompt', { error }, 'PWA_INSTALL');
      return false;
    } finally {
      this.deferredPrompt = null;
      this.saveMetrics();
    }
  }

  /**
   * Force show install prompt (for button clicks)
   */
  static async forceShowInstallPrompt(): Promise<boolean> {
    if (!this.capabilities.isInstallable) {
      this.showInstallInstructions();
      return false;
    }
    
    return this.showInstallPrompt();
  }

  /**
   * Show manual install instructions for unsupported browsers
   */
  static showInstallInstructions(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';
    
    if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
      instructions = 'Para instalar: toque em ⎘ (Compartilhar) e selecione "Adicionar à Tela de Início"';
    } else if (userAgent.includes('android')) {
      instructions = 'Para instalar: toque no menu (⋮) e selecione "Adicionar à tela inicial"';
    } else {
      instructions = 'Para instalar: clique no ícone de instalação na barra de endereços do seu navegador';
    }
    
    // Show instructions (this would typically be a toast or modal)
    console.log(instructions);
    
    analyticsService.trackEvent('pwa_install_instructions_shown', {
      userAgent: navigator.userAgent,
      instructions
    });
  }

  private static showInstallSuccessMessage(): void {
    // Show success message (this would typically be a toast notification)
    console.log('PWA instalado com sucesso! Agora você pode acessar o Roteirar IA diretamente da sua tela inicial.');
    
    // Show welcome screen for first-time install
    setTimeout(() => {
      this.showWelcomeScreen();
    }, 1000);
  }

  private static showWelcomeScreen(): void {
    // Show welcome screen for new PWA users
    console.log('Bem-vindo ao Roteirar IA! Explore as funcionalidades offline e receba notificações importantes.');
  }

  /**
   * Get PWA capabilities
   */
  static getCapabilities(): PWACapabilities {
    return { ...this.capabilities };
  }

  /**
   * Get install metrics
   */
  static getMetrics(): InstallMetrics {
    this.updateEngagementScore();
    return { ...this.metrics };
  }

  /**
   * Check if app is installed
   */
  static isInstalled(): boolean {
    return this.capabilities.isInstalled;
  }

  /**
   * Check if app can be installed
   */
  static canInstall(): boolean {
    return this.capabilities.isInstallable && !this.capabilities.isInstalled;
  }

  /**
   * Get installation readiness score (0-100)
   */
  static getInstallReadinessScore(): number {
    let score = 0;
    
    // Base capability score (40 points)
    if (this.capabilities.supportsServiceWorker) score += 10;
    if (this.capabilities.supportsPush) score += 10;
    if (this.capabilities.supportsBackgroundSync) score += 10;
    if (this.capabilities.isInstallable) score += 10;
    
    // Engagement score (40 points)
    const engagementPoints = Math.min(40, this.metrics.engagementScore * 10);
    score += engagementPoints;
    
    // User behavior score (20 points)
    if (this.metrics.promptsDismissed === 0) score += 10;
    if (this.metrics.promptsShown < this.installPromptConfig.maxPrompts) score += 10;
    
    return Math.round(score);
  }

  static cleanup(): void {
    this.updateEngagementScore();
    this.saveMetrics();
    this.isInitialized = false;
  }
}