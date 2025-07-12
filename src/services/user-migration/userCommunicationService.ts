/**
 * 📢 User Communication Service - Migration Communication
 * 
 * Manages all user communication during migration process
 * Ensures users are informed and comfortable with changes
 * 
 * Part of: PRE-WEEK 0 - IA Beta Migration Framework Development
 * Integration: Alpha cost notifications + Charlie satisfaction tracking
 */

export interface CommunicationTemplate {
  id: string;
  type: 'email' | 'in-app' | 'push' | 'modal' | 'toast';
  subject?: string;
  title: string;
  content: string;
  cta?: {
    text: string;
    action: string;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  costTierSpecific?: 'free' | 'premium' | 'all'; // Alpha integration
  triggers: string[];
}

export interface UserCommunicationPreferences {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  languages: string[];
  timezone: string;
}

export interface CommunicationLog {
  id: string;
  userId: string;
  templateId: string;
  sentAt: Date;
  status: 'sent' | 'delivered' | 'read' | 'clicked' | 'dismissed';
  channel: string;
  response?: string;
  satisfactionRating?: number;
}

class UserCommunicationService {
  private templates: Map<string, CommunicationTemplate> = new Map();
  private userPreferences: Map<string, UserCommunicationPreferences> = new Map();
  private communicationLogs: CommunicationLog[] = [];

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * 🚀 Prepare communication templates for migration
   */
  async prepareTemplates(): Promise<void> {
    try {
      console.log('📢 Preparing user communication templates...');
      
      // Migration announcement templates
      await this.setupMigrationAnnouncements();
      
      // Feature introduction templates
      await this.setupFeatureIntroductions();
      
      // Help and support templates
      await this.setupHelpTemplates();
      
      // Cost tier notification templates (Alpha integration)
      await this.setupCostTierTemplates();
      
      // Satisfaction survey templates (Charlie integration)
      await this.setupSatisfactionTemplates();
      
      console.log('✅ Communication templates prepared');
      
    } catch (error) {
      console.error('❌ Template preparation failed:', error);
      throw error;
    }
  }

  /**
   * 📨 Notify user about migration changes
   */
  async notifyUserOfChanges(
    userId: string, 
    migrationState: any
  ): Promise<boolean> {
    try {
      console.log(`📨 Notifying user ${userId} about migration changes`);
      
      const userPrefs = await this.getUserPreferences(userId);
      const communications: CommunicationTemplate[] = [];

      // Welcome to new experience
      if (migrationState.migrationStatus === 'in-progress') {
        communications.push(this.templates.get('migration-welcome')!);
      }

      // Feature introductions based on enabled features
      for (const [feature, enabled] of Object.entries(migrationState.featureFlags)) {
        if (enabled && this.hasFeatureIntroTemplate(feature)) {
          communications.push(this.templates.get(`feature-intro-${feature}`)!);
        }
      }

      // Cost tier specific communications (Alpha integration)
      if (migrationState.costTier) {
        const costTemplate = this.templates.get(`cost-tier-${migrationState.costTier}`);
        if (costTemplate) communications.push(costTemplate);
      }

      // Send communications based on user preferences
      for (const template of communications) {
        await this.sendCommunication(userId, template, userPrefs);
      }

      // Schedule follow-up satisfaction survey (Charlie integration)
      await this.scheduleSatisfactionSurvey(userId, 24); // 24 hours after migration

      console.log(`✅ Migration notifications sent to user ${userId}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to notify user ${userId}:`, error);
      return false;
    }
  }

  /**
   * 🎯 Send targeted communication to user
   */
  async sendCommunication(
    userId: string,
    template: CommunicationTemplate,
    preferences: UserCommunicationPreferences
  ): Promise<boolean> {
    try {
      // Check user preferences
      if (!this.shouldSendCommunication(template, preferences)) {
        console.log(`🚫 Communication blocked by user preferences: ${template.id}`);
        return false;
      }

      const log: CommunicationLog = {
        id: this.generateId(),
        userId,
        templateId: template.id,
        sentAt: new Date(),
        status: 'sent',
        channel: template.type
      };

      // Send via preferred channels
      switch (template.type) {
        case 'email':
          if (preferences.emailEnabled) {
            await this.sendEmail(userId, template);
            log.status = 'delivered';
          }
          break;
          
        case 'in-app':
          if (preferences.inAppEnabled) {
            await this.sendInAppNotification(userId, template);
            log.status = 'delivered';
          }
          break;
          
        case 'modal':
          await this.showModal(userId, template);
          log.status = 'delivered';
          break;
          
        case 'toast':
          await this.showToast(userId, template);
          log.status = 'delivered';
          break;
          
        case 'push':
          if (preferences.pushEnabled) {
            await this.sendPushNotification(userId, template);
            log.status = 'delivered';
          }
          break;
      }

      this.communicationLogs.push(log);
      
      // Report to Charlie monitoring
      await this.reportCommunicationSent(userId, template.id);

      console.log(`📤 Communication sent: ${template.id} to user ${userId}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to send communication ${template.id} to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * 🔄 Announce system improvements
   */
  async announceSystemImprovements(userIds: string[]): Promise<void> {
    try {
      console.log(`📢 Announcing system improvements to ${userIds.length} users`);
      
      const template = this.templates.get('system-improvements');
      if (!template) {
        throw new Error('System improvements template not found');
      }

      for (const userId of userIds) {
        const preferences = await this.getUserPreferences(userId);
        await this.sendCommunication(userId, template, preferences);
        
        // Small delay to avoid overwhelming the system
        await this.wait(100);
      }
      
      console.log('✅ System improvement announcements completed');
      
    } catch (error) {
      console.error('❌ System improvement announcements failed:', error);
      throw error;
    }
  }

  /**
   * 💰 Send cost tier notifications (Alpha integration)
   */
  async sendCostTierNotification(
    userId: string,
    currentTier: 'free' | 'premium',
    usage: { current: number; limit: number }
  ): Promise<void> {
    try {
      const template = this.getCostTierTemplate(currentTier, usage);
      const preferences = await this.getUserPreferences(userId);
      
      await this.sendCommunication(userId, template, preferences);
      
      // Report to Alpha cost management
      await this.reportCostNotificationSent(userId, currentTier, usage);
      
      console.log(`💰 Cost tier notification sent to user ${userId}`);
      
    } catch (error) {
      console.error(`❌ Cost tier notification failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 📊 Request user satisfaction feedback (Charlie integration)
   */
  async requestSatisfactionFeedback(userId: string): Promise<void> {
    try {
      const template = this.templates.get('satisfaction-survey');
      if (!template) {
        throw new Error('Satisfaction survey template not found');
      }

      const preferences = await this.getUserPreferences(userId);
      await this.sendCommunication(userId, template, preferences);
      
      // Report to Charlie monitoring
      await this.reportSatisfactionSurveyRequested(userId);
      
      console.log(`📊 Satisfaction survey sent to user ${userId}`);
      
    } catch (error) {
      console.error(`❌ Satisfaction survey failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 📈 Process user feedback response
   */
  async processFeedbackResponse(
    userId: string,
    templateId: string,
    response: string,
    rating?: number
  ): Promise<void> {
    try {
      // Find the communication log
      const log = this.communicationLogs.find(
        l => l.userId === userId && l.templateId === templateId
      );
      
      if (log) {
        log.response = response;
        log.satisfactionRating = rating;
        log.status = 'read';
      }

      // Process satisfaction feedback
      if (templateId === 'satisfaction-survey' && rating !== undefined) {
        await this.processSatisfactionRating(userId, rating);
      }

      // Report to Charlie monitoring
      await this.reportFeedbackReceived(userId, templateId, response, rating);
      
      console.log(`📝 Feedback processed for user ${userId}`);
      
    } catch (error) {
      console.error(`❌ Feedback processing failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 📊 Get communication analytics
   */
  async getCommunicationAnalytics(): Promise<any> {
    const analytics = {
      totalCommunications: this.communicationLogs.length,
      deliveryRate: 0,
      readRate: 0,
      responseRate: 0,
      satisfactionAverage: 0,
      channelPerformance: {} as Record<string, number>,
      templatePerformance: {} as Record<string, number>
    };

    const delivered = this.communicationLogs.filter(l => l.status === 'delivered').length;
    const read = this.communicationLogs.filter(l => l.status === 'read').length;
    const responded = this.communicationLogs.filter(l => l.response).length;

    analytics.deliveryRate = (delivered / analytics.totalCommunications) * 100;
    analytics.readRate = (read / analytics.totalCommunications) * 100;
    analytics.responseRate = (responded / analytics.totalCommunications) * 100;

    // Calculate satisfaction average
    const satisfactionRatings = this.communicationLogs
      .filter(l => l.satisfactionRating !== undefined)
      .map(l => l.satisfactionRating!);
    
    analytics.satisfactionAverage = satisfactionRatings.length > 0
      ? satisfactionRatings.reduce((a, b) => a + b, 0) / satisfactionRatings.length
      : 0;

    // Report to Charlie monitoring
    await this.reportCommunicationAnalytics(analytics);

    return analytics;
  }

  // Helper methods
  private initializeDefaultTemplates(): void {
    // Migration welcome template
    this.templates.set('migration-welcome', {
      id: 'migration-welcome',
      type: 'modal',
      title: '🎉 Bem-vindo à Nova Experiência!',
      content: `Estamos atualizando sua experiência para torná-la ainda melhor! 
      
      ✨ Design mais moderno e intuitivo
      🚀 Performance aprimorada
      🎯 Funcionalidades personalizadas
      
      Todos os seus dados estão seguros e você pode continuar usando normalmente.`,
      cta: {
        text: 'Explorar Novidades',
        action: 'explore-features'
      },
      priority: 'high',
      costTierSpecific: 'all',
      triggers: ['migration-start']
    });

    // Feature introduction template
    this.templates.set('feature-intro-enhanced-idea-bank', {
      id: 'feature-intro-enhanced-idea-bank',
      type: 'toast',
      title: '🎯 Banco de Ideias Aprimorado',
      content: 'Agora com personalização inteligente e sugestões ainda mais precisas!',
      cta: {
        text: 'Experimentar',
        action: 'try-enhanced-ideas'
      },
      priority: 'medium',
      costTierSpecific: 'all',
      triggers: ['feature-enabled-enhanced-idea-bank']
    });

    // System improvements template
    this.templates.set('system-improvements', {
      id: 'system-improvements',
      type: 'in-app',
      title: '⚡ Melhorias no Sistema',
      content: `Implementamos várias melhorias baseadas no seu feedback:
      
      • Interface mais rápida e responsiva
      • Melhor organização das funcionalidades
      • Maior precisão nas sugestões de ideias`,
      priority: 'medium',
      costTierSpecific: 'all',
      triggers: ['system-update']
    });

    // Satisfaction survey template
    this.templates.set('satisfaction-survey', {
      id: 'satisfaction-survey',
      type: 'modal',
      title: '📊 Como está sua experiência?',
      content: `Gostaríamos de saber como você está se sentindo com as novidades!
      
      Sua opinião é muito importante para continuarmos melhorando.`,
      cta: {
        text: 'Avaliar Experiência',
        action: 'rate-experience'
      },
      priority: 'medium',
      costTierSpecific: 'all',
      triggers: ['satisfaction-request']
    });
  }

  private async setupMigrationAnnouncements(): Promise<void> {
    console.log('📢 Setting up migration announcement templates');
  }

  private async setupFeatureIntroductions(): Promise<void> {
    console.log('🎯 Setting up feature introduction templates');
  }

  private async setupHelpTemplates(): Promise<void> {
    console.log('❓ Setting up help and support templates');
  }

  private async setupCostTierTemplates(): Promise<void> {
    // Alpha integration - cost tier specific templates
    this.templates.set('cost-tier-free', {
      id: 'cost-tier-free',
      type: 'in-app',
      title: '💡 Plano Gratuito Ativo',
      content: 'Você tem 5 ideias por dia. Para mais ideias, considere o plano premium!',
      cta: {
        text: 'Ver Planos',
        action: 'view-plans'
      },
      priority: 'low',
      costTierSpecific: 'free',
      triggers: ['tier-notification']
    });

    this.templates.set('cost-tier-premium', {
      id: 'cost-tier-premium', 
      type: 'in-app',
      title: '⭐ Plano Premium Ativo',
      content: 'Aproveite suas 15 ideias por dia e todas as funcionalidades exclusivas!',
      priority: 'low',
      costTierSpecific: 'premium',
      triggers: ['tier-notification']
    });
  }

  private async setupSatisfactionTemplates(): Promise<void> {
    console.log('📊 Setting up satisfaction survey templates');
  }

  private async getUserPreferences(userId: string): Promise<UserCommunicationPreferences> {
    let preferences = this.userPreferences.get(userId);
    
    if (!preferences) {
      preferences = {
        userId,
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        frequency: 'immediate',
        languages: ['pt-BR'],
        timezone: 'America/Sao_Paulo'
      };
      this.userPreferences.set(userId, preferences);
    }
    
    return preferences;
  }

  private hasFeatureIntroTemplate(feature: string): boolean {
    return this.templates.has(`feature-intro-${feature}`);
  }

  private shouldSendCommunication(
    template: CommunicationTemplate,
    preferences: UserCommunicationPreferences
  ): boolean {
    // Check channel preferences
    switch (template.type) {
      case 'email':
        return preferences.emailEnabled;
      case 'push':
        return preferences.pushEnabled;
      case 'in-app':
      case 'modal':
      case 'toast':
        return preferences.inAppEnabled;
      default:
        return true;
    }
  }

  private async sendEmail(userId: string, template: CommunicationTemplate): Promise<void> {
    console.log(`📧 Email sent to user ${userId}: ${template.title}`);
  }

  private async sendInAppNotification(userId: string, template: CommunicationTemplate): Promise<void> {
    console.log(`📱 In-app notification sent to user ${userId}: ${template.title}`);
  }

  private async showModal(userId: string, template: CommunicationTemplate): Promise<void> {
    console.log(`🪟 Modal shown to user ${userId}: ${template.title}`);
  }

  private async showToast(userId: string, template: CommunicationTemplate): Promise<void> {
    console.log(`🍞 Toast shown to user ${userId}: ${template.title}`);
  }

  private async sendPushNotification(userId: string, template: CommunicationTemplate): Promise<void> {
    console.log(`🔔 Push notification sent to user ${userId}: ${template.title}`);
  }

  private getCostTierTemplate(tier: 'free' | 'premium', usage: any): CommunicationTemplate {
    const baseTemplate = this.templates.get(`cost-tier-${tier}`)!;
    
    // Customize content based on usage
    const usagePercentage = (usage.current / usage.limit) * 100;
    
    if (usagePercentage > 80) {
      return {
        ...baseTemplate,
        content: `Você usou ${usage.current} de ${usage.limit} ideias hoje (${usagePercentage.toFixed(1)}%). ${baseTemplate.content}`,
        priority: 'medium' as const
      };
    }
    
    return baseTemplate;
  }

  private async scheduleSatisfactionSurvey(userId: string, delayHours: number): Promise<void> {
    console.log(`⏰ Satisfaction survey scheduled for user ${userId} in ${delayHours} hours`);
  }

  private async processSatisfactionRating(userId: string, rating: number): Promise<void> {
    // Charlie monitoring integration
    console.log(`📊 Satisfaction rating processed: ${userId} - ${rating}/5`);
  }

  private generateId(): string {
    return `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Integration reporting methods
  private async reportCommunicationSent(userId: string, templateId: string): Promise<void> {
    console.log(`📊 Communication report: ${userId} - ${templateId}`);
  }

  private async reportCostNotificationSent(userId: string, tier: string, usage: any): Promise<void> {
    console.log(`💰 Cost notification report: ${userId} - ${tier} - ${usage.current}/${usage.limit}`);
  }

  private async reportSatisfactionSurveyRequested(userId: string): Promise<void> {
    console.log(`📊 Satisfaction survey report: ${userId}`);
  }

  private async reportFeedbackReceived(userId: string, templateId: string, response: string, rating?: number): Promise<void> {
    console.log(`📝 Feedback report: ${userId} - ${templateId} - ${rating || 'no rating'}`);
  }

  private async reportCommunicationAnalytics(analytics: any): Promise<void> {
    console.log('📈 Communication analytics reported:', analytics);
  }
}

export { UserCommunicationService }; 