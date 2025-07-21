/**
 * 🔐 SECURITY DASHBOARD V9.0
 * 
 * Dashboard para monitoramento de segurança e eventos
 * Interface para administradores visualizarem atividades suspeitas
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification SEC-DASH-001
 * @author IA Beta - Security UI Architect
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Clock,
  Users,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { securityService, SecurityEvent, SecurityEventType } from '../../services/security/securityService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SecurityStats {
  activeSessions: number;
  recentEvents: number;
  rateLimitedIPs: number;
  securityScore: number;
}

interface EventFilter {
  type?: SecurityEventType;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timeRange: '1h' | '24h' | '7d' | '30d';
}

// ============================================================================
// SECURITY DASHBOARD COMPONENT
// ============================================================================

export const SecurityDashboard: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [stats, setStats] = useState<SecurityStats>({
    activeSessions: 0,
    recentEvents: 0,
    rateLimitedIPs: 0,
    securityScore: 100
  });
  
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [filter, setFilter] = useState<EventFilter>({
    timeRange: '24h'
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchSecurityData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas
      const currentStats = securityService.getSecurityStats();
      setStats(currentStats);
      
      // Buscar eventos baseado no filtro
      const now = new Date();
      let startDate: Date;
      
      switch (filter.timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
      
      const securityEvents = securityService.getSecurityEvents({
        type: filter.type,
        severity: filter.severity,
        startDate,
        limit: 100
      });
      
      setEvents(securityEvents);
      
    } catch (error) {
      console.error('Erro ao buscar dados de segurança:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchSecurityData]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFilterChange = useCallback((newFilter: Partial<EventFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const handleRefresh = useCallback(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSecurityScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type: SecurityEventType) => {
    switch (type) {
      case 'login_success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'login_failure': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'rate_limit_exceeded': return <Ban className="w-4 h-4 text-orange-600" />;
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'unauthorized_access': return <Shield className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatEventType = (type: SecurityEventType) => {
    const types: Record<SecurityEventType, string> = {
      'login_attempt': 'Tentativa de Login',
      'login_success': 'Login Realizado',
      'login_failure': 'Falha no Login',
      'logout': 'Logout',
      'password_change': 'Alteração de Senha',
      'account_locked': 'Conta Bloqueada',
      'suspicious_activity': 'Atividade Suspeita',
      'rate_limit_exceeded': 'Limite Excedido',
      'unauthorized_access': 'Acesso Não Autorizado',
      'session_expired': 'Sessão Expirada',
      'admin_action': 'Ação Administrativa'
    };
    return types[type] || type;
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard de Segurança</h1>
            <p className="text-gray-600">Monitoramento em tempo real de eventos de segurança</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score de Segurança</p>
              <p className={`text-2xl font-bold ${getSecurityScoreColor(stats.securityScore)}`}>
                {stats.securityScore}%
              </p>
            </div>
            {getSecurityScoreIcon(stats.securityScore)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sessões Ativas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeSessions}</p>
            </div>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Eventos Recentes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.recentEvents}</p>
            </div>
            <Activity className="w-5 h-5 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">IPs Bloqueados</p>
              <p className="text-2xl font-bold text-red-600">{stats.rateLimitedIPs}</p>
            </div>
            <Ban className="w-5 h-5 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros de Eventos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={filter.timeRange}
              onChange={(e) => handleFilterChange({ timeRange: e.target.value as EventFilter['timeRange'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Última hora</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Evento
            </label>
            <select
              value={filter.type || ''}
              onChange={(e) => handleFilterChange({ type: e.target.value as SecurityEventType || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              <option value="login_success">Login Realizado</option>
              <option value="login_failure">Falha no Login</option>
              <option value="rate_limit_exceeded">Limite Excedido</option>
              <option value="suspicious_activity">Atividade Suspeita</option>
              <option value="unauthorized_access">Acesso Não Autorizado</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severidade
            </label>
            <select
              value={filter.severity || ''}
              onChange={(e) => handleFilterChange({ severity: e.target.value as SecurityEvent['severity'] || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as severidades</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Events List */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Eventos de Segurança ({events.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Nenhum evento encontrado para os filtros selecionados</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {getEventIcon(event.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {formatEventType(event.type)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.email && `Email: ${event.email}`}
                      {event.userId && ` • ID: ${event.userId}`}
                      {` • IP: ${event.ip}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {event.timestamp.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SecurityDashboard;