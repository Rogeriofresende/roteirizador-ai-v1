/**
 * 🔔 COST ALERT SERVICE - REAL-TIME COST NOTIFICATIONS
 * Manages real-time cost alerts and notifications
 * 
 * FEATURES: Multi-channel alerts, escalation, notification history
 * PREVENTS: Silent budget overruns through immediate alerts
 */

import { logger } from '../../utils/logger';
import { config } from '../../config/environment';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface CostAlert {
  id: string;
  type: 'warning' | 'critical' | 'emergency' | 'info';
  category: 'budget_threshold' | 'daily_limit' | 'user_limit' | 'system_overload' | 'cost_spike';
  title: string;
  message: string;
  data: Record<string, any>;
  timestamp: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  channels: NotificationChannel[];
  status: 'pending' | 'sent' | 'failed' | 'acknowledged';
  attempts: number;
  maxAttempts: number;
  lastAttempt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  escalated: boolean;
  escalationLevel: number;
  metadata: Record<string, any>;
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'slack' | 'webhook' | 'in_app' | 'push';
  config: Record<string, any>;
  enabled: boolean;
  priority: number;
}

export interface AlertThreshold {
  id: string;
  name: string;
  type: 'percentage' | 'absolute' | 'rate';
  metric: 'daily_cost' | 'monthly_cost' | 'user_cost' | 'api_calls' | 'cost_rate';
  value: number;
  comparison: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  enabled: boolean;
  cooldown: number; // Minutes between alerts
  escalationDelay: number; // Minutes before escalation
  channels: string[];
  recipients: string[];
  description: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: CostAlert['type'];
  category: CostAlert['category'];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  variables: string[];
  channels: string[];
}

export interface AlertRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  slackUserId?: string;
  role: 'admin' | 'manager' | 'developer' | 'finance';
  alertTypes: string[];
  availabilityHours: string;
  escalationOrder: number;
  preferences: {
    preferredChannels: string[];
    quietHours: { start: string; end: string };
    maxAlertsPerHour: number;
  };
}

export interface AlertStats {
  total: number;
  byType: Record<string, number>;
  byChannel: Record<string, number>;
  byRecipient: Record<string, number>;
  averageResponseTime: number;
  escalationRate: number;
  successRate: number;
  timeRange: {
    start: string;
    end: string;
  };
}

// =============================================================================
// COST ALERT SERVICE
// =============================================================================

class CostAlertService {
  private alerts: Map<string, CostAlert> = new Map();
  private alertHistory: CostAlert[] = [];
  private thresholds: Map<string, AlertThreshold> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private recipients: Map<string, AlertRecipient> = new Map();
  private notificationChannels: Map<string, NotificationChannel> = new Map();
  private lastAlertTimes: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultThresholds();
    this.initializeDefaultTemplates();
    this.initializeDefaultRecipients();
    this.initializeNotificationChannels();
    this.loadPersistedData();
    this.startAlertProcessing();
    
    logger.info('🔔 Cost Alert Service initialized', {
      thresholds: this.thresholds.size,
      templates: this.templates.size,
      recipients: this.recipients.size,
      channels: this.notificationChannels.size
    }, 'COST_ALERT');
  }

  // =============================================================================
  // CORE ALERT FUNCTIONALITY
  // =============================================================================

  /**
   * Send cost alert
   * CRITICAL: Main entry point for cost alerts
   */
  async sendAlert(alertData: Omit<CostAlert, 'id' | 'timestamp' | 'status' | 'attempts' | 'escalated' | 'escalationLevel'>): Promise<string> {
    const alertId = crypto.randomUUID();
    
    const alert: CostAlert = {
      id: alertId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      attempts: 0,
      escalated: false,
      escalationLevel: 0,
      ...alertData
    };

    // Check cooldown period
    if (!this.checkCooldownPeriod(alert)) {
      logger.debug('Alert suppressed due to cooldown', {
        alertId,
        type: alert.type,
        category: alert.category
      }, 'ALERT_COOLDOWN');
      return alertId;
    }

    // Store alert
    this.alerts.set(alertId, alert);
    this.alertHistory.push(alert);

    // Process alert immediately
    await this.processAlert(alert);

    // Update last alert time for cooldown tracking
    this.updateLastAlertTime(alert);

    logger.info('🔔 Cost alert created', {
      alertId,
      type: alert.type,
      category: alert.category,
      urgency: alert.urgency,
      recipientCount: alert.recipients.length
    }, 'COST_ALERT');

    return alertId;
  }

  /**
   * Process alert through all configured channels
   */
  private async processAlert(alert: CostAlert): Promise<void> {
    alert.status = 'pending';
    alert.attempts++;
    alert.lastAttempt = new Date().toISOString();

    const template = this.getTemplate(alert.type, alert.category);
    const processedMessage = this.processTemplate(template, alert);

    let successCount = 0;
    let failureCount = 0;

    // Send through each configured channel
    for (const channelType of alert.channels.map(c => c.type)) {
      const channel = this.notificationChannels.get(channelType);
      if (!channel || !channel.enabled) {
        continue;
      }

      try {
        await this.sendThroughChannel(alert, processedMessage, channel);
        successCount++;
        
        logger.debug('Alert sent successfully', {
          alertId: alert.id,
          channel: channelType,
          recipients: alert.recipients.length
        }, 'ALERT_SUCCESS');
        
      } catch (error) {
        failureCount++;
        
        logger.error('Failed to send alert', {
          alertId: alert.id,
          channel: channelType,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'ALERT_FAILURE');
      }
    }

    // Update alert status
    if (successCount > 0) {
      alert.status = 'sent';
    } else {
      alert.status = 'failed';
      
      // Schedule retry if under max attempts
      if (alert.attempts < alert.maxAttempts) {
        setTimeout(() => {
          this.processAlert(alert);
        }, Math.pow(2, alert.attempts) * 60000); // Exponential backoff
      } else {
        // Escalate if all attempts failed
        await this.escalateAlert(alert);
      }
    }

    // Persist updated alert
    await this.persistAlert(alert);
  }

  /**
   * Send alert through specific channel
   */
  private async sendThroughChannel(
    alert: CostAlert,
    message: { subject: string; body: string; html?: string },
    channel: NotificationChannel
  ): Promise<void> {
    switch (channel.type) {
      case 'email': {
        await this.sendEmailAlert(alert, message, channel);
        break;
      }
      case 'sms': {
        await this.sendSMSAlert(alert, message, channel);
        break;
      }
      case 'slack': {
        await this.sendSlackAlert(alert, message, channel);
        break;
      }
      case 'webhook': {
        await this.sendWebhookAlert(alert, message, channel);
        break;
      }
      case 'in_app': {
        await this.sendInAppAlert(alert, message, channel);
        break;
      }
      case 'push': {
        await this.sendPushAlert(alert, message, channel);
        break;
      }
      default:
        throw new Error(`Unsupported channel type: ${channel.type}`);
    }
  }

  // =============================================================================
  // CHANNEL IMPLEMENTATIONS
  // =============================================================================

  private async sendEmailAlert(
    alert: CostAlert,
    message: { subject: string; body: string; html?: string },
    channel: NotificationChannel
  ): Promise<void> {
    // Integration with email service would go here
    // For now, simulate email sending
    
    const emailData = {
      to: alert.recipients,
      subject: `[COST ALERT] ${message.subject}`,
      text: message.body,
      html: message.html || message.body,
      metadata: {
        alertId: alert.id,
        type: alert.type,
        urgency: alert.urgency
      }
    };

    // Simulate email service API call
    logger.info('📧 Email alert queued', {
      alertId: alert.id,
      recipients: emailData.to,
      subject: emailData.subject
    }, 'EMAIL_ALERT');

    // In real implementation, this would call actual email service
    // await emailService.send(emailData);
  }

  private async sendSMSAlert(
    alert: CostAlert,
    message: { subject: string; body: string },
    channel: NotificationChannel
  ): Promise<void> {
    // Get recipients with phone numbers
    const smsRecipients = alert.recipients
      .map(id => this.recipients.get(id))
      .filter(r => r && r.phone)
      .map(r => r!.phone!);

    if (smsRecipients.length === 0) {
      logger.warn('No SMS recipients found for alert', { alertId: alert.id }, 'SMS_ALERT');
      return;
    }

    // Truncate message for SMS
    const smsBody = message.body.length > 160 
      ? message.body.substring(0, 157) + '...'
      : message.body;

    for (const phone of smsRecipients) {
      // Simulate SMS sending
      logger.info('📱 SMS alert queued', {
        alertId: alert.id,
        phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // Mask phone
        message: smsBody
      }, 'SMS_ALERT');

      // In real implementation: await smsService.send(phone, smsBody);
    }
  }

  private async sendSlackAlert(
    alert: CostAlert,
    message: { subject: string; body: string },
    channel: NotificationChannel
  ): Promise<void> {
    const slackMessage = {
      text: `🚨 ${message.subject}`,
      attachments: [{
        color: this.getSlackColor(alert.type),
        fields: [
          {
            title: 'Alert Type',
            value: alert.type.toUpperCase(),
            short: true
          },
          {
            title: 'Category',
            value: alert.category,
            short: true
          },
          {
            title: 'Urgency',
            value: alert.urgency.toUpperCase(),
            short: true
          },
          {
            title: 'Details',
            value: message.body,
            short: false
          }
        ],
        footer: 'Cost Management System',
        ts: Math.floor(new Date(alert.timestamp).getTime() / 1000)
      }]
    };

    logger.info('💬 Slack alert queued', {
      alertId: alert.id,
      channel: channel.config.channel || '#alerts',
      message: slackMessage.text
    }, 'SLACK_ALERT');

    // In real implementation: await slackService.send(slackMessage);
  }

  private async sendWebhookAlert(
    alert: CostAlert,
    message: { subject: string; body: string },
    channel: NotificationChannel
  ): Promise<void> {
    const webhookPayload = {
      alertId: alert.id,
      type: alert.type,
      category: alert.category,
      title: alert.title,
      message: alert.message,
      urgency: alert.urgency,
      timestamp: alert.timestamp,
      data: alert.data,
      formattedMessage: message
    };

    const webhookUrl = channel.config.url;
    if (!webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    logger.info('🔗 Webhook alert queued', {
      alertId: alert.id,
      url: webhookUrl.replace(/\/\/[^\/]+/, '//***'), // Mask domain
      payload: Object.keys(webhookPayload)
    }, 'WEBHOOK_ALERT');

    // In real implementation:
    // await fetch(webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(webhookPayload)
    // });
  }

  private async sendInAppAlert(
    alert: CostAlert,
    message: { subject: string; body: string },
    channel: NotificationChannel
  ): Promise<void> {
    // Store in-app notification
    const inAppAlert = {
      id: alert.id,
      title: message.subject,
      body: message.body,
      type: alert.type,
      urgency: alert.urgency,
      timestamp: alert.timestamp,
      recipients: alert.recipients,
      read: false,
      actions: this.getInAppActions(alert)
    };

    try {
      const existingAlerts = JSON.parse(localStorage.getItem('inApp_alerts') || '[]');
      existingAlerts.push(inAppAlert);
      
      // Keep only last 100 in-app alerts
      if (existingAlerts.length > 100) {
        existingAlerts.splice(0, existingAlerts.length - 100);
      }
      
      localStorage.setItem('inApp_alerts', JSON.stringify(existingAlerts));
      
      logger.info('📲 In-app alert stored', {
        alertId: alert.id,
        recipients: alert.recipients.length
      }, 'IN_APP_ALERT');
      
    } catch (error) {
      logger.error('Failed to store in-app alert', error, 'IN_APP_ALERT');
    }
  }

  private async sendPushAlert(
    alert: CostAlert,
    message: { subject: string; body: string },
    channel: NotificationChannel
  ): Promise<void> {
    const pushData = {
      title: message.subject,
      body: message.body,
      icon: this.getPushIcon(alert.type),
      badge: this.getPushBadge(alert.urgency),
      data: {
        alertId: alert.id,
        type: alert.type,
        urgency: alert.urgency
      },
      recipients: alert.recipients
    };

    logger.info('📳 Push notification queued', {
      alertId: alert.id,
      recipients: pushData.recipients.length,
      title: pushData.title
    }, 'PUSH_ALERT');

    // In real implementation: await pushService.send(pushData);
  }

  // =============================================================================
  // ESCALATION SYSTEM
  // =============================================================================

  /**
   * Escalate alert when delivery fails or threshold is critical
   */
  private async escalateAlert(alert: CostAlert): Promise<void> {
    alert.escalated = true;
    alert.escalationLevel++;

    // Get escalation recipients
    const escalationRecipients = this.getEscalationRecipients(alert.escalationLevel);
    
    if (escalationRecipients.length === 0) {
      logger.error('No escalation recipients found', {
        alertId: alert.id,
        escalationLevel: alert.escalationLevel
      }, 'ALERT_ESCALATION');
      return;
    }

    // Create escalated alert
    const escalatedAlert: Omit<CostAlert, 'id' | 'timestamp' | 'status' | 'attempts' | 'escalated' | 'escalationLevel'> = {
      ...alert,
      type: 'critical',
      title: `[ESCALATED] ${alert.title}`,
      message: `ESCALATION LEVEL ${alert.escalationLevel}: Original alert failed delivery.\n\n${alert.message}`,
      recipients: escalationRecipients,
      urgency: 'critical',
      maxAttempts: 3
    };

    await this.sendAlert(escalatedAlert);

    logger.warn('🚨 Alert escalated', {
      originalAlertId: alert.id,
      escalationLevel: alert.escalationLevel,
      escalationRecipients: escalationRecipients.length
    }, 'ALERT_ESCALATION');
  }

  // =============================================================================
  // THRESHOLD MONITORING
  // =============================================================================

  /**
   * Check cost thresholds and trigger alerts
   */
  async checkThresholds(costData: {
    dailyCost: number;
    monthlyCost: number;
    projectedMonthlyCost: number;
    userCosts: Record<string, number>;
    apiCallRate: number;
  }): Promise<void> {
    for (const threshold of this.thresholds.values()) {
      if (!threshold.enabled) continue;

      const currentValue = this.getCurrentValue(threshold.metric, costData);
      const thresholdMet = this.evaluateThreshold(currentValue, threshold.value, threshold.comparison);

      if (thresholdMet) {
        await this.triggerThresholdAlert(threshold, currentValue, costData);
      }
    }
  }

  /**
   * Trigger alert for threshold violation
   */
  private async triggerThresholdAlert(
    threshold: AlertThreshold,
    currentValue: number,
    costData: any
  ): Promise<void> {
    const alertType = this.getAlertTypeFromThreshold(threshold, currentValue);
    const alertCategory = this.getCategoryFromMetric(threshold.metric);

    await this.sendAlert({
      type: alertType,
      category: alertCategory,
      title: `${threshold.name} Threshold Exceeded`,
      message: this.generateThresholdMessage(threshold, currentValue),
      data: {
        threshold: threshold.value,
        current: currentValue,
        metric: threshold.metric,
        costData
      },
      urgency: this.getUrgencyFromType(alertType),
      recipients: threshold.recipients,
      channels: this.getChannelsFromTypes(threshold.channels),
      maxAttempts: 3,
      metadata: {
        thresholdId: threshold.id,
        triggered: 'automatic'
      }
    });
  }

  // =============================================================================
  // TEMPLATE PROCESSING
  // =============================================================================

  /**
   * Get appropriate template for alert type and category
   */
  private getTemplate(type: string, category: string): NotificationTemplate {
    // Find specific template
    let template = Array.from(this.templates.values())
      .find(t => t.type === type && t.category === category);

    // Fallback to type-only match
    if (!template) {
      template = Array.from(this.templates.values())
        .find(t => t.type === type);
    }

    // Ultimate fallback
    if (!template) {
      template = this.getDefaultTemplate();
    }

    return template;
  }

  /**
   * Process template with alert data
   */
  private processTemplate(
    template: NotificationTemplate,
    alert: CostAlert
  ): { subject: string; body: string; html?: string } {
    const variables = this.extractTemplateVariables(alert);

    const subject = this.replaceTemplateVariables(template.subject, variables);
    const body = this.replaceTemplateVariables(template.bodyText, variables);
    const html = template.bodyHtml 
      ? this.replaceTemplateVariables(template.bodyHtml, variables)
      : undefined;

    return { subject, body, html };
  }

  /**
   * Extract variables from alert for template processing
   */
  private extractTemplateVariables(alert: CostAlert): Record<string, string> {
    return {
      alertId: alert.id,
      type: alert.type,
      category: alert.category,
      title: alert.title,
      message: alert.message,
      urgency: alert.urgency,
      timestamp: new Date(alert.timestamp).toLocaleString(),
      ...Object.fromEntries(
        Object.entries(alert.data).map(([k, v]) => [k, String(v)])
      )
    };
  }

  /**
   * Replace template variables with actual values
   */
  private replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return result;
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private checkCooldownPeriod(alert: CostAlert): boolean {
    const cooldownKey = `${alert.type}_${alert.category}`;
    const lastAlertTime = this.lastAlertTimes.get(cooldownKey);
    
    if (!lastAlertTime) return true;

    const threshold = this.thresholds.get(alert.category);
    const cooldownMinutes = threshold?.cooldown || 5; // Default 5 minutes
    const cooldownMs = cooldownMinutes * 60 * 1000;

    return Date.now() - lastAlertTime > cooldownMs;
  }

  private updateLastAlertTime(alert: CostAlert): void {
    const cooldownKey = `${alert.type}_${alert.category}`;
    this.lastAlertTimes.set(cooldownKey, Date.now());
  }

  private getCurrentValue(metric: string, costData: any): number {
    switch (metric) {
      case 'daily_cost': {
        return costData.dailyCost;
      }
      case 'monthly_cost': {
        return costData.monthlyCost;
      }
      case 'projected_monthly_cost': {
        return costData.projectedMonthlyCost;
      }
      case 'api_calls': {
        return costData.apiCallRate;
      }
      default:
        return 0;
    }
  }

  private evaluateThreshold(current: number, threshold: number, comparison: string): boolean {
    switch (comparison) {
      case 'greater_than': {
        return current > threshold;
      }
      case 'less_than': {
        return current < threshold;
      }
      case 'equals': {
        return current === threshold;
      }
      case 'not_equals': {
        return current !== threshold;
      }
      default:
        return false;
    }
  }

  private getAlertTypeFromThreshold(threshold: AlertThreshold, currentValue: number): CostAlert['type'] {
    const ratio = currentValue / threshold.value;
    
    if (ratio >= 2) return 'emergency';
    if (ratio >= 1.5) return 'critical';
    if (ratio >= 1.2) return 'warning';
    return 'info';
  }

  private getCategoryFromMetric(metric: string): CostAlert['category'] {
    if (metric.includes('daily')) return 'daily_limit';
    if (metric.includes('monthly')) return 'budget_threshold';
    if (metric.includes('user')) return 'user_limit';
    if (metric.includes('api')) return 'system_overload';
    return 'cost_spike';
  }

  private getUrgencyFromType(type: string): CostAlert['urgency'] {
    switch (type) {
      case 'emergency': {
        return 'critical';
      }
      case 'critical': {
        return 'high';
      }
      case 'warning': {
        return 'medium';
      }
      default:
        return 'low';
    }
  }

  private getChannelsFromTypes(channelTypes: string[]): NotificationChannel[] {
    return channelTypes
      .map(type => this.notificationChannels.get(type))
      .filter((channel): channel is NotificationChannel => channel !== undefined);
  }

  private generateThresholdMessage(threshold: AlertThreshold, currentValue: number): string {
    return `${threshold.description}\n\nCurrent value: ${currentValue}\nThreshold: ${threshold.value}\nExceeded by: ${(currentValue - threshold.value).toFixed(2)}`;
  }

  private getEscalationRecipients(escalationLevel: number): string[] {
    return Array.from(this.recipients.values())
      .filter(r => r.escalationOrder <= escalationLevel)
      .map(r => r.id);
  }

  private getSlackColor(type: string): string {
    switch (type) {
      case 'emergency': {
        return 'danger';
      }
      case 'critical': {
        return 'warning';
      }
      case 'warning': {
        return 'warning';
      }
      default:
        return 'good';
    }
  }

  private getInAppActions(alert: CostAlert): Array<{ label: string; action: string }> {
    const actions = [
      { label: 'Acknowledge', action: 'acknowledge' },
      { label: 'View Details', action: 'view_details' }
    ];

    if (alert.type === 'emergency') {
      actions.push({ label: 'Emergency Response', action: 'emergency_response' });
    }

    return actions;
  }

  private getPushIcon(type: string): string {
    switch (type) {
      case 'emergency': {
        return '/icons/alert-emergency.png';
      }
      case 'critical': {
        return '/icons/alert-critical.png';
      }
      case 'warning': {
        return '/icons/alert-warning.png';
      }
      default:
        return '/icons/alert-info.png';
    }
  }

  private getPushBadge(urgency: string): number {
    switch (urgency) {
      case 'critical': {
        return 3;
      }
      case 'high': {
        return 2;
      }
      case 'medium': {
        return 1;
      }
      default:
        return 0;
    }
  }

  private getDefaultTemplate(): NotificationTemplate {
    return {
      id: 'default',
      name: 'Default Alert Template',
      type: 'info',
      category: 'budget_threshold',
      subject: 'Cost Alert: {{title}}',
      bodyText: 'Alert: {{message}}\nTime: {{timestamp}}\nUrgency: {{urgency}}',
      variables: ['title', 'message', 'timestamp', 'urgency'],
      channels: ['email', 'slack']
    };
  }

  // =============================================================================
  // INITIALIZATION METHODS
  // =============================================================================

  private initializeDefaultThresholds(): void {
    const defaultThresholds: AlertThreshold[] = [
      {
        id: 'daily_budget_80',
        name: 'Daily Budget 80%',
        type: 'percentage',
        metric: 'daily_cost',
        value: 1.33, // 80% of $1.67 daily budget
        comparison: 'greater_than',
        enabled: true,
        cooldown: 5,
        escalationDelay: 10,
        channels: ['email', 'slack'],
        recipients: ['admin', 'finance'],
        description: '80% of daily budget has been consumed'
      },
      {
        id: 'daily_budget_100',
        name: 'Daily Budget Exceeded',
        type: 'absolute',
        metric: 'daily_cost',
        value: 1.67,
        comparison: 'greater_than',
        enabled: true,
        cooldown: 1,
        escalationDelay: 5,
        channels: ['email', 'sms', 'slack'],
        recipients: ['admin', 'finance', 'tech_lead'],
        description: 'Daily budget has been exceeded'
      },
      {
        id: 'emergency_threshold',
        name: 'Emergency Cost Threshold',
        type: 'absolute',
        metric: 'daily_cost',
        value: 3.00,
        comparison: 'greater_than',
        enabled: true,
        cooldown: 0,
        escalationDelay: 2,
        channels: ['email', 'sms', 'slack', 'webhook'],
        recipients: ['admin', 'finance', 'tech_lead', 'emergency'],
        description: 'Emergency cost threshold activated - immediate action required'
      }
    ];

    defaultThresholds.forEach(threshold => {
      this.thresholds.set(threshold.id, threshold);
    });
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      {
        id: 'budget_warning',
        name: 'Budget Warning',
        type: 'warning',
        category: 'budget_threshold',
        subject: 'Budget Alert: {{title}}',
        bodyText: `Budget Warning
        
Current Cost: ${{current}}
Budget Limit: ${{threshold}}
Usage: {{percentage}}%

{{message}}

Time: {{timestamp}}`,
        variables: ['title', 'current', 'threshold', 'percentage', 'message', 'timestamp'],
        channels: ['email', 'slack']
      },
      {
        id: 'emergency_alert',
        name: 'Emergency Alert',
        type: 'emergency',
        category: 'daily_limit',
        subject: '🚨 EMERGENCY: {{title}}',
        bodyText: `🚨 EMERGENCY COST ALERT 🚨

{{message}}

IMMEDIATE ACTION REQUIRED

Current Status:
- Cost: ${{current}}
- Threshold: ${{threshold}}
- Time: {{timestamp}}

Emergency protocols have been activated.`,
        variables: ['title', 'message', 'current', 'threshold', 'timestamp'],
        channels: ['email', 'sms', 'slack', 'webhook']
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private initializeDefaultRecipients(): void {
    const defaultRecipients: AlertRecipient[] = [
      {
        id: 'admin',
        name: 'System Administrator',
        email: 'admin@company.com',
        phone: '+1234567890',
        role: 'admin',
        alertTypes: ['warning', 'critical', 'emergency'],
        availabilityHours: '24/7',
        escalationOrder: 1,
        preferences: {
          preferredChannels: ['email', 'sms'],
          quietHours: { start: '22:00', end: '06:00' },
          maxAlertsPerHour: 5
        }
      },
      {
        id: 'finance',
        name: 'Finance Manager',
        email: 'finance@company.com',
        role: 'finance',
        alertTypes: ['warning', 'critical', 'emergency'],
        availabilityHours: '9AM-6PM',
        escalationOrder: 2,
        preferences: {
          preferredChannels: ['email'],
          quietHours: { start: '18:00', end: '09:00' },
          maxAlertsPerHour: 3
        }
      },
      {
        id: 'tech_lead',
        name: 'Technical Lead',
        email: 'tech@company.com',
        role: 'developer',
        alertTypes: ['critical', 'emergency'],
        availabilityHours: '24/7',
        escalationOrder: 1,
        preferences: {
          preferredChannels: ['slack', 'email'],
          quietHours: { start: '23:00', end: '07:00' },
          maxAlertsPerHour: 10
        }
      }
    ];

    defaultRecipients.forEach(recipient => {
      this.recipients.set(recipient.id, recipient);
    });
  }

  private initializeNotificationChannels(): void {
    const defaultChannels: NotificationChannel[] = [
      {
        type: 'email',
        config: {
          smtp: 'smtp.company.com',
          from: 'alerts@company.com'
        },
        enabled: true,
        priority: 1
      },
      {
        type: 'slack',
        config: {
          webhook: 'https://hooks.slack.com/services/...',
          channel: '#cost-alerts'
        },
        enabled: true,
        priority: 2
      },
      {
        type: 'sms',
        config: {
          provider: 'twilio',
          from: '+1234567890'
        },
        enabled: true,
        priority: 3
      },
      {
        type: 'webhook',
        config: {
          url: 'https://api.company.com/alerts',
          timeout: 5000
        },
        enabled: true,
        priority: 4
      },
      {
        type: 'in_app',
        config: {},
        enabled: true,
        priority: 5
      }
    ];

    defaultChannels.forEach(channel => {
      this.notificationChannels.set(channel.type, channel);
    });
  }

  private async loadPersistedData(): Promise<void> {
    try {
      // Load persisted alerts
      const storedAlerts = localStorage.getItem('costAlert_alerts');
      if (storedAlerts) {
        const alertsData = JSON.parse(storedAlerts);
        alertsData.forEach((alert: CostAlert) => {
          this.alerts.set(alert.id, alert);
        });
      }

      // Load alert history
      const storedHistory = localStorage.getItem('costAlert_history');
      if (storedHistory) {
        this.alertHistory = JSON.parse(storedHistory);
      }
    } catch (error) {
      logger.error('Failed to load persisted alert data', error, 'COST_ALERT');
    }
  }

  private async persistAlert(alert: CostAlert): Promise<void> {
    try {
      const allAlerts = Array.from(this.alerts.values());
      localStorage.setItem('costAlert_alerts', JSON.stringify(allAlerts));

      // Update history
      this.alertHistory.push(alert);
      if (this.alertHistory.length > 1000) {
        this.alertHistory = this.alertHistory.slice(-1000);
      }
      localStorage.setItem('costAlert_history', JSON.stringify(this.alertHistory));
    } catch (error) {
      logger.error('Failed to persist alert', error, 'COST_ALERT');
    }
  }

  private startAlertProcessing(): void {
    // Process pending alerts every 30 seconds
    setInterval(() => {
      this.processPendingAlerts();
    }, 30000);

    // Clean up old alerts daily
    setInterval(() => {
      this.cleanupOldAlerts();
    }, 24 * 60 * 60 * 1000);
  }

  private async processPendingAlerts(): Promise<void> {
    const pendingAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.status === 'pending' || alert.status === 'failed');

    for (const alert of pendingAlerts) {
      if (alert.attempts < alert.maxAttempts) {
        await this.processAlert(alert);
      }
    }
  }

  private cleanupOldAlerts(): void {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days

    // Clean up active alerts
    for (const [id, alert] of this.alerts.entries()) {
      if (new Date(alert.timestamp).getTime() < cutoff) {
        this.alerts.delete(id);
      }
    }

    // Clean up history
    this.alertHistory = this.alertHistory.filter(alert =>
      new Date(alert.timestamp).getTime() > cutoff
    );

    logger.info('Old alerts cleaned up', {
      cutoffDate: new Date(cutoff).toISOString(),
      activeAlerts: this.alerts.size,
      historySize: this.alertHistory.length
    }, 'COST_ALERT');
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date().toISOString();

    await this.persistAlert(alert);

    logger.info('Alert acknowledged', {
      alertId,
      acknowledgedBy: userId
    }, 'ALERT_ACKNOWLEDGMENT');
  }

  /**
   * Get alert statistics
   */
  getAlertStats(timeRange: { start: string; end: string }): AlertStats {
    const startTime = new Date(timeRange.start).getTime();
    const endTime = new Date(timeRange.end).getTime();

    const filteredAlerts = this.alertHistory.filter(alert => {
      const alertTime = new Date(alert.timestamp).getTime();
      return alertTime >= startTime && alertTime <= endTime;
    });

    const byType: Record<string, number> = {};
    const byChannel: Record<string, number> = {};
    const byRecipient: Record<string, number> = {};

    filteredAlerts.forEach(alert => {
      byType[alert.type] = (byType[alert.type] || 0) + 1;
      
      alert.channels.forEach(channel => {
        byChannel[channel.type] = (byChannel[channel.type] || 0) + 1;
      });
      
      alert.recipients.forEach(recipient => {
        byRecipient[recipient] = (byRecipient[recipient] || 0) + 1;
      });
    });

    const successfulAlerts = filteredAlerts.filter(a => a.status === 'sent').length;
    const escalatedAlerts = filteredAlerts.filter(a => a.escalated).length;

    return {
      total: filteredAlerts.length,
      byType,
      byChannel,
      byRecipient,
      averageResponseTime: 0, // Would calculate from actual response times
      escalationRate: filteredAlerts.length > 0 ? escalatedAlerts / filteredAlerts.length : 0,
      successRate: filteredAlerts.length > 0 ? successfulAlerts / filteredAlerts.length : 0,
      timeRange
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): CostAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.status !== 'acknowledged')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 50): CostAlert[] {
    return this.alertHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const costAlertService = new CostAlertService();
export default CostAlertService; 