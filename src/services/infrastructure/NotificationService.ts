/**
 * Notification Service Implementation - Week 0 Support Service
 * Infrastructure service for comprehensive notification and communication management
 * Supports Week 1 Banco de Ideias and Week 2 Sistema de Indicação
 * 
 * Features:
 * - Multi-channel notification delivery (in-app, email, push, SMS)
 * - Template-based notification system with personalization
 * - Real-time notification streaming and management
 * - Integration with analytics and user preferences
 * - Notification scheduling and batching
 * - Cost tracking for notification delivery
 */

import { BaseService } from '../../architecture/ServiceArchitecture';
import { ServiceContainer } from '../../architecture/ServiceArchitecture';

// Notification Types and Interfaces
export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'promotion'
  | 'milestone'
  | 'budget_alert'
  | 'tier_upgrade'
  | 'referral_success'
  | 'idea_feedback'
  | 'personalization_update';

export type NotificationChannel = 
  | 'in_app' 
  | 'email' 
  | 'push' 
  | 'sms' 
  | 'webhook'
  | 'slack'
  | 'browser';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationMessage {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  title: string;
  message: string;
  data?: Record<string, any>;
  templateId?: string;
  personalization?: {
    userName?: string;
    userTier?: string;
    customFields?: Record<string, any>;
  };
  scheduling?: {
    sendAt?: Date;
    timezone?: string;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      endDate?: Date;
    };
  };
  delivery: {
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'expired';
    attempts: number;
    lastAttempt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    errorMessage?: string;
  };
  actions?: NotificationAction[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'button' | 'link' | 'dismiss';
  action: string; // URL or action identifier
  style?: 'primary' | 'secondary' | 'danger';
  metadata?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channels: NotificationChannel[];
  subject: string; // For email/push
  title: string;
  message: string;
  htmlContent?: string; // For email
  variables: string[]; // Template variables like {{userName}}
  defaultActions?: NotificationAction[];
  settings: {
    isActive: boolean;
    priority: NotificationPriority;
    allowUserOptOut: boolean;
    batchable: boolean;
    maxRetries: number;
  };
  personalization: {
    enabled: boolean;
    tierSpecific: boolean;
    languageSupport: string[];
  };
  analytics: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    totalSent: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    in_app: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  types: Record<NotificationType, boolean>;
  frequency: {
    immediate: boolean;
    batched: boolean;
    batchFrequency: 'hourly' | 'daily' | 'weekly';
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
  };
  updatedAt: Date;
}

// Request/Response Interfaces
export interface SendNotificationRequest {
  userId: string;
  type: NotificationType;
  channels?: NotificationChannel[];
  title: string;
  message: string;
  data?: Record<string, any>;
  templateId?: string;
  personalization?: Record<string, any>;
  priority?: NotificationPriority;
  actions?: NotificationAction[];
  scheduleFor?: Date;
}

export interface SendNotificationResponse {
  success: boolean;
  notification?: NotificationMessage;
  deliveryStatus?: Record<NotificationChannel, {
    status: 'sent' | 'failed' | 'scheduled';
    message?: string;
  }>;
  cost: number;
  error?: string;
}

export interface BulkNotificationRequest {
  userIds: string[];
  templateId: string;
  personalizationData?: Record<string, Record<string, any>>;
  scheduleFor?: Date;
  batchSize?: number;
}

export interface BulkNotificationResponse {
  success: boolean;
  totalUsers: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  batchId: string;
  estimatedCost: number;
  deliveryReport: Array<{
    userId: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
}

export interface NotificationAnalytics {
  overview: {
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    averageCost: number;
  };
  byType: Record<NotificationType, {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    cost: number;
  }>;
  byChannel: Record<NotificationChannel, {
    sent: number;
    deliveryRate: number;
    openRate: number;
    averageCost: number;
  }>;
  userEngagement: {
    activeUsers: number;
    optOutRate: number;
    preferenceChanges: number;
    averageResponseTime: number;
  };
  performance: {
    averageDeliveryTime: number;
    failureRate: number;
    retryRate: number;
    queueSize: number;
  };
}

export class NotificationService extends BaseService {
  private notifications: Map<string, NotificationMessage> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private userPreferences: Map<string, NotificationPreferences> = new Map();
  private deliveryQueue: NotificationMessage[] = [];
  
  // Real-time notification streams
  private activeStreams: Map<string, any> = new Map(); // userId -> stream
  
  // Service integrations
  private analyticsService: any;
  private userRepository: any;
  
  // Delivery providers (mock implementations)
  private emailProvider: any;
  private pushProvider: any;
  private smsProvider: any;
  
  // Notification analytics
  private analytics: NotificationAnalytics = this.initializeAnalytics();
  
  // Cost tracking
  private readonly NOTIFICATION_COSTS = {
    in_app: 0.0001,
    email: 0.002,
    push: 0.001,
    sms: 0.05,
    webhook: 0.0001,
    slack: 0.001,
    browser: 0.0001
  };

  constructor(container: ServiceContainer) {
    super(container);
  }

  protected async onInitialize(): Promise<void> {
    // Initialize service integrations
    try {
      this.analyticsService = this.container.resolve('AnalyticsService');
      this.userRepository = this.container.resolve('UserRepository');
    } catch (error) {
      console.warn('Some services not available during notification initialization:', error);
    }
    
    // Initialize mock delivery providers
    this.initializeDeliveryProviders();
    
    // Initialize default templates
    await this.initializeDefaultTemplates();
    
    // Start notification processing
    this.startNotificationProcessor();
    
    console.log('✅ NotificationService initialized with multi-channel delivery');
  }

  /**
   * Send single notification to user
   */
  public async sendNotification(request: SendNotificationRequest): Promise<SendNotificationResponse> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(request.userId);
      
      // Filter channels based on user preferences
      const allowedChannels = this.filterChannelsByPreferences(
        request.channels || ['in_app'], 
        preferences,
        request.type
      );
      
      if (allowedChannels.length === 0) {
        return {
          success: false,
          cost: 0,
          error: 'No allowed channels for this user and notification type'
        };
      }
      
      // Check quiet hours
      if (this.isInQuietHours(preferences)) {
        // Schedule for later if not urgent
        if (request.priority !== 'urgent') {
          request.scheduleFor = this.getNextAllowedTime(preferences);
        }
      }
      
      // Create notification
      const notification: NotificationMessage = {
        id: this.generateNotificationId(),
        userId: request.userId,
        type: request.type,
        priority: request.priority || 'normal',
        channels: allowedChannels,
        title: request.title,
        message: request.message,
        data: request.data,
        templateId: request.templateId,
        personalization: request.personalization,
        scheduling: request.scheduleFor ? {
          sendAt: request.scheduleFor
        } : undefined,
        delivery: {
          status: request.scheduleFor ? 'pending' : 'pending',
          attempts: 0
        },
        actions: request.actions || [],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Apply template if specified
      if (request.templateId) {
        await this.applyTemplate(notification, request.templateId);
      }
      
      // Store notification
      this.notifications.set(notification.id, notification);
      
      // Calculate delivery cost
      const cost = this.calculateDeliveryCost(notification);
      
      // Check budget
      const budgetCheck = await this.checkBudget(request.userId, cost);
      if (!budgetCheck) {
        return {
          success: false,
          cost: 0,
          error: 'Budget limit reached for notifications'
        };
      }
      
      // Schedule or send immediately
      if (request.scheduleFor) {
        this.scheduleNotification(notification);
      } else {
        await this.processNotification(notification);
      }
      
      // Record cost
      await this.recordCost(cost, {
        userId: request.userId,
        operation: 'notification_delivery',
        channels: allowedChannels.join(',')
      });
      
      // Track analytics
      await this.trackNotificationSent(notification);
      
      return {
        success: true,
        notification,
        cost
      };
      
    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        cost: 0,
        error: error instanceof Error ? error.message : 'Failed to send notification'
      };
    }
  }

  /**
   * Send bulk notifications using template
   */
  public async sendBulkNotification(request: BulkNotificationRequest): Promise<BulkNotificationResponse> {
    try {
      const template = this.templates.get(request.templateId);
      if (!template) {
        throw new Error(`Template ${request.templateId} not found`);
      }
      
      const batchId = this.generateBatchId();
      const batchSize = request.batchSize || 100;
      const deliveryReport: BulkNotificationResponse['deliveryReport'] = [];
      
      let successfulDeliveries = 0;
      let failedDeliveries = 0;
      let totalCost = 0;
      
      // Process users in batches
      for (let i = 0; i < request.userIds.length; i += batchSize) {
        const batch = request.userIds.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (userId) => {
          try {
            const personalization = request.personalizationData?.[userId] || {};
            
            const result = await this.sendNotification({
              userId,
              type: template.type,
              channels: template.channels,
              title: this.personalizeContent(template.title, personalization),
              message: this.personalizeContent(template.message, personalization),
              templateId: request.templateId,
              personalization,
              priority: template.settings.priority,
              scheduleFor: request.scheduleFor
            });
            
            if (result.success) {
              successfulDeliveries++;
              totalCost += result.cost;
              deliveryReport.push({ userId, status: 'success' });
            } else {
              failedDeliveries++;
              deliveryReport.push({ userId, status: 'failed', error: result.error });
            }
            
          } catch (error) {
            failedDeliveries++;
            deliveryReport.push({ 
              userId, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        });
        
        await Promise.all(batchPromises);
        
        // Small delay between batches to avoid overwhelming the system
        if (i + batchSize < request.userIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return {
        success: true,
        totalUsers: request.userIds.length,
        successfulDeliveries,
        failedDeliveries,
        batchId,
        estimatedCost: totalCost,
        deliveryReport
      };
      
    } catch (error) {
      console.error('Error in bulk notification:', error);
      return {
        success: false,
        totalUsers: request.userIds.length,
        successfulDeliveries: 0,
        failedDeliveries: request.userIds.length,
        batchId: '',
        estimatedCost: 0,
        deliveryReport: request.userIds.map(userId => ({
          userId,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Bulk notification failed'
        }))
      };
    }
  }

  /**
   * Get user notifications with filtering
   */
  public async getUserNotifications(
    userId: string,
    filters?: {
      types?: NotificationType[];
      status?: NotificationMessage['delivery']['status'][];
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    notifications: NotificationMessage[];
    total: number;
    unreadCount: number;
  }> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);
    
    // Apply filters
    let filtered = userNotifications;
    
    if (filters?.types) {
      filtered = filtered.filter(n => filters.types!.includes(n.type));
    }
    
    if (filters?.status) {
      filtered = filtered.filter(n => filters.status!.includes(n.delivery.status));
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply pagination
    const total = filtered.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    const paginated = filtered.slice(offset, offset + limit);
    
    // Count unread
    const unreadCount = userNotifications.filter(n => !n.delivery.readAt).length;
    
    return {
      notifications: paginated,
      total,
      unreadCount
    };
  }

  /**
   * Mark notification as read
   */
  public async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const notification = this.notifications.get(notificationId);
      if (!notification || notification.userId !== userId) {
        return false;
      }
      
      notification.delivery.readAt = new Date();
      notification.updatedAt = new Date();
      
      // Track analytics
      await this.trackNotificationRead(notification);
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Update user notification preferences
   */
  public async updateUserPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const currentPrefs = await this.getUserPreferences(userId);
    
    const updatedPrefs: NotificationPreferences = {
      ...currentPrefs,
      ...preferences,
      userId,
      updatedAt: new Date()
    };
    
    this.userPreferences.set(userId, updatedPrefs);
    
    // Track preference change
    if (this.analyticsService) {
      await this.analyticsService.track({
        userId,
        eventType: 'user_action',
        category: 'user_management',
        action: 'notification_preferences_updated',
        metadata: { changes: Object.keys(preferences) }
      });
    }
    
    return updatedPrefs;
  }

  /**
   * Create notification template
   */
  public async createTemplate(template: Omit<NotificationTemplate, 'id' | 'analytics' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: this.generateTemplateId(),
      analytics: {
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        totalSent: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.templates.set(newTemplate.id, newTemplate);
    
    return newTemplate;
  }

  /**
   * Get notification analytics
   */
  public async getAnalytics(timeRange?: { start: Date; end: Date }): Promise<NotificationAnalytics> {
    // Would calculate real analytics from stored notifications
    // For now, return current analytics state
    return { ...this.analytics };
  }

  /**
   * Start real-time notification stream for user
   */
  public createNotificationStream(userId: string): any {
    // Mock WebSocket/SSE stream implementation
    const stream = {
      id: this.generateStreamId(),
      userId,
      active: true,
      lastHeartbeat: new Date(),
      send: (notification: NotificationMessage) => {
        // Would send real-time notification to client
        console.log(`📱 Real-time notification sent to user ${userId}:`, notification.title);
      },
      close: () => {
        this.activeStreams.delete(userId);
      }
    };
    
    this.activeStreams.set(userId, stream);
    
    return stream;
  }

  /**
   * Health check for notification service
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Check notification queue size
      const queueHealthy = this.deliveryQueue.length < 1000;
      
      // Check active streams
      const streamsHealthy = this.activeStreams.size < 10000;
      
      // Check templates
      const templatesHealthy = this.templates.size > 0;
      
      return queueHealthy && streamsHealthy && templatesHealthy;
    } catch (error) {
      console.error('NotificationService health check failed:', error);
      return false;
    }
  }

  /**
   * Get service metrics
   */
  public getMetrics(): any {
    return {
      notifications: {
        total: this.notifications.size,
        pending: this.deliveryQueue.length,
        templates: this.templates.size,
        activeStreams: this.activeStreams.size
      },
      analytics: this.analytics,
      costs: {
        totalCost: 0, // Would calculate from delivery history
        averageCostPerNotification: 0.002,
        costByChannel: this.NOTIFICATION_COSTS
      },
      performance: {
        averageDeliveryTime: 250, // ms
        successRate: 0.98,
        queueProcessingRate: 100 // notifications per second
      }
    };
  }

  // Private implementation methods
  private async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    if (this.userPreferences.has(userId)) {
      return this.userPreferences.get(userId)!;
    }
    
    // Create default preferences
    const defaultPrefs: NotificationPreferences = {
      userId,
      channels: {
        in_app: true,
        email: true,
        push: true,
        sms: false
      },
      types: {
        info: true,
        success: true,
        warning: true,
        error: true,
        promotion: true,
        milestone: true,
        budget_alert: true,
        tier_upgrade: true,
        referral_success: true,
        idea_feedback: true,
        personalization_update: false
      },
      frequency: {
        immediate: true,
        batched: false,
        batchFrequency: 'daily'
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC'
      },
      updatedAt: new Date()
    };
    
    this.userPreferences.set(userId, defaultPrefs);
    return defaultPrefs;
  }

  private filterChannelsByPreferences(
    channels: NotificationChannel[], 
    preferences: NotificationPreferences,
    type: NotificationType
  ): NotificationChannel[] {
    return channels.filter(channel => {
      // Check if user allows this channel
      if (channel === 'in_app') return preferences.channels.in_app;
      if (channel === 'email') return preferences.channels.email;
      if (channel === 'push') return preferences.channels.push;
      if (channel === 'sms') return preferences.channels.sms;
      
      // Other channels (webhook, slack, browser) are always allowed
      return true;
    }).filter(channel => {
      // Check if user allows this notification type
      return preferences.types[type];
    });
  }

  private isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    
    // Simple time comparison (would implement proper timezone handling)
    return currentTime >= preferences.quietHours.start || currentTime <= preferences.quietHours.end;
  }

  private getNextAllowedTime(preferences: NotificationPreferences): Date {
    // Calculate next time outside quiet hours
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0); // 8 AM next day
    
    return tomorrow;
  }

  private async applyTemplate(notification: NotificationMessage, templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) return;
    
    // Apply template content with personalization
    notification.title = this.personalizeContent(template.title, notification.personalization || {});
    notification.message = this.personalizeContent(template.message, notification.personalization || {});
    notification.actions = template.defaultActions || notification.actions;
    notification.priority = template.settings.priority;
  }

  private personalizeContent(content: string, personalization: Record<string, any>): string {
    let personalized = content;
    
    // Replace template variables
    Object.entries(personalization).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      personalized = personalized.replace(new RegExp(placeholder, 'g'), String(value));
    });
    
    return personalized;
  }

  private calculateDeliveryCost(notification: NotificationMessage): number {
    return notification.channels.reduce((total, channel) => {
      return total + (this.NOTIFICATION_COSTS[channel] || 0.001);
    }, 0);
  }

  private scheduleNotification(notification: NotificationMessage): void {
    // Add to delivery queue with scheduling
    this.deliveryQueue.push(notification);
    
    // Sort queue by send time
    this.deliveryQueue.sort((a, b) => {
      const aTime = a.scheduling?.sendAt?.getTime() || Date.now();
      const bTime = b.scheduling?.sendAt?.getTime() || Date.now();
      return aTime - bTime;
    });
  }

  private async processNotification(notification: NotificationMessage): Promise<void> {
    notification.delivery.status = 'sent';
    notification.delivery.attempts++;
    notification.delivery.lastAttempt = new Date();
    
    // Simulate delivery to each channel
    for (const channel of notification.channels) {
      await this.deliverToChannel(notification, channel);
    }
    
    notification.delivery.deliveredAt = new Date();
    notification.delivery.status = 'delivered';
    notification.updatedAt = new Date();
    
    // Send real-time notification if user has active stream
    const stream = this.activeStreams.get(notification.userId);
    if (stream && notification.channels.includes('in_app')) {
      stream.send(notification);
    }
  }

  private async deliverToChannel(notification: NotificationMessage, channel: NotificationChannel): Promise<void> {
    // Mock delivery implementation
    switch (channel) {
      case 'email':
        console.log(`📧 Email sent: ${notification.title} to user ${notification.userId}`);
        break;
      case 'push':
        console.log(`📱 Push notification sent: ${notification.title} to user ${notification.userId}`);
        break;
      case 'sms':
        console.log(`📱 SMS sent: ${notification.message} to user ${notification.userId}`);
        break;
      case 'in_app':
        console.log(`🔔 In-app notification: ${notification.title} for user ${notification.userId}`);
        break;
      default:
        console.log(`📢 ${channel} notification sent: ${notification.title}`);
    }
  }

  private async trackNotificationSent(notification: NotificationMessage): Promise<void> {
    this.analytics.overview.totalSent++;
    this.analytics.byType[notification.type] = this.analytics.byType[notification.type] || {
      sent: 0, delivered: 0, opened: 0, clicked: 0, cost: 0
    };
    this.analytics.byType[notification.type].sent++;
    
    if (this.analyticsService) {
      await this.analyticsService.track({
        userId: notification.userId,
        eventType: 'system_event',
        category: 'user_management',
        action: 'notification_sent',
        metadata: {
          type: notification.type,
          channels: notification.channels,
          priority: notification.priority
        }
      });
    }
  }

  private async trackNotificationRead(notification: NotificationMessage): Promise<void> {
    this.analytics.byType[notification.type].opened++;
    
    if (this.analyticsService) {
      await this.analyticsService.track({
        userId: notification.userId,
        eventType: 'user_action',
        category: 'user_management',
        action: 'notification_read',
        metadata: {
          notificationId: notification.id,
          type: notification.type,
          timeToRead: Date.now() - notification.createdAt.getTime()
        }
      });
    }
  }

  private startNotificationProcessor(): void {
    // Process scheduled notifications every 10 seconds
    setInterval(async () => {
      const now = Date.now();
      const toProcess = this.deliveryQueue.filter(notification => {
        const sendTime = notification.scheduling?.sendAt?.getTime() || 0;
        return sendTime <= now && notification.delivery.status === 'pending';
      });
      
      for (const notification of toProcess) {
        try {
          await this.processNotification(notification);
          
          // Remove from queue
          const index = this.deliveryQueue.indexOf(notification);
          if (index > -1) {
            this.deliveryQueue.splice(index, 1);
          }
        } catch (error) {
          console.error('Error processing scheduled notification:', error);
          notification.delivery.status = 'failed';
          notification.delivery.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        }
      }
    }, 10000);
  }

  private async initializeDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        name: 'Welcome Message',
        type: 'success' as NotificationType,
        channels: ['in_app', 'email'] as NotificationChannel[],
        subject: 'Welcome to Roteirar.IA!',
        title: 'Welcome {{userName}}! 🎉',
        message: 'Welcome to Roteirar.IA! You\'re now ready to generate amazing ideas with AI-powered personalization.',
        variables: ['userName'],
        settings: {
          isActive: true,
          priority: 'normal' as NotificationPriority,
          allowUserOptOut: false,
          batchable: false,
          maxRetries: 3
        },
        personalization: {
          enabled: true,
          tierSpecific: false,
          languageSupport: ['en', 'pt']
        }
      },
      {
        name: 'Budget Alert',
        type: 'budget_alert' as NotificationType,
        channels: ['in_app', 'email'] as NotificationChannel[],
        subject: 'Budget Alert - {{percentage}}% used',
        title: 'Budget Alert 💰',
        message: 'You\'ve used {{percentage}}% of your daily budget. {{remainingAmount}} remaining today.',
        variables: ['percentage', 'remainingAmount'],
        settings: {
          isActive: true,
          priority: 'high' as NotificationPriority,
          allowUserOptOut: false,
          batchable: false,
          maxRetries: 2
        },
        personalization: {
          enabled: true,
          tierSpecific: true,
          languageSupport: ['en', 'pt']
        }
      },
      {
        name: 'Tier Upgrade',
        type: 'tier_upgrade' as NotificationType,
        channels: ['in_app', 'email'] as NotificationChannel[],
        subject: 'Congratulations! You\'ve been upgraded to {{newTier}}',
        title: 'Tier Upgrade! 🚀',
        message: 'Congratulations {{userName}}! You\'ve been upgraded to {{newTier}} tier. Enjoy your new benefits!',
        variables: ['userName', 'newTier'],
        settings: {
          isActive: true,
          priority: 'high' as NotificationPriority,
          allowUserOptOut: false,
          batchable: false,
          maxRetries: 3
        },
        personalization: {
          enabled: true,
          tierSpecific: true,
          languageSupport: ['en', 'pt']
        }
      }
    ];

    for (const template of defaultTemplates) {
      await this.createTemplate(template);
    }
  }

  private initializeDeliveryProviders(): void {
    // Mock delivery providers
    this.emailProvider = { send: async () => true };
    this.pushProvider = { send: async () => true };
    this.smsProvider = { send: async () => true };
  }

  private initializeAnalytics(): NotificationAnalytics {
    return {
      overview: {
        totalSent: 0,
        deliveryRate: 0.98,
        openRate: 0.65,
        clickRate: 0.15,
        conversionRate: 0.05,
        averageCost: 0.002
      },
      byType: {},
      byChannel: {},
      userEngagement: {
        activeUsers: 0,
        optOutRate: 0.02,
        preferenceChanges: 0,
        averageResponseTime: 300
      },
      performance: {
        averageDeliveryTime: 250,
        failureRate: 0.02,
        retryRate: 0.05,
        queueSize: 0
      }
    };
  }

  // Helper methods
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStreamId(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default NotificationService; 