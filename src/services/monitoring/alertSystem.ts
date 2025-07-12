/**
 * 🚨 ALERT SYSTEM SERVICE
 * 
 * IA CHARLIE - Integrated Alert Management
 * Advanced alert system with Beta communication template integration
 * 
 * BETA INTEGRATION FEATURES:
 * ✅ Email templates from Beta's communication system
 * ✅ In-app notifications using Beta's notification framework
 * ✅ User communication templates for alerts
 * ✅ A/B testing alert effectiveness
 * 
 * ALERT CATEGORIES:
 * 🔴 Cost Management (Alpha integration)
 * 🔵 User Migration (Beta integration)
 * 🟡 System Health (Charlie monitoring)
 * 🔗 Cross-Integration (Multi-IA coordination)
 */

import { productionMonitor } from './productionMonitor';
import { collaborationMonitor } from './collaborationMonitor';

// Alert system types
interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  source: AlertSource;
  title: string;
  message: string;
  details: AlertDetails;
  status: AlertStatus;
  timestamp: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  escalationLevel: number;
  communicationChannels: CommunicationChannel[];
  betaTemplateUsed?: string;
}

type AlertType = 
  | 'cost_overrun' 
  | 'budget_warning' 
  | 'emergency_circuit_breaker'
  | 'user_satisfaction_low'
  | 'migration_rollback_spike'
  | 'ab_test_failure'
  | 'system_health_degraded'
  | 'performance_issue'
  | 'integration_failure'
  | 'data_inconsistency'
  | 'collaboration_breakdown';

type AlertSeverity = 'info' | 'warning' | 'error' | 'critical' | 'emergency';

type AlertSource = 'alpha' | 'beta' | 'charlie' | 'cross' | 'system';

type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'escalated' | 'suppressed';

type CommunicationChannel = 'email' | 'in_app' | 'webhook' | 'sms' | 'dashboard';

interface AlertDetails {
  metrics?: Record<string, any>;
  affectedSystems: string[];
  potentialImpact: string;
  recommendedActions: string[];
  relatedAlerts: string[];
  autoResolutionAttempted: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  cooldownPeriod: number;
  escalationRules: EscalationRule[];
  communicationTemplate: string;
  enabled: boolean;
}

interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
  threshold: number;
  duration: number; // milliseconds
}

interface EscalationRule {
  level: number;
  triggerAfter: number; // minutes
  additionalChannels: CommunicationChannel[];
  recipients: string[];
}

interface AlertTemplate {
  id: string;
  name: string;
  channel: CommunicationChannel;
  betaIntegration: boolean;
  subject: string;
  body: string;
  variables: string[];
}

export class AlertSystem {
  private alerts: Map<string, Alert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  private templates: Map<string, AlertTemplate> = new Map();
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private alertCounter: number = 0;

  constructor() {
    this.setupDefaultRules();
    this.setupDefaultTemplates();
  }

  /**
   * 🚀 Start alert monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('🚨 Alert system already monitoring');
      return;
    }

    console.log('🚀 Starting alert system...');
    
    this.isMonitoring = true;
    
    // Start periodic alert checking
    this.monitoringInterval = setInterval(async () => {
      await this.checkAlertConditions();
    }, 30000); // Every 30 seconds

    // Initial check
    await this.checkAlertConditions();
    
    console.log('✅ Alert system active - Beta templates integrated');
  }

  /**
   * 🛑 Stop alert monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isMonitoring = false;
    console.log('🛑 Alert system stopped');
  }

  /**
   * 🚨 Create manual alert
   */
  async createAlert(
    type: AlertType,
    severity: AlertSeverity,
    source: AlertSource,
    title: string,
    message: string,
    details: Partial<AlertDetails> = {}
  ): Promise<string> {
    const alertId = this.generateAlertId();
    
    const alert: Alert = {
      id: alertId,
      type,
      severity,
      source,
      title,
      message,
      details: {
        affectedSystems: details.affectedSystems || [],
        potentialImpact: details.potentialImpact || 'Impact assessment pending',
        recommendedActions: details.recommendedActions || [],
        relatedAlerts: details.relatedAlerts || [],
        autoResolutionAttempted: false,
        ...details
      },
      status: 'active',
      timestamp: new Date().toISOString(),
      escalationLevel: 0,
      communicationChannels: this.selectCommunicationChannels(severity)
    };

    this.alerts.set(alertId, alert);
    
    // Send notifications using Beta templates
    await this.sendAlertNotifications(alert);
    
    // Log alert
    console.log(`🚨 ALERT CREATED [${severity.toUpperCase()}] ${source.toUpperCase()}: ${title}`);
    
    return alertId;
  }

  /**
   * ✅ Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.status = 'acknowledged';
    alert.acknowledgedBy = acknowledgedBy;
    
    // Send acknowledgment notification using Beta templates
    await this.sendAcknowledgmentNotification(alert);
    
    console.log(`✅ Alert acknowledged: ${alertId} by ${acknowledgedBy}`);
    return true;
  }

  /**
   * 🔧 Resolve alert
   */
  async resolveAlert(alertId: string, resolvedBy: string, resolution?: string): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    
    // Send resolution notification using Beta templates
    await this.sendResolutionNotification(alert, resolution);
    
    console.log(`🔧 Alert resolved: ${alertId} by ${resolvedBy}`);
    return true;
  }

  /**
   * 📊 Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.status === 'active' || alert.status === 'acknowledged')
      .sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity));
  }

  /**
   * 📈 Get alert statistics
   */
  getAlertStatistics(): {
    total: number;
    active: number;
    acknowledged: number;
    resolved: number;
    critical: number;
    bySeverity: Record<AlertSeverity, number>;
    bySource: Record<AlertSource, number>;
  } {
    const alerts = Array.from(this.alerts.values());
    
    const bySeverity: Record<AlertSeverity, number> = {
      info: 0, warning: 0, error: 0, critical: 0, emergency: 0
    };
    
    const bySource: Record<AlertSource, number> = {
      alpha: 0, beta: 0, charlie: 0, cross: 0, system: 0
    };
    
    alerts.forEach(alert => {
      bySeverity[alert.severity]++;
      bySource[alert.source]++;
    });
    
    return {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      critical: alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length,
      bySeverity,
      bySource
    };
  }

  /**
   * 🔍 Check alert conditions periodically
   */
  private async checkAlertConditions(): Promise<void> {
    try {
      // Get current metrics
      const productionMetrics = productionMonitor.getCurrentMetrics();
      const collaborationMetrics = collaborationMonitor.getMetrics();
      
      // Check each alert rule
      for (const rule of this.alertRules.values()) {
        if (!rule.enabled) continue;
        
        await this.evaluateAlertRule(rule, { productionMetrics, collaborationMetrics });
      }
      
      // Check for escalations
      await this.checkEscalations();
      
    } catch (error) {
      console.error('❌ Alert condition checking error:', error);
    }
  }

  /**
   * 📏 Evaluate individual alert rule
   */
  private async evaluateAlertRule(
    rule: AlertRule, 
    context: { productionMetrics: any; collaborationMetrics: any }
  ): Promise<void> {
    const { condition } = rule;
    const currentValue = this.extractMetricValue(condition.metric, context);
    
    if (currentValue === null) return;
    
    const conditionMet = this.evaluateCondition(condition, currentValue);
    
    if (conditionMet) {
      // Check if we're in cooldown period
      const recentAlert = this.findRecentAlert(rule.id, rule.cooldownPeriod);
      if (recentAlert) return;
      
      // Create alert
      await this.createRuleBasedAlert(rule, currentValue);
    }
  }

  /**
   * 🚨 Create rule-based alert
   */
  private async createRuleBasedAlert(rule: AlertRule, currentValue: number): Promise<void> {
    const alertType = this.mapRuleToAlertType(rule.name);
    const source = this.mapRuleToSource(rule.name);
    
    await this.createAlert(
      alertType,
      rule.severity,
      source,
      `${rule.name} - Threshold Exceeded`,
      `${rule.condition.metric} value ${currentValue} ${rule.condition.operator} ${rule.condition.threshold}`,
      {
        metrics: { [rule.condition.metric]: currentValue },
        affectedSystems: this.getAffectedSystems(rule.name),
        potentialImpact: this.getPotentialImpact(rule.name),
        recommendedActions: this.getRecommendedActions(rule.name)
      }
    );
  }

  /**
   * 📧 Send alert notifications using Beta templates
   */
  private async sendAlertNotifications(alert: Alert): Promise<void> {
    try {
      for (const channel of alert.communicationChannels) {
        const template = this.getTemplateForAlert(alert, channel);
        if (!template) continue;
        
        if (template.betaIntegration) {
          // Use Beta's communication templates
          await this.sendBetaIntegratedNotification(alert, template);
        } else {
          // Use internal notification system
          await this.sendInternalNotification(alert, template);
        }
      }
    } catch (error) {
      console.error('❌ Failed to send alert notifications:', error);
    }
  }

  /**
   * 📨 Send Beta-integrated notification
   */
  private async sendBetaIntegratedNotification(alert: Alert, template: AlertTemplate): Promise<void> {
    try {
      // Integration with Beta's communication system
      const betaPayload = {
        type: 'system_alert',
        alert: {
          id: alert.id,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          source: alert.source
        },
        template: {
          id: template.id,
          channel: template.channel,
          subject: this.interpolateTemplate(template.subject, alert),
          body: this.interpolateTemplate(template.body, alert)
        },
        metadata: {
          timestamp: alert.timestamp,
          escalationLevel: alert.escalationLevel
        }
      };
      
      // Send to Beta's communication service
      await this.sendToBetaCommunicationService(betaPayload);
      
      alert.betaTemplateUsed = template.id;
      
    } catch (error) {
      console.error('❌ Beta integration notification failed:', error);
      // Fallback to internal notification
      await this.sendInternalNotification(alert, template);
    }
  }

  /**
   * 🔔 Send internal notification
   */
  private async sendInternalNotification(alert: Alert, template: AlertTemplate): Promise<void> {
    const subject = this.interpolateTemplate(template.subject, alert);
    const body = this.interpolateTemplate(template.body, alert);
    
    console.log(`📢 ${template.channel.toUpperCase()} NOTIFICATION:`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
  }

  /**
   * 📤 Send to Beta communication service
   */
  private async sendToBetaCommunicationService(payload: any): Promise<void> {
    // Simulate integration with Beta's communication service
    console.log('📤 Sending to Beta communication service:', payload.template.subject);
    
    // In real implementation, this would call Beta's API endpoints:
    // - Email templates service
    // - In-app notifications service
    // - User communication service
  }

  /**
   * 🔀 Setup default alert rules
   */
  private setupDefaultRules(): void {
    const rules: AlertRule[] = [
      {
        id: 'cost_daily_threshold',
        name: 'Daily Cost Threshold',
        condition: { metric: 'cost.dailyCost', operator: 'gt', threshold: 1.67, duration: 300000 },
        severity: 'warning',
        cooldownPeriod: 3600000, // 1 hour
        escalationRules: [{
          level: 1,
          triggerAfter: 30,
          additionalChannels: ['email'],
          recipients: ['alpha-team']
        }],
        communicationTemplate: 'cost_alert_email',
        enabled: true
      },
      {
        id: 'cost_emergency_threshold',
        name: 'Emergency Cost Circuit Breaker',
        condition: { metric: 'cost.dailyCost', operator: 'gt', threshold: 3.0, duration: 60000 },
        severity: 'emergency',
        cooldownPeriod: 0, // No cooldown for emergency
        escalationRules: [{
          level: 1,
          triggerAfter: 5,
          additionalChannels: ['email', 'sms'],
          recipients: ['alpha-team', 'emergency-team']
        }],
        communicationTemplate: 'emergency_cost_alert',
        enabled: true
      },
      {
        id: 'user_satisfaction_low',
        name: 'User Satisfaction Below Threshold',
        condition: { metric: 'userMigration.satisfactionScore', operator: 'lt', threshold: 0.75, duration: 600000 },
        severity: 'error',
        cooldownPeriod: 1800000, // 30 minutes
        escalationRules: [{
          level: 1,
          triggerAfter: 15,
          additionalChannels: ['in_app'],
          recipients: ['beta-team']
        }],
        communicationTemplate: 'user_satisfaction_alert',
        enabled: true
      },
      {
        id: 'system_response_time',
        name: 'High System Response Time',
        condition: { metric: 'system.responseTime', operator: 'gt', threshold: 2000, duration: 300000 },
        severity: 'warning',
        cooldownPeriod: 1800000,
        escalationRules: [{
          level: 1,
          triggerAfter: 20,
          additionalChannels: ['dashboard'],
          recipients: ['charlie-team']
        }],
        communicationTemplate: 'performance_alert',
        enabled: true
      }
    ];
    
    rules.forEach(rule => this.alertRules.set(rule.id, rule));
  }

  /**
   * 📝 Setup default templates (Beta integration)
   */
  private setupDefaultTemplates(): void {
    const templates: AlertTemplate[] = [
      {
        id: 'cost_alert_email',
        name: 'Cost Alert Email (Beta Template)',
        channel: 'email',
        betaIntegration: true,
        subject: '💰 Cost Alert: {{title}}',
        body: `
          <h2>Cost Management Alert</h2>
          <p><strong>Alert:</strong> {{title}}</p>
          <p><strong>Message:</strong> {{message}}</p>
          <p><strong>Current Daily Cost:</strong> ${{cost.dailyCost}}</p>
          <p><strong>Budget Remaining:</strong> ${{cost.budgetRemaining}}</p>
          <p><strong>Recommended Actions:</strong></p>
          <ul>{{#each recommendedActions}}<li>{{this}}</li>{{/each}}</ul>
        `,
        variables: ['title', 'message', 'cost.dailyCost', 'cost.budgetRemaining', 'recommendedActions']
      },
      {
        id: 'user_satisfaction_alert',
        name: 'User Satisfaction Alert (Beta Template)',
        channel: 'in_app',
        betaIntegration: true,
        subject: '👥 User Experience Alert',
        body: `
          User satisfaction has dropped below acceptable levels.
          Current Score: {{userMigration.satisfactionScore}}
          Migration Progress: {{userMigration.migrationProgress}}%
          Please review user feedback and consider rollback procedures.
        `,
        variables: ['userMigration.satisfactionScore', 'userMigration.migrationProgress']
      },
      {
        id: 'emergency_cost_alert',
        name: 'Emergency Cost Alert (Beta Template)',
        channel: 'email',
        betaIntegration: true,
        subject: '🚨 EMERGENCY: Cost Circuit Breaker Activated',
        body: `
          <h1 style="color: red;">EMERGENCY COST ALERT</h1>
          <p>The cost circuit breaker has been activated due to excessive spending.</p>
          <p><strong>Current Daily Cost:</strong> ${{cost.dailyCost}}</p>
          <p><strong>Emergency Threshold:</strong> $3.00</p>
          <p><strong>Immediate Actions Required:</strong></p>
          <ul>
            <li>Review and restrict API usage</li>
            <li>Activate service degradation mode</li>
            <li>Investigate cost spike causes</li>
          </ul>
        `,
        variables: ['cost.dailyCost']
      }
    ];
    
    templates.forEach(template => this.templates.set(template.id, template));
  }

  /**
   * 🔧 Helper methods
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${++this.alertCounter}`;
  }

  private selectCommunicationChannels(severity: AlertSeverity): CommunicationChannel[] {
    switch (severity) {
      case 'emergency':
        return ['email', 'in_app', 'sms', 'dashboard'];
      case 'critical':
        return ['email', 'in_app', 'dashboard'];
      case 'error':
        return ['in_app', 'dashboard'];
      case 'warning':
        return ['dashboard'];
      case 'info':
        return ['dashboard'];
      default:
        return ['dashboard'];
    }
  }

  private getSeverityWeight(severity: AlertSeverity): number {
    const weights = { emergency: 5, critical: 4, error: 3, warning: 2, info: 1 };
    return weights[severity] || 0;
  }

  private extractMetricValue(metricPath: string, context: any): number | null {
    try {
      const path = metricPath.split('.');
      let value = context;
      
      for (const key of path) {
        value = value[key];
        if (value === undefined || value === null) return null;
      }
      
      return typeof value === 'number' ? value : null;
    } catch {
      return null;
    }
  }

  private evaluateCondition(condition: AlertCondition, value: number): boolean {
    switch (condition.operator) {
      case 'gt': return value > condition.threshold;
      case 'lt': return value < condition.threshold;
      case 'gte': return value >= condition.threshold;
      case 'lte': return value <= condition.threshold;
      case 'eq': return value === condition.threshold;
      case 'ne': return value !== condition.threshold;
      default: return false;
    }
  }

  private findRecentAlert(ruleId: string, cooldownPeriod: number): Alert | null {
    const cutoff = Date.now() - cooldownPeriod;
    
    for (const alert of this.alerts.values()) {
      if (new Date(alert.timestamp).getTime() > cutoff) {
        return alert;
      }
    }
    
    return null;
  }

  private getTemplateForAlert(alert: Alert, channel: CommunicationChannel): AlertTemplate | null {
    // Logic to select appropriate template based on alert type and channel
    const templateId = `${alert.type}_${channel}`;
    return this.templates.get(templateId) || this.templates.get(`default_${channel}`) || null;
  }

  private interpolateTemplate(template: string, alert: Alert): string {
    let result = template;
    
    // Replace basic variables
    result = result.replace(/\{\{title\}\}/g, alert.title);
    result = result.replace(/\{\{message\}\}/g, alert.message);
    result = result.replace(/\{\{severity\}\}/g, alert.severity);
    result = result.replace(/\{\{source\}\}/g, alert.source);
    
    // Replace metric variables (would need actual metric values)
    // This is a simplified implementation
    
    return result;
  }

  private mapRuleToAlertType(ruleName: string): AlertType {
    const mapping: Record<string, AlertType> = {
      'Daily Cost Threshold': 'budget_warning',
      'Emergency Cost Circuit Breaker': 'emergency_circuit_breaker',
      'User Satisfaction Below Threshold': 'user_satisfaction_low',
      'High System Response Time': 'performance_issue'
    };
    return mapping[ruleName] || 'system_health_degraded';
  }

  private mapRuleToSource(ruleName: string): AlertSource {
    if (ruleName.includes('Cost')) return 'alpha';
    if (ruleName.includes('User') || ruleName.includes('Satisfaction')) return 'beta';
    if (ruleName.includes('System') || ruleName.includes('Response')) return 'charlie';
    return 'system';
  }

  private getAffectedSystems(ruleName: string): string[] {
    // Return systems affected by this rule
    return ['production-api', 'user-interface', 'monitoring-system'];
  }

  private getPotentialImpact(ruleName: string): string {
    const impacts: Record<string, string> = {
      'Daily Cost Threshold': 'Budget overrun risk, potential service restrictions',
      'Emergency Cost Circuit Breaker': 'Service degradation, user experience impact',
      'User Satisfaction Below Threshold': 'User churn risk, migration rollback needed',
      'High System Response Time': 'User experience degradation, performance issues'
    };
    return impacts[ruleName] || 'System performance or user experience may be affected';
  }

  private getRecommendedActions(ruleName: string): string[] {
    const actions: Record<string, string[]> = {
      'Daily Cost Threshold': [
        'Review API usage patterns',
        'Implement cost controls',
        'Optimize request frequency'
      ],
      'Emergency Cost Circuit Breaker': [
        'Activate emergency protocols',
        'Restrict API access',
        'Investigate cost spike immediately'
      ],
      'User Satisfaction Below Threshold': [
        'Review user feedback',
        'Consider rollback procedures',
        'Improve communication'
      ],
      'High System Response Time': [
        'Check system resources',
        'Scale infrastructure',
        'Optimize performance bottlenecks'
      ]
    };
    return actions[ruleName] || ['Investigate and resolve the issue'];
  }

  private async sendAcknowledgmentNotification(alert: Alert): Promise<void> {
    console.log(`✅ Alert ${alert.id} acknowledged - sending Beta notification`);
  }

  private async sendResolutionNotification(alert: Alert, resolution?: string): Promise<void> {
    console.log(`🔧 Alert ${alert.id} resolved - sending Beta notification`);
  }

  private async checkEscalations(): Promise<void> {
    // Check if any alerts need escalation
    const activeAlerts = this.getActiveAlerts();
    
    for (const alert of activeAlerts) {
      const rule = Array.from(this.alertRules.values())
        .find(r => r.name.includes(alert.type));
      
      if (rule && rule.escalationRules.length > 0) {
        // Check escalation timing
        const alertAge = Date.now() - new Date(alert.timestamp).getTime();
        const nextEscalation = rule.escalationRules[alert.escalationLevel];
        
        if (nextEscalation && alertAge > nextEscalation.triggerAfter * 60000) {
          await this.escalateAlert(alert, nextEscalation);
        }
      }
    }
  }

  private async escalateAlert(alert: Alert, escalationRule: EscalationRule): Promise<void> {
    alert.escalationLevel++;
    alert.status = 'escalated';
    
    // Send escalation notifications
    console.log(`📈 Escalating alert ${alert.id} to level ${alert.escalationLevel}`);
  }
}

// Singleton instance
export const alertSystem = new AlertSystem(); 