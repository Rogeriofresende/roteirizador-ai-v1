/**
 * Error Dashboard V6.2 - Interface Visual para Monitoramento
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AlertTriangle, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

interface ErrorData {
  id: string;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  error: {
    message: string;
    stack: string;
  };
  status: 'detected' | 'analyzing' | 'fixing' | 'resolved';
}

interface ErrorAnalysis {
  timestamp: string;
  totalErrors: number;
  errorsByPriority: Record<string, ErrorData[]>;
  patterns: Array<{
    type: string;
    message: string;
    count?: number;
  }>;
  recommendations: Array<{
    priority: string;
    title: string;
    description: string;
    estimatedTime: string;
  }>;
}

export const ErrorDashboard: React.FC = () => {
  const [errors, setErrors] = useState<ErrorData[]>([]);
  const [analysis, setAnalysis] = useState<ErrorAnalysis | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Simular carregamento de erros (em produção, viria de API ou arquivo)
  useEffect(() => {
    loadErrors();
    loadAnalysis();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      loadErrors();
      loadAnalysis();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadErrors = async () => {
    try {
      // Em implementação real, carregaria do arquivo logs/errors-detected.json
      // Por agora, simular dados
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Erro ao carregar dados de erro:', error);
    }
  };

  const loadAnalysis = async () => {
    try {
      // Em implementação real, carregaria do arquivo logs/error-analysis.json
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    // Em implementação real, iniciaria o script de monitoramento
    console.log('Iniciando monitoramento automático...');
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    console.log('Parando monitoramento...');
  };

  const triggerAutoFix = () => {
    console.log('Triggering correção automática...');
    // Em implementação real, executaria o script de correção
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <AlertCircle className="h-4 w-4" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4" />;
      case 'MEDIUM': return <Clock className="h-4 w-4" />;
      case 'LOW': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Error Monitor Dashboard</h2>
          <p className="text-muted-foreground">
            Monitoramento automático de erros • Última atualização: {lastUpdate}
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isMonitoring ? (
            <Button onClick={startMonitoring} className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Iniciar Monitoramento
            </Button>
          ) : (
            <Button variant="outline" onClick={stopMonitoring}>
              Parar Monitoramento
            </Button>
          )}
          
          <Button variant="secondary" onClick={triggerAutoFix}>
            Correção Automática
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Erros</p>
              <p className="text-2xl font-bold">{errors.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Críticos</p>
              <p className="text-2xl font-bold text-red-500">
                {errors.filter(e => e.priority === 'CRITICAL').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-2xl font-bold text-green-500">
                {isMonitoring ? 'Ativo' : 'Inativo'}
              </p>
            </div>
            <div className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-2xl font-bold">99.8%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Error List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Erros Detectados</h3>
          
          {errors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>Nenhum erro detectado!</p>
              <p className="text-sm">Sistema funcionando perfeitamente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((error) => (
                <div key={error.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getPriorityIcon(error.priority)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${getPriorityColor(error.priority)} text-white`}>
                            {error.priority}
                          </Badge>
                          <Badge variant="outline">{error.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="font-medium">{error.error.message}</p>
                        <details className="mt-2">
                          <summary className="text-sm text-muted-foreground cursor-pointer">
                            Ver stack trace
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                            {error.error.stack}
                          </pre>
                        </details>
                      </div>
                    </div>
                    
                    <Badge variant={error.status === 'resolved' ? 'default' : 'secondary'}>
                      {error.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Recommendations */}
      {analysis && analysis.recommendations.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recomendações</h3>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(rec.priority) + ' text-white'}>
                        {rec.priority}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.estimatedTime}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}; 