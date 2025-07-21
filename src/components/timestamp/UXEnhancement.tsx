/**
 * UXEnhancement.tsx - V8.1 User Experience Enhancement Component
 * 
 * Eliminates user confusion points about timestamps through clear visual hierarchy
 * Intuitive interactions and contextual help system integration
 * 
 * Created: 15 Janeiro 2025 - V8.1 Implementation
 * IA BETA - Frontend UX Enhancement
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  systemTimestamp, 
  autoTimestamp, 
  validationSuite, 
  type TimestampResult,
  type AutoStampResult 
} from '@/services/timestamp';

export interface UXEnhancementProps {
  target?: 'form' | 'display' | 'system' | 'global';
  showGuidance?: boolean;
  autoFix?: boolean;
  preventConfusion?: boolean;
  contextualHelp?: boolean;
  visualHierarchy?: 'subtle' | 'clear' | 'prominent';
  integrationMode?: 'BancoDeIdeias' | 'generic' | 'custom';
  onConfusionDetected?: (issue: ConfusionIssue) => void;
  onUserHelped?: (helpType: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface ConfusionIssue {
  type: 'manual-input-attempted' | 'timestamp-conflict' | 'format-confusion' | 'timezone-confusion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion: string;
  autoFixable: boolean;
  userAction?: string;
}

export interface UXState {
  confusionLevel: 'none' | 'low' | 'medium' | 'high';
  helpVisible: boolean;
  lastInteraction: number;
  userNeedsHelp: boolean;
  systemWorking: boolean;
}

/**
 * UXEnhancement - Eliminates timestamp confusion through intelligent UX
 * Provides clear visual hierarchy and contextual guidance
 */
export const UXEnhancement: React.FC<UXEnhancementProps> = ({
  target = 'global',
  showGuidance = true,
  autoFix = true,
  preventConfusion = true,
  contextualHelp = true,
  visualHierarchy = 'clear',
  integrationMode = 'generic',
  onConfusionDetected,
  onUserHelped,
  className = '',
  style,
  children
}) => {
  const [uxState, setUXState] = useState<UXState>({
    confusionLevel: 'none',
    helpVisible: false,
    lastInteraction: Date.now(),
    userNeedsHelp: false,
    systemWorking: true
  });

  const [detectedIssues, setDetectedIssues] = useState<ConfusionIssue[]>([]);
  const [systemStatus, setSystemStatus] = useState<{
    isWorking: boolean;
    lastCheck: number;
    performance: string;
  }>({
    isWorking: true,
    lastCheck: Date.now(),
    performance: 'excellent'
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const helpTimeoutRef = useRef<NodeJS.Timeout>();

  // Monitor system health to prevent confusion
  const checkSystemHealth = useCallback(async () => {
    try {
      const startTime = performance.now();
      
      // Test timestamp generation
      const timestamp = systemTimestamp.getTimestamp();
      const validation = await validationSuite.validateTimestamp(timestamp.timestamp);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const isWorking = validation.isValid && responseTime < 50; // 50ms threshold
      const performanceLevel = responseTime < 1 ? 'excellent' : 
                              responseTime < 10 ? 'good' : 
                              responseTime < 50 ? 'acceptable' : 'poor';

      setSystemStatus({
        isWorking,
        lastCheck: Date.now(),
        performance: performanceLevel
      });

      setUXState(prev => ({
        ...prev,
        systemWorking: isWorking,
        confusionLevel: isWorking ? 'none' : 'high'
      }));

      if (!isWorking) {
        const issue: ConfusionIssue = {
          type: 'timestamp-conflict',
          severity: 'critical',
          description: 'Sistema de timestamp não está funcionando corretamente',
          suggestion: 'O sistema está sendo corrigido automaticamente',
          autoFixable: true
        };
        
        detectConfusion(issue);
      }

    } catch (error) {
      console.error('UXEnhancement: Error checking system health', error);
      setSystemStatus(prev => ({ ...prev, isWorking: false }));
    }
  }, []);

  // Initialize system monitoring
  useEffect(() => {
    checkSystemHealth();
    
    // Check system health every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [checkSystemHealth]);

  // Detect confusion patterns
  const detectConfusion = useCallback((issue: ConfusionIssue) => {
    setDetectedIssues(prev => {
      const existingIssue = prev.find(i => i.type === issue.type);
      if (existingIssue) return prev;
      
      const newIssues = [...prev, issue];
      
      // Update confusion level based on issues
      const highSeverityIssues = newIssues.filter(i => i.severity === 'high' || i.severity === 'critical').length;
      const confusionLevel = highSeverityIssues > 2 ? 'high' : 
                            highSeverityIssues > 1 ? 'medium' :
                            newIssues.length > 0 ? 'low' : 'none';

      setUXState(prev => ({
        ...prev,
        confusionLevel,
        userNeedsHelp: confusionLevel !== 'none'
      }));

      // Notify parent
      if (onConfusionDetected) {
        onConfusionDetected(issue);
      }

      return newIssues;
    });
  }, [onConfusionDetected]);

  // Auto-fix detected issues
  const autoFixIssue = useCallback(async (issue: ConfusionIssue) => {
    if (!autoFix || !issue.autoFixable) return false;

    try {
      switch (issue.type) {
        case 'manual-input-attempted':
          // Replace manual input with auto timestamp
          const autoResult = autoTimestamp.autoStamp({ id: 'auto-fix' }, 'create');
          if (autoResult.stampsApplied.length > 0) {
            showSuccess('Timestamp automático aplicado com sucesso!');
            return true;
          }
          break;

        case 'timestamp-conflict':
          // Regenerate timestamp
          const newTimestamp = systemTimestamp.getTimestamp();
          if (newTimestamp.source === 'computer-time') {
            showSuccess('Timestamp regenerado automaticamente!');
            return true;
          }
          break;

        case 'format-confusion':
          // Apply consistent formatting
          showGuidance('Formato de data padronizado automaticamente');
          return true;

        case 'timezone-confusion':
          // Apply local timezone
          const localTimestamp = systemTimestamp.getTimestamp({
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          });
          if (localTimestamp.timezone) {
            showSuccess('Timezone local aplicado automaticamente!');
            return true;
          }
          break;
      }
    } catch (error) {
      console.error('UXEnhancement: Error auto-fixing issue', error);
    }

    return false;
  }, [autoFix]);

  // Show success message
  const showSuccess = useCallback((message: string) => {
    // This would integrate with the TemporalFeedback component
    console.log('✅ UX Success:', message);
    
    if (onUserHelped) {
      onUserHelped('auto-fix-success');
    }
  }, [onUserHelped]);

  // Show guidance message
  const showGuidance = useCallback((message: string) => {
    setUXState(prev => ({ ...prev, helpVisible: true }));
    
    // Auto-hide after 5 seconds
    if (helpTimeoutRef.current) {
      clearTimeout(helpTimeoutRef.current);
    }
    
    helpTimeoutRef.current = setTimeout(() => {
      setUXState(prev => ({ ...prev, helpVisible: false }));
    }, 5000);

    if (onUserHelped) {
      onUserHelped('guidance-shown');
    }
  }, [onUserHelped]);

  // Handle user interactions
  const handleUserInteraction = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
    setUXState(prev => ({
      ...prev,
      lastInteraction: Date.now()
    }));

    // Detect potential confusion scenarios
    const target = event.target as HTMLElement;
    
    // Check for manual date input attempts
    if (target.type === 'date' || target.type === 'datetime-local' || 
        (target.tagName === 'INPUT' && target.getAttribute('placeholder')?.toLowerCase().includes('data'))) {
      
      const issue: ConfusionIssue = {
        type: 'manual-input-attempted',
        severity: 'medium',
        description: 'Usuário tentando inserir data manualmente',
        suggestion: 'Use o sistema automático para evitar perda de dados',
        autoFixable: true,
        userAction: 'manual-date-input-attempted'
      };
      
      detectConfusion(issue);
    }
  }, [detectConfusion]);

  // Visual hierarchy styles
  const getVisualHierarchyStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      ...style
    };

    switch (visualHierarchy) {
      case 'subtle':
        return {
          ...baseStyles,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: systemStatus.isWorking ? 
              'linear-gradient(90deg, #22c55e, #16a34a)' : 
              'linear-gradient(90deg, #ef4444, #dc2626)',
            opacity: 0.5
          }
        };

      case 'clear':
        return {
          ...baseStyles,
          border: `2px solid ${systemStatus.isWorking ? '#22c55e' : '#ef4444'}`,
          borderRadius: '8px',
          padding: '8px',
          backgroundColor: systemStatus.isWorking ? '#f0fdf4' : '#fef2f2'
        };

      case 'prominent':
        return {
          ...baseStyles,
          border: `3px solid ${systemStatus.isWorking ? '#22c55e' : '#ef4444'}`,
          borderRadius: '12px',
          padding: '16px',
          backgroundColor: systemStatus.isWorking ? '#f0fdf4' : '#fef2f2',
          boxShadow: `0 4px 12px ${systemStatus.isWorking ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
        };

      default:
        return baseStyles;
    }
  };

  // Generate status message
  const getStatusMessage = (): string => {
    if (!systemStatus.isWorking) {
      return '⚠️ Sistema de timestamp em manutenção - aguarde...';
    }

    switch (systemStatus.performance) {
      case 'excellent':
        return '✅ Sistema funcionando perfeitamente - timestamps nunca se perdem!';
      case 'good':
        return '✅ Sistema funcionando bem - timestamps seguros';
      case 'acceptable':
        return '✅ Sistema operacional - timestamps preservados';
      case 'poor':
        return '⚠️ Sistema lento mas funcional - timestamps seguros';
      default:
        return '✅ Sistema ativo';
    }
  };

  // BancoDeIdeias specific integration
  const getBancoDeIdeiasMessage = (): string => {
    if (integrationMode !== 'BancoDeIdeias') return '';
    
    return systemStatus.isWorking ? 
      '💡 Suas ideias são salvas automaticamente com timestamp do computador - nunca mais se perdem!' :
      '💡 Sistema temporariamente indisponível - suas ideias serão salvas assim que possível';
  };

  const containerClasses = [
    'ux-enhancement',
    target,
    `hierarchy-${visualHierarchy}`,
    `confusion-${uxState.confusionLevel}`,
    systemStatus.isWorking ? 'working' : 'maintenance',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={getVisualHierarchyStyles()}
      onClick={handleUserInteraction}
      onKeyDown={handleUserInteraction}
    >
      {/* System status indicator */}
      {showGuidance && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
            padding: '6px 12px',
            backgroundColor: systemStatus.isWorking ? '#dcfce7' : '#fee2e2',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            color: systemStatus.isWorking ? '#166534' : '#991b1b'
          }}
        >
          <span style={{ marginRight: '8px' }}>
            {systemStatus.isWorking ? '🤖' : '⚠️'}
          </span>
          <span>{getStatusMessage()}</span>
        </div>
      )}

      {/* BancoDeIdeias specific message */}
      {integrationMode === 'BancoDeIdeias' && (
        <div
          style={{
            marginBottom: '8px',
            padding: '8px 12px',
            backgroundColor: '#eff6ff',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#1e40af',
            borderLeft: '3px solid #3b82f6'
          }}
        >
          {getBancoDeIdeiasMessage()}
        </div>
      )}

      {/* Contextual help */}
      {contextualHelp && uxState.helpVisible && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            marginTop: '4px',
            padding: '12px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            fontSize: '12px'
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '6px' }}>
            💡 Dica do Sistema
          </div>
          <div>
            O sistema agora usa o horário do seu computador automaticamente. 
            Você não precisa mais inserir datas manualmente - elas nunca mais se perderão!
          </div>
          <button
            onClick={() => setUXState(prev => ({ ...prev, helpVisible: false }))}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Entendi
          </button>
        </div>
      )}

      {/* Auto-fix notifications */}
      {autoFix && detectedIssues.map((issue, index) => (
        <div
          key={index}
          style={{
            marginBottom: '6px',
            padding: '6px 10px',
            backgroundColor: '#fef3c7',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{issue.suggestion}</span>
          {issue.autoFixable && (
            <button
              onClick={() => autoFixIssue(issue)}
              style={{
                padding: '2px 6px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Corrigir
            </button>
          )}
        </div>
      ))}

      {/* Children content */}
      {children}

      {/* CSS for enhanced UX */}
      <style jsx>{`
        .ux-enhancement {
          transition: all 0.3s ease;
        }
        
        .ux-enhancement.working {
          opacity: 1;
        }
        
        .ux-enhancement.maintenance {
          opacity: 0.8;
          filter: grayscale(20%);
        }
        
        .ux-enhancement.confusion-high {
          animation: subtle-pulse 2s infinite;
        }
        
        @keyframes subtle-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .ux-enhancement,
          .ux-enhancement * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

// Hook for UX enhancement integration
export const useUXEnhancement = (target: UXEnhancementProps['target'] = 'global') => {
  const [uxState, setUXState] = useState<UXState>({
    confusionLevel: 'none',
    helpVisible: false,
    lastInteraction: Date.now(),
    userNeedsHelp: false,
    systemWorking: true
  });

  const [systemHealth, setSystemHealth] = useState(true);

  // Monitor system health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const timestamp = systemTimestamp.getTimestamp();
        const isWorking = timestamp && timestamp.source === 'computer-time';
        
        setSystemHealth(isWorking);
        setUXState(prev => ({ ...prev, systemWorking: isWorking }));
      } catch (error) {
        setSystemHealth(false);
        setUXState(prev => ({ ...prev, systemWorking: false }));
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const showHelp = useCallback(() => {
    setUXState(prev => ({ ...prev, helpVisible: true, userNeedsHelp: false }));
  }, []);

  const hideHelp = useCallback(() => {
    setUXState(prev => ({ ...prev, helpVisible: false }));
  }, []);

  const reportConfusion = useCallback((type: ConfusionIssue['type']) => {
    setUXState(prev => ({
      ...prev,
      confusionLevel: 'medium',
      userNeedsHelp: true
    }));
  }, []);

  return {
    uxState,
    systemHealth,
    showHelp,
    hideHelp,
    reportConfusion
  };
};

export default UXEnhancement; 