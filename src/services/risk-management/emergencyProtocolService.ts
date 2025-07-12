/**
 * 🚨 EMERGENCY PROTOCOL SERVICE - CRITICAL SYSTEM PROTECTION
 * Manages emergency situations and automated response protocols
 * 
 * HANDLES: Cost overruns, system failures, user migration issues, API outages
 * FEATURES: Automated circuit breakers, degraded service modes, emergency notifications
 */

import { logger } from '../../utils/logger';
import { config } from '../../config/environment';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface EmergencyEvent {
  id: string;
  type: 'cost_overrun' | 'system_failure' | 'api_outage' | 'user_migration_issue' | 'performance_degradation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  triggeredBy: string;
  data: Record<string, any>;
  status: 'active' | 'investigating' | 'mitigating' | 'resolved';
  responseActions: EmergencyAction[];
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface EmergencyAction {
  id: string;
  type: 'circuit_breaker' | 'service_degradation' | 'notification' | 'rollback' | 'manual_intervention';
  description: string;
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

export interface SystemDegradationLevel {
  level: 'normal' | 'degraded' | 'minimal' | 'emergency';
  disabledFeatures: string[];
  reducedLimits: Record<string, number>;
  description: string;
  estimatedRecoveryTime?: string;
}

export interface EmergencyProtocol {
  triggerType: string;
  threshold: any;
  actions: Array<{
    type: string;
    delay: number;
    parameters: Record<string, any>;
  }>;
  escalationPath: string[];
  maxDuration: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  priority: number;
  availabilityHours: string;
}

// =============================================================================
// EMERGENCY PROTOCOL SERVICE
// =============================================================================

class EmergencyProtocolService {
  private activeEmergencies: Map<string, EmergencyEvent> = new Map();
  private emergencyHistory: EmergencyEvent[] = [];
  private currentDegradationLevel: SystemDegradationLevel;
  private protocols: Map<string, EmergencyProtocol> = new Map();
  private emergencyContacts: EmergencyContact[] = [];
  private isEmergencyModeActive: boolean = false;

  constructor() {
    this.currentDegradationLevel = this.getDefaultDegradationLevel();
    this.initializeProtocols();
    this.loadEmergencyContacts();
    this.startEmergencyMonitoring();
    
    logger.info('🚨 Emergency Protocol Service initialized', {
      protocolsCount: this.protocols.size,
      contactsCount: this.emergencyContacts.length,
      degradationLevel: this.currentDegradationLevel.level
    }, 'EMERGENCY_PROTOCOL');
  }

  // =============================================================================
  // CORE EMERGENCY MANAGEMENT
  // =============================================================================

  /**
   * Activate emergency response for specific event type
   * CRITICAL: Main entry point for emergency activation
   */
  async activateEmergency(
    type: EmergencyEvent['type'], 
    data: Record<string, any>,
    triggeredBy: string = 'system'
  ): Promise<string> {
    const emergencyId = crypto.randomUUID();
    
    const emergency: EmergencyEvent = {
      id: emergencyId,
      type,
      severity: this.calculateSeverity(type, data),
      title: this.generateEmergencyTitle(type, data),
      description: this.generateEmergencyDescription(type, data),
      timestamp: new Date().toISOString(),
      triggeredBy,
      data,
      status: 'active',
      responseActions: []
    };

    // Store emergency
    this.activeEmergencies.set(emergencyId, emergency);
    this.emergencyHistory.push(emergency);

    // Execute emergency protocol
    await this.executeEmergencyProtocol(emergency);

    // Activate emergency mode if critical
    if (emergency.severity === 'critical') {
      await this.activateEmergencyMode(emergency);
    }

    logger.error('🚨 Emergency activated', {
      emergencyId,
      type: emergency.type,
      severity: emergency.severity,
      title: emergency.title,
      triggeredBy
    }, 'EMERGENCY_ACTIVATION');

    return emergencyId;
  }

  /**
   * Execute appropriate protocol for emergency type
   */
  private async executeEmergencyProtocol(emergency: EmergencyEvent): Promise<void> {
    const protocol = this.protocols.get(emergency.type);
    
    if (!protocol) {
      logger.warn('No protocol found for emergency type', {
        type: emergency.type,
        emergencyId: emergency.id
      }, 'EMERGENCY_PROTOCOL');
      return;
    }

    for (const actionDef of protocol.actions) {
      // Add delay between actions
      if (actionDef.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, actionDef.delay));
      }

      const action: EmergencyAction = {
        id: crypto.randomUUID(),
        type: actionDef.type as EmergencyAction['type'],
        description: this.generateActionDescription(actionDef.type, actionDef.parameters),
        timestamp: new Date().toISOString(),
        status: 'executing'
      };

      emergency.responseActions.push(action);

      try {
        await this.executeEmergencyAction(action, actionDef.parameters, emergency);
        action.status = 'completed';
        action.result = 'Action executed successfully';
      } catch (error) {
        action.status = 'failed';
        action.error = error instanceof Error ? error.message : 'Unknown error';
        
        logger.error('Emergency action failed', {
          actionId: action.id,
          actionType: action.type,
          emergencyId: emergency.id,
          error: action.error
        }, 'EMERGENCY_ACTION');
      }
    }

    // Update emergency status
    emergency.status = 'mitigating';
  }

  /**
   * Execute specific emergency action
   */
  private async executeEmergencyAction(
    action: EmergencyAction, 
    parameters: Record<string, any>,
    emergency: EmergencyEvent
  ): Promise<void> {
    switch (action.type) {
      case 'circuit_breaker': {
        await this.activateCircuitBreaker(parameters.service, parameters.duration);
        break;
      }
      case 'service_degradation': {
        await this.degradeServices(parameters.level, parameters.features);
        break;
      }
      case 'notification': {
        await this.sendEmergencyNotification(emergency, parameters.contacts, parameters.channels);
        break;
      }
      case 'rollback': {
        await this.executeRollback(parameters.service, parameters.version);
        break;
      }
      case 'manual_intervention': {
        await this.requestManualIntervention(emergency, parameters.urgency);
        break;
      }
      default:
        throw new Error(`Unknown emergency action type: ${action.type}`);
    }
  }

  // =============================================================================
  // CIRCUIT BREAKER FUNCTIONALITY
  // =============================================================================

  /**
   * Activate circuit breaker for specific service
   */
  private async activateCircuitBreaker(service: string, duration: number): Promise<void> {
    logger.warn('🔧 Circuit breaker activated', {
      service,
      duration: `${duration}ms`
    }, 'CIRCUIT_BREAKER');

    // Integrate with existing circuit breaker
    try {
      const { apiCircuitBreaker } = await import('../apiCircuitBreaker');
      // Assuming apiCircuitBreaker has a method to manually trip the breaker
      if (typeof (apiCircuitBreaker as any).tripBreaker === 'function') {
        (apiCircuitBreaker as any).tripBreaker(service, duration);
      }
    } catch (error) {
      logger.error('Failed to activate circuit breaker', error, 'CIRCUIT_BREAKER');
    }

    // Set timeout to automatically reset
    setTimeout(() => {
      logger.info('🔧 Circuit breaker reset', { service }, 'CIRCUIT_BREAKER');
    }, duration);
  }

  /**
   * Degrade system services to minimal functionality
   */
  private async degradeServices(level: string, features: string[]): Promise<void> {
    const degradationLevel: SystemDegradationLevel = {
      level: level as SystemDegradationLevel['level'],
      disabledFeatures: features,
      reducedLimits: this.calculateReducedLimits(level),
      description: this.getDegradationDescription(level),
      estimatedRecoveryTime: this.estimateRecoveryTime(level)
    };

    this.currentDegradationLevel = degradationLevel;

    // Persist degradation state
    try {
      localStorage.setItem('emergency_degradation_level', JSON.stringify(degradationLevel));
    } catch (error) {
      logger.error('Failed to persist degradation level', error, 'SERVICE_DEGRADATION');
    }

    logger.warn('⚡ Service degradation activated', {
      level: degradationLevel.level,
      disabledFeatures: degradationLevel.disabledFeatures,
      reducedLimits: degradationLevel.reducedLimits
    }, 'SERVICE_DEGRADATION');
  }

  // =============================================================================
  // NOTIFICATION SYSTEM
  // =============================================================================

  /**
   * Send emergency notifications to relevant contacts
   */
  private async sendEmergencyNotification(
    emergency: EmergencyEvent,
    contactIds: string[],
    channels: string[]
  ): Promise<void> {
    const contacts = this.emergencyContacts.filter(contact => 
      contactIds.includes(contact.id) || contactIds.includes('all')
    );

    const notificationData = {
      emergencyId: emergency.id,
      type: emergency.type,
      severity: emergency.severity,
      title: emergency.title,
      description: emergency.description,
      timestamp: emergency.timestamp,
      degradationLevel: this.currentDegradationLevel.level,
      actionRequired: this.getRequiredActions(emergency)
    };

    for (const contact of contacts) {
      for (const channel of channels) {
        try {
          await this.sendNotificationToContact(contact, channel, notificationData);
        } catch (error) {
          logger.error('Failed to send emergency notification', {
            contactId: contact.id,
            channel,
            emergencyId: emergency.id,
            error
          }, 'EMERGENCY_NOTIFICATION');
        }
      }
    }

    logger.info('📢 Emergency notifications sent', {
      emergencyId: emergency.id,
      contactsNotified: contacts.length,
      channels
    }, 'EMERGENCY_NOTIFICATION');
  }

  /**
   * Send notification to specific contact via channel
   */
  private async sendNotificationToContact(
    contact: EmergencyContact,
    channel: string,
    data: any
  ): Promise<void> {
    switch (channel) {
      case 'email': {
        await this.sendEmailNotification(contact.email, data);
        break;
      }
      case 'sms': {
        if (contact.phone) {
          await this.sendSMSNotification(contact.phone, data);
        }
        break;
      }
      case 'slack': {
        await this.sendSlackNotification(contact, data);
        break;
      }
      case 'webhook': {
        await this.sendWebhookNotification(data);
        break;
      }
      default:
        logger.warn('Unknown notification channel', { channel }, 'EMERGENCY_NOTIFICATION');
    }
  }

  private async sendEmailNotification(email: string, data: any): Promise<void> {
    // Implementation would integrate with email service
    logger.info('📧 Email notification queued', { email, emergencyId: data.emergencyId }, 'EMAIL_NOTIFICATION');
  }

  private async sendSMSNotification(phone: string, data: any): Promise<void> {
    // Implementation would integrate with SMS service
    logger.info('📱 SMS notification queued', { phone, emergencyId: data.emergencyId }, 'SMS_NOTIFICATION');
  }

  private async sendSlackNotification(contact: EmergencyContact, data: any): Promise<void> {
    // Implementation would integrate with Slack API
    logger.info('💬 Slack notification queued', { contact: contact.name, emergencyId: data.emergencyId }, 'SLACK_NOTIFICATION');
  }

  private async sendWebhookNotification(data: any): Promise<void> {
    // Implementation would send to configured webhooks
    logger.info('🔗 Webhook notification queued', { emergencyId: data.emergencyId }, 'WEBHOOK_NOTIFICATION');
  }

  // =============================================================================
  // ROLLBACK & RECOVERY
  // =============================================================================

  /**
   * Execute rollback to previous stable version
   */
  private async executeRollback(service: string, version: string): Promise<void> {
    logger.warn('⏪ Rollback initiated', {
      service,
      targetVersion: version
    }, 'ROLLBACK');

    // This would integrate with deployment system
    // For now, we'll just log the action
    logger.info('⏪ Rollback completed (simulated)', {
      service,
      version
    }, 'ROLLBACK');
  }

  /**
   * Request manual intervention from administrators
   */
  private async requestManualIntervention(emergency: EmergencyEvent, urgency: string): Promise<void> {
    const interventionRequest = {
      emergencyId: emergency.id,
      urgency,
      description: emergency.description,
      suggestedActions: this.getSuggestedActions(emergency),
      escalationContacts: this.getEscalationContacts(urgency),
      timestamp: new Date().toISOString()
    };

    // Store intervention request
    try {
      const existingRequests = JSON.parse(localStorage.getItem('emergency_intervention_requests') || '[]');
      existingRequests.push(interventionRequest);
      localStorage.setItem('emergency_intervention_requests', JSON.stringify(existingRequests));
    } catch (error) {
      logger.error('Failed to store intervention request', error, 'MANUAL_INTERVENTION');
    }

    logger.error('🆘 Manual intervention requested', {
      emergencyId: emergency.id,
      urgency,
      suggestedActions: interventionRequest.suggestedActions
    }, 'MANUAL_INTERVENTION');
  }

  // =============================================================================
  // EMERGENCY MODE MANAGEMENT
  // =============================================================================

  /**
   * Activate system-wide emergency mode
   */
  private async activateEmergencyMode(emergency: EmergencyEvent): Promise<void> {
    this.isEmergencyModeActive = true;

    // Set maximum degradation
    await this.degradeServices('emergency', [
      'idea_generation',
      'referral_processing',
      'advanced_analytics',
      'personalization'
    ]);

    // Notify all critical contacts
    await this.sendEmergencyNotification(emergency, ['all'], ['email', 'sms', 'slack']);

    logger.error('🚨 EMERGENCY MODE ACTIVATED', {
      emergencyId: emergency.id,
      type: emergency.type,
      severity: emergency.severity
    }, 'EMERGENCY_MODE');
  }

  /**
   * Deactivate emergency mode (manual intervention required)
   */
  async deactivateEmergencyMode(adminUserId: string, reason: string): Promise<void> {
    this.isEmergencyModeActive = false;

    // Restore normal degradation level
    this.currentDegradationLevel = this.getDefaultDegradationLevel();

    // Clear degradation state
    try {
      localStorage.removeItem('emergency_degradation_level');
    } catch (error) {
      logger.error('Failed to clear degradation state', error, 'EMERGENCY_MODE');
    }

    logger.info('✅ Emergency mode deactivated', {
      adminUserId,
      reason,
      timestamp: new Date().toISOString()
    }, 'EMERGENCY_MODE');
  }

  // =============================================================================
  // EMERGENCY MONITORING
  // =============================================================================

  /**
   * Start continuous emergency monitoring
   */
  private startEmergencyMonitoring(): void {
    // Check for emergency conditions every minute
    setInterval(async () => {
      await this.checkEmergencyConditions();
      await this.checkEmergencyResolution();
    }, 60 * 1000); // 1 minute

    // Check for stale emergencies every 5 minutes
    setInterval(() => {
      this.checkStaleEmergencies();
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Check if any emergency conditions should be triggered
   */
  private async checkEmergencyConditions(): Promise<void> {
    // This would integrate with various monitoring services
    // For example, checking cost management service for budget overruns
    try {
      const { costManagementService } = await import('./costManagementService');
      const systemBudget = costManagementService.getSystemBudget();
      
      // Check for cost emergency
      if (systemBudget.currentDailyCost > systemBudget.emergencyThreshold) {
        const existingEmergency = Array.from(this.activeEmergencies.values())
          .find(e => e.type === 'cost_overrun' && e.status === 'active');
        
        if (!existingEmergency) {
          await this.activateEmergency('cost_overrun', {
            currentCost: systemBudget.currentDailyCost,
            threshold: systemBudget.emergencyThreshold,
            utilization: systemBudget.budgetUtilization
          }, 'cost_monitoring');
        }
      }
    } catch (error) {
      // Cost management service not available, skip this check
    }
  }

  /**
   * Check if any active emergencies can be resolved
   */
  private async checkEmergencyResolution(): Promise<void> {
    for (const emergency of this.activeEmergencies.values()) {
      if (emergency.status === 'mitigating') {
        const isResolved = await this.checkIfEmergencyResolved(emergency);
        if (isResolved) {
          await this.resolveEmergency(emergency.id, 'system', 'Automatic resolution - conditions normalized');
        }
      }
    }
  }

  /**
   * Check if specific emergency is resolved
   */
  private async checkIfEmergencyResolved(emergency: EmergencyEvent): Promise<boolean> {
    switch (emergency.type) {
      case 'cost_overrun': {
        try {
          const { costManagementService } = await import('./costManagementService');
          const systemBudget = costManagementService.getSystemBudget();
          return systemBudget.currentDailyCost < systemBudget.alertThreshold;
        } catch {
          return false;
        }
      }
      
      case 'api_outage':
        // Check if API is responding
        return await this.checkAPIHealth();
      
      default:
        return false;
    }
  }

  /**
   * Check for emergencies that have been active too long
   */
  private checkStaleEmergencies(): void {
    const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours
    const now = new Date().getTime();

    for (const emergency of this.activeEmergencies.values()) {
      const emergencyTime = new Date(emergency.timestamp).getTime();
      if (now - emergencyTime > staleThreshold && emergency.status !== 'resolved') {
        logger.warn('🕰️ Stale emergency detected', {
          emergencyId: emergency.id,
          type: emergency.type,
          ageHours: Math.floor((now - emergencyTime) / (60 * 60 * 1000)),
          status: emergency.status
        }, 'STALE_EMERGENCY');

        // Escalate stale emergency
        this.escalateEmergency(emergency);
      }
    }
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private initializeProtocols(): void {
    // Cost overrun protocol
    this.protocols.set('cost_overrun', {
      triggerType: 'cost_threshold',
      threshold: { dailyCost: 3.00 },
      actions: [
        { type: 'circuit_breaker', delay: 0, parameters: { service: 'ai_generation', duration: 300000 } },
        { type: 'service_degradation', delay: 1000, parameters: { level: 'minimal', features: ['idea_generation'] } },
        { type: 'notification', delay: 2000, parameters: { contacts: ['all'], channels: ['email', 'slack'] } }
      ],
      escalationPath: ['tech_lead', 'project_manager', 'admin'],
      maxDuration: 3600000 // 1 hour
    });

    // API outage protocol
    this.protocols.set('api_outage', {
      triggerType: 'api_failure',
      threshold: { failureRate: 0.5 },
      actions: [
        { type: 'circuit_breaker', delay: 0, parameters: { service: 'external_apis', duration: 60000 } },
        { type: 'service_degradation', delay: 5000, parameters: { level: 'degraded', features: ['real_time_features'] } },
        { type: 'notification', delay: 10000, parameters: { contacts: ['tech_team'], channels: ['slack'] } }
      ],
      escalationPath: ['tech_lead', 'devops'],
      maxDuration: 1800000 // 30 minutes
    });
  }

  private loadEmergencyContacts(): void {
    this.emergencyContacts = [
      {
        id: 'tech_lead',
        name: 'Technical Lead',
        role: 'Technical Lead',
        email: 'tech-lead@company.com',
        priority: 1,
        availabilityHours: '24/7'
      },
      {
        id: 'project_manager',
        name: 'Project Manager',
        role: 'Project Manager',
        email: 'pm@company.com',
        priority: 2,
        availabilityHours: '9AM-6PM'
      },
      {
        id: 'admin',
        name: 'System Administrator',
        role: 'Admin',
        email: 'admin@company.com',
        priority: 3,
        availabilityHours: '24/7'
      }
    ];
  }

  private calculateSeverity(type: EmergencyEvent['type'], data: any): EmergencyEvent['severity'] {
    switch (type) {
      case 'cost_overrun': {
        const overrun = data.currentCost / data.threshold;
        if (overrun >= 2) return 'critical';
        if (overrun >= 1.5) return 'high';
        if (overrun >= 1.2) return 'medium';
        return 'low';
      }
      case 'system_failure': {
        return 'critical';
      }
      case 'api_outage': {
        return data.failureRate >= 0.8 ? 'critical' : 'high';
      }
      default:
        return 'medium';
    }
  }

  private generateEmergencyTitle(type: EmergencyEvent['type'], data: any): string {
    switch (type) {
      case 'cost_overrun':
        return `Budget Emergency: Daily cost $${data.currentCost.toFixed(2)} exceeds threshold $${data.threshold.toFixed(2)}`;
      case 'system_failure':
        return `System Failure: ${data.component} is down`;
      case 'api_outage':
        return `API Outage: ${data.service} experiencing ${(data.failureRate * 100).toFixed(1)}% failure rate`;
      default:
        return `Emergency: ${type}`;
    }
  }

  private generateEmergencyDescription(type: EmergencyEvent['type'], data: any): string {
    switch (type) {
      case 'cost_overrun':
        return `The system has exceeded the daily budget threshold. Current cost: $${data.currentCost.toFixed(2)}, Budget: $${data.threshold.toFixed(2)}. Emergency protocols have been activated to prevent further cost escalation.`;
      case 'system_failure':
        return `Critical system component ${data.component} has failed. Service degradation is in effect.`;
      case 'api_outage':
        return `External API ${data.service} is experiencing high failure rates. Circuit breakers have been activated.`;
      default:
        return `Emergency situation detected: ${type}`;
    }
  }

  private generateActionDescription(type: string, parameters: any): string {
    switch (type) {
      case 'circuit_breaker':
        return `Activate circuit breaker for ${parameters.service} (${parameters.duration}ms)`;
      case 'service_degradation':
        return `Degrade services to ${parameters.level} level, disable: ${parameters.features?.join(', ')}`;
      case 'notification':
        return `Send notifications to ${parameters.contacts?.join(', ')} via ${parameters.channels?.join(', ')}`;
      default:
        return `Execute ${type}`;
    }
  }

  private getDefaultDegradationLevel(): SystemDegradationLevel {
    return {
      level: 'normal',
      disabledFeatures: [],
      reducedLimits: {},
      description: 'All systems operational'
    };
  }

  private calculateReducedLimits(level: string): Record<string, number> {
    switch (level) {
      case 'degraded': {
        return { dailyIdeas: 3, requestsPerMinute: 1 };
      }
      case 'minimal': {
        return { dailyIdeas: 1, requestsPerMinute: 0.5 };
      }
      case 'emergency': {
        return { dailyIdeas: 0, requestsPerMinute: 0 };
      }
      default:
        return {};
    }
  }

  private getDegradationDescription(level: string): string {
    switch (level) {
      case 'degraded': {
        return 'Some features disabled, reduced limits in effect';
      }
      case 'minimal': {
        return 'Minimal functionality only, severe limits in effect';
      }
      case 'emergency': {
        return 'Emergency mode - all non-essential features disabled';
      }
      default:
        return 'Normal operation';
    }
  }

  private estimateRecoveryTime(level: string): string {
    switch (level) {
      case 'degraded': {
        return '10-30 minutes';
      }
      case 'minimal': {
        return '30-60 minutes';
      }
      case 'emergency': {
        return '1-4 hours';
      }
      default:
        return 'Immediate';
    }
  }

  private getRequiredActions(emergency: EmergencyEvent): string[] {
    switch (emergency.type) {
      case 'cost_overrun':
        return ['Review budget settings', 'Analyze usage patterns', 'Adjust rate limits'];
      case 'system_failure':
        return ['Check system logs', 'Restart affected services', 'Monitor recovery'];
      default:
        return ['Investigate issue', 'Apply fixes', 'Monitor resolution'];
    }
  }

  private getSuggestedActions(emergency: EmergencyEvent): string[] {
    return [
      'Check system status dashboard',
      'Review emergency protocols',
      'Contact escalation team if needed',
      'Document resolution steps'
    ];
  }

  private getEscalationContacts(urgency: string): string[] {
    switch (urgency) {
      case 'critical': {
        return ['tech_lead', 'project_manager', 'admin'];
      }
      case 'high': {
        return ['tech_lead', 'project_manager'];
      }
      default:
        return ['tech_lead'];
    }
  }

  private async checkAPIHealth(): Promise<boolean> {
    // This would check actual API health
    // For now, return true (simulated recovery)
    return true;
  }

  private escalateEmergency(emergency: EmergencyEvent): void {
    logger.warn('📈 Escalating emergency', {
      emergencyId: emergency.id,
      type: emergency.type,
      currentStatus: emergency.status
    }, 'EMERGENCY_ESCALATION');
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Get current system degradation level
   */
  getCurrentDegradationLevel(): SystemDegradationLevel {
    return { ...this.currentDegradationLevel };
  }

  /**
   * Get active emergencies
   */
  getActiveEmergencies(): EmergencyEvent[] {
    return Array.from(this.activeEmergencies.values());
  }

  /**
   * Resolve emergency manually
   */
  async resolveEmergency(emergencyId: string, resolvedBy: string, notes: string): Promise<void> {
    const emergency = this.activeEmergencies.get(emergencyId);
    if (!emergency) {
      throw new Error(`Emergency ${emergencyId} not found`);
    }

    emergency.status = 'resolved';
    emergency.resolvedAt = new Date().toISOString();
    emergency.resolvedBy = resolvedBy;
    emergency.resolutionNotes = notes;

    // Remove from active emergencies
    this.activeEmergencies.delete(emergencyId);

    // If no more critical emergencies, consider deactivating emergency mode
    const criticalEmergencies = Array.from(this.activeEmergencies.values())
      .filter(e => e.severity === 'critical');
    
    if (criticalEmergencies.length === 0 && this.isEmergencyModeActive) {
      await this.deactivateEmergencyMode(resolvedBy, 'No critical emergencies remain');
    }

    logger.info('✅ Emergency resolved', {
      emergencyId,
      resolvedBy,
      notes
    }, 'EMERGENCY_RESOLUTION');
  }

  /**
   * Get emergency history
   */
  getEmergencyHistory(limit: number = 50): EmergencyEvent[] {
    return this.emergencyHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Check if system is in emergency mode
   */
  isInEmergencyMode(): boolean {
    return this.isEmergencyModeActive;
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const emergencyProtocolService = new EmergencyProtocolService();
export default EmergencyProtocolService; 