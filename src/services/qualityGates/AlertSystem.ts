// Multi-Channel Alert System
import { Alert } from './HealthMonitoringSystem';

interface AlertChannel {
  name: string;
  send(alert: Alert): Promise<void>;
  isAvailable(): boolean;
  priority: number;
}

interface AlertRule {
  id: string;
  name: string;
  condition: (alert: Alert) => boolean;
  channels: string[];
  throttleMs: number;
  escalation?: EscalationRule;
}

interface EscalationRule {
  afterMs: number;
  toChannels: string[];
  severity: 'high' | 'critical';
}

interface AlertHistory {
  alert: Alert;
  channels: string[];
  success: boolean;
  timestamp: string;
  responseTime: number;
}

export class AlertSystem {
  private alertChannels: Map<string, AlertChannel> = new Map();
  private alertRules: AlertRule[] = [];
  private alertHistory: AlertHistory[] = [];
  private throttleMap: Map<string, number> = new Map();
  private pendingEscalations: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    this.setupAlertChannels();
    this.setupAlertRules();
  }
  
  private setupAlertChannels(): void {
    // Console Alert Channel (always available for development)
    this.alertChannels.set('console', new ConsoleAlertChannel());
    
    // Browser Notification Channel
    this.alertChannels.set('notification', new BrowserNotificationChannel());
    
    // Local Storage Channel (for persistence)
    this.alertChannels.set('storage', new LocalStorageAlertChannel());
    
    // Email Channel (placeholder - would need backend integration)
    this.alertChannels.set('email', new EmailAlertChannel());
    
    // Slack Channel (placeholder - would need integration)
    this.alertChannels.set('slack', new SlackAlertChannel());
    
    // Webhook Channel (for external integrations)
    this.alertChannels.set('webhook', new WebhookAlertChannel());
    
    console.log(`📢 Alert system initialized with ${this.alertChannels.size} channels`);
  }
  
  private setupAlertRules(): void {
    this.alertRules = [
      {
        id: 'critical-system-failure',
        name: 'Critical System Failure',
        condition: (alert) => alert.severity === 'critical',
        channels: ['console', 'notification', 'storage', 'email'],
        throttleMs: 60000, // 1 minute
        escalation: {
          afterMs: 300000, // 5 minutes
          toChannels: ['slack', 'webhook'],
          severity: 'critical'
        }
      },
      {
        id: 'high-priority-alert',
        name: 'High Priority Alert',
        condition: (alert) => alert.severity === 'high',
        channels: ['console', 'notification', 'storage'],
        throttleMs: 120000, // 2 minutes
        escalation: {
          afterMs: 600000, // 10 minutes
          toChannels: ['email'],
          severity: 'high'
        }
      },
      {
        id: 'medium-priority-alert',
        name: 'Medium Priority Alert',
        condition: (alert) => alert.severity === 'medium',
        channels: ['console', 'storage'],
        throttleMs: 300000, // 5 minutes
      },
      {
        id: 'monitoring-system-events',
        name: 'Monitoring System Events',
        condition: (alert) => alert.type.includes('monitoring'),
        channels: ['console', 'storage'],
        throttleMs: 0, // No throttling for system events
      },
      {
        id: 'health-check-failures',
        name: 'Health Check Failures',
        condition: (alert) => alert.type.includes('health_check'),
        channels: ['console', 'notification', 'storage'],
        throttleMs: 180000, // 3 minutes
      },
      {
        id: 'quality-gate-failures',
        name: 'Quality Gate Failures',
        condition: (alert) => alert.type.includes('quality_gate'),
        channels: ['console', 'notification', 'storage', 'email'],
        throttleMs: 0, // No throttling for quality gates
        escalation: {
          afterMs: 180000, // 3 minutes
          toChannels: ['slack'],
          severity: 'high'
        }
      }
    ];
    
    console.log(`📋 Alert rules configured: ${this.alertRules.length} rules`);
  }
  
  async triggerAlert(alert: Alert): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`🚨 Processing alert: ${alert.type} [${alert.severity.toUpperCase()}]`);
      
      // Find matching rules
      const matchingRules = this.alertRules.filter(rule => rule.condition(alert));
      
      if (matchingRules.length === 0) {
        console.log('⚠️ No matching rules found for alert, using default handling');
        await this.sendToDefaultChannels(alert);
        return;
      }
      
      // Process each matching rule
      for (const rule of matchingRules) {
        await this.processAlertRule(alert, rule);
      }
      
      // Record in history
      const responseTime = Date.now() - startTime;
      this.recordAlertHistory(alert, matchingRules, true, responseTime);
      
      console.log(`✅ Alert processed successfully in ${responseTime}ms`);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Error processing alert:', error);
      
      // Record failure in history
      this.recordAlertHistory(alert, [], false, responseTime);
      
      // Try to send error notification via console at least
      try {
        await this.alertChannels.get('console')?.send({
          ...alert,
          type: 'alert_system_error',
          message: `Alert system error: ${error instanceof Error ? error.message : String(error)}`
        });
      } catch (fallbackError) {
        console.error('❌ Even fallback alert failed:', fallbackError);
      }
    }
  }
  
  private async processAlertRule(alert: Alert, rule: AlertRule): Promise<void> {
    // Check throttling
    if (this.isThrottled(alert, rule)) {
      console.log(`⏱️ Alert throttled for rule: ${rule.name}`);
      return;
    }
    
    // Send to configured channels
    const channelPromises = rule.channels.map(async (channelName) => {
      const channel = this.alertChannels.get(channelName);
      if (!channel) {
        console.warn(`⚠️ Channel not found: ${channelName}`);
        return;
      }
      
      if (!channel.isAvailable()) {
        console.warn(`⚠️ Channel not available: ${channelName}`);
        return;
      }
      
      try {
        await channel.send(alert);
        console.log(`📤 Alert sent via ${channelName}`);
      } catch (error) {
        console.error(`❌ Failed to send alert via ${channelName}:`, error);
      }
    });
    
    await Promise.allSettled(channelPromises);
    
    // Update throttle
    this.updateThrottle(alert, rule);
    
    // Setup escalation if configured
    if (rule.escalation && alert.severity !== 'low') {
      this.setupEscalation(alert, rule);
    }
  }
  
  private async sendToDefaultChannels(alert: Alert): Promise<void> {
    // Default channels based on severity
    const defaultChannels = this.getDefaultChannelsForSeverity(alert.severity);
    
    const channelPromises = defaultChannels.map(async (channelName) => {
      const channel = this.alertChannels.get(channelName);
      if (channel && channel.isAvailable()) {
        try {
          await channel.send(alert);
        } catch (error) {
          console.error(`❌ Failed to send to default channel ${channelName}:`, error);
        }
      }
    });
    
    await Promise.allSettled(channelPromises);
  }
  
  private getDefaultChannelsForSeverity(severity: string): string[] {
    switch (severity) {
      case 'critical':
        return ['console', 'notification', 'storage'];
      case 'high':
        return ['console', 'notification', 'storage'];
      case 'medium':
        return ['console', 'storage'];
      case 'low':
      default:
        return ['console'];
    }
  }
  
  private isThrottled(alert: Alert, rule: AlertRule): boolean {
    if (rule.throttleMs === 0) return false;
    
    const throttleKey = `${rule.id}-${alert.type}`;
    const lastSent = this.throttleMap.get(throttleKey);
    
    if (!lastSent) return false;
    
    return (Date.now() - lastSent) < rule.throttleMs;
  }
  
  private updateThrottle(alert: Alert, rule: AlertRule): void {
    if (rule.throttleMs === 0) return;
    
    const throttleKey = `${rule.id}-${alert.type}`;
    this.throttleMap.set(throttleKey, Date.now());
  }
  
  private setupEscalation(alert: Alert, rule: AlertRule): void {
    if (!rule.escalation) return;
    
    const escalationKey = `${rule.id}-${alert.type}-${alert.timestamp}`;
    
    // Clear any existing escalation
    const existingTimeout = this.pendingEscalations.get(escalationKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Setup new escalation
    const timeout = setTimeout(async () => {
      console.log(`🔺 Escalating alert: ${alert.type}`);
      
      const escalatedAlert: Alert = {
        ...alert,
        type: `escalated_${alert.type}`,
        severity: rule.escalation!.severity,
        message: `ESCALATED: ${alert.message}`,
        timestamp: new Date().toISOString()
      };
      
      // Send to escalation channels
      const escalationPromises = rule.escalation!.toChannels.map(async (channelName) => {
        const channel = this.alertChannels.get(channelName);
        if (channel && channel.isAvailable()) {
          try {
            await channel.send(escalatedAlert);
            console.log(`🔺 Escalated alert sent via ${channelName}`);
          } catch (error) {
            console.error(`❌ Failed to send escalated alert via ${channelName}:`, error);
          }
        }
      });
      
      await Promise.allSettled(escalationPromises);
      
      // Remove from pending escalations
      this.pendingEscalations.delete(escalationKey);
      
    }, rule.escalation.afterMs);
    
    this.pendingEscalations.set(escalationKey, timeout);
    console.log(`⏰ Escalation scheduled for ${rule.escalation.afterMs}ms`);
  }
  
  private recordAlertHistory(alert: Alert, rules: AlertRule[], success: boolean, responseTime: number): void {
    const channels = rules.flatMap(rule => rule.channels);
    
    const historyEntry: AlertHistory = {
      alert,
      channels: [...new Set(channels)], // Remove duplicates
      success,
      timestamp: new Date().toISOString(),
      responseTime
    };
    
    this.alertHistory.push(historyEntry);
    
    // Keep only last 1000 entries
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }
  }
  
  // Public methods for monitoring and management
  public getAlertHistory(limit: number = 50): AlertHistory[] {
    return this.alertHistory.slice(-limit);
  }
  
  public getChannelStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    
    this.alertChannels.forEach((channel, name) => {
      status[name] = channel.isAvailable();
    });
    
    return status;
  }
  
  public clearThrottling(): void {
    this.throttleMap.clear();
    console.log('🧹 Alert throttling cleared');
  }
  
  public clearEscalations(): void {
    this.pendingEscalations.forEach(timeout => clearTimeout(timeout));
    this.pendingEscalations.clear();
    console.log('🧹 Pending escalations cleared');
  }
  
  public addAlertChannel(name: string, channel: AlertChannel): void {
    this.alertChannels.set(name, channel);
    console.log(`📢 Alert channel added: ${name}`);
  }
  
  public removeAlertChannel(name: string): void {
    this.alertChannels.delete(name);
    console.log(`🗑️ Alert channel removed: ${name}`);
  }
  
  public getAlertStats(): any {
    const now = Date.now();
    const last24h = this.alertHistory.filter(entry => 
      now - new Date(entry.timestamp).getTime() < 24 * 60 * 60 * 1000
    );
    
    const severityCount = last24h.reduce((acc, entry) => {
      acc[entry.alert.severity] = (acc[entry.alert.severity] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const avgResponseTime = last24h.length > 0 
      ? last24h.reduce((sum, entry) => sum + entry.responseTime, 0) / last24h.length 
      : 0;
    
    return {
      total24h: last24h.length,
      severityCount,
      avgResponseTime: Math.round(avgResponseTime),
      successRate: last24h.length > 0 
        ? (last24h.filter(entry => entry.success).length / last24h.length) * 100 
        : 100,
      activeChannels: Array.from(this.alertChannels.keys()).filter(name => 
        this.alertChannels.get(name)?.isAvailable()
      ),
      pendingEscalations: this.pendingEscalations.size
    };
  }
}

// Alert Channel Implementations

class ConsoleAlertChannel implements AlertChannel {
  name = 'console';
  priority = 1;
  
  async send(alert: Alert): Promise<void> {
    const emoji = this.getSeverityEmoji(alert.severity);
    const timestamp = new Date(alert.timestamp).toLocaleTimeString();
    
    console.log(`\n${emoji} ALERT [${alert.severity.toUpperCase()}] - ${timestamp}`);
    console.log(`📝 Type: ${alert.type}`);
    console.log(`💬 Message: ${alert.message}`);
    if (alert.details) {
      console.log(`📊 Details:`, alert.details);
    }
    console.log(`⏰ Timestamp: ${alert.timestamp}\n`);
  }
  
  isAvailable(): boolean {
    return true; // Console is always available
  }
  
  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔶';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  }
}

class BrowserNotificationChannel implements AlertChannel {
  name = 'notification';
  priority = 2;
  
  async send(alert: Alert): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Browser notifications not available');
    }
    
    const title = `Alert: ${alert.type}`;
    const options = {
      body: alert.message,
      icon: this.getSeverityIcon(alert.severity),
      badge: '/icons/badge-72x72.png',
      tag: alert.type,
      requireInteraction: alert.severity === 'critical',
      timestamp: new Date(alert.timestamp).getTime()
    };
    
    new Notification(title, options);
  }
  
  isAvailable(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }
  
  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '/icons/alert-critical.png';
      case 'high': return '/icons/alert-high.png';
      case 'medium': return '/icons/alert-medium.png';
      default: return '/icons/alert-info.png';
    }
  }
}

class LocalStorageAlertChannel implements AlertChannel {
  name = 'storage';
  priority = 3;
  private storageKey = 'roteirar-alerts';
  
  async send(alert: Alert): Promise<void> {
    try {
      const stored = this.getStoredAlerts();
      stored.push({
        ...alert,
        storedAt: new Date().toISOString()
      });
      
      // Keep only last 100 alerts
      if (stored.length > 100) {
        stored.splice(0, stored.length - 100);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(stored));
    } catch (error) {
      throw new Error(`Failed to store alert: ${error}`);
    }
  }
  
  isAvailable(): boolean {
    try {
      const testKey = 'test-storage';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
  
  private getStoredAlerts(): any[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

class EmailAlertChannel implements AlertChannel {
  name = 'email';
  priority = 4;
  
  async send(alert: Alert): Promise<void> {
    // Placeholder for email integration
    // In a real implementation, this would send HTTP request to backend
    console.log(`📧 Email alert would be sent: ${alert.message}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  isAvailable(): boolean {
    // In a real implementation, check if email service is configured
    return false; // Disabled for now
  }
}

class SlackAlertChannel implements AlertChannel {
  name = 'slack';
  priority = 5;
  
  async send(alert: Alert): Promise<void> {
    // Placeholder for Slack integration
    console.log(`💬 Slack alert would be sent: ${alert.message}`);
    
    // Simulate Slack API call delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  isAvailable(): boolean {
    // In a real implementation, check if Slack webhook is configured
    return false; // Disabled for now
  }
}

class WebhookAlertChannel implements AlertChannel {
  name = 'webhook';
  priority = 6;
  
  async send(alert: Alert): Promise<void> {
    // Placeholder for webhook integration
    console.log(`🔗 Webhook alert would be sent: ${alert.message}`);
    
    // Simulate webhook call delay
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  isAvailable(): boolean {
    // In a real implementation, check if webhook URL is configured
    return false; // Disabled for now
  }
} 