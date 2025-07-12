// API Health Dashboard Component
import React, { useState, useEffect } from 'react';
import { apiMonitoringService } from '../services/apiMonitoringService';
import { apiTestingSuite } from '../services/apiTesting';
import { geminiService } from '../services/geminiService';

export const ApiHealthDashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    // Initial load
    updateHealthStatus();
    
    // Start monitoring
    apiMonitoringService.startMonitoring();
    
    // Update every 10 seconds
    const interval = setInterval(updateHealthStatus, 10000);
    
    return () => {
      clearInterval(interval);
      apiMonitoringService.stopMonitoring();
    };
  }, []);

  const updateHealthStatus = () => {
    const health = apiMonitoringService.getHealthStatus();
    const metrics = apiMonitoringService.getMetrics();
    
    setHealthStatus(health);
    setMetrics(metrics);
  };

  const runTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await apiTestingSuite.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLOSED': return 'text-green-600';
      case 'OPEN': return 'text-red-600';
      case 'HALF_OPEN': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthColor = (healthy: boolean) => {
    return healthy ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔍 API Health Dashboard
      </h2>
      
      {/* Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Status Geral</h3>
          <div className={`text-2xl font-bold ${getHealthColor(healthStatus?.healthy)}`}>
            {healthStatus?.healthy ? '✅ Saudável' : '❌ Problema'}
          </div>
          <div className="text-sm text-gray-600">
            Configurado: {healthStatus?.configured ? 'Sim' : 'Não'}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Circuit Breaker</h3>
          <div className={`text-xl font-bold ${getStatusColor(healthStatus?.circuitBreakerState)}`}>
            {healthStatus?.circuitBreakerState || 'UNKNOWN'}
          </div>
          <div className="text-sm text-gray-600">
            Falhas: {healthStatus?.failureCount || 0}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Uptime</h3>
          <div className="text-xl font-bold text-blue-600">
            {metrics?.uptime?.toFixed(1) || 0}%
          </div>
          <div className="text-sm text-gray-600">
            Tempo médio: {metrics?.averageResponseTime?.toFixed(0) || 0}ms
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Estatísticas de Requisições</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-bold">{metrics?.totalRequests || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Sucessos:</span>
              <span className="font-bold text-green-600">{metrics?.successfulRequests || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Falhas:</span>
              <span className="font-bold text-red-600">{metrics?.failedRequests || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de falhas:</span>
              <span className="font-bold">{metrics?.failureRate?.toFixed(1) || 0}%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Última Verificação</h3>
          <div className="text-sm text-gray-600">
            {metrics?.lastHealthCheck ? 
              new Date(metrics.lastHealthCheck).toLocaleString() : 
              'Nunca'
            }
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Última validação: {healthStatus?.lastTested ? 
              new Date(healthStatus.lastTested).toLocaleString() : 
              'Nunca'
            }
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Testes de Validação</h3>
          <button
            onClick={runTests}
            disabled={isRunningTests}
            className={`px-4 py-2 rounded-lg font-medium ${
              isRunningTests
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isRunningTests ? '🔄 Executando...' : '▶️ Executar Testes'}
          </button>
        </div>
        
        {testResults && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium">
                Resultado: {testResults.passedTests}/{testResults.totalTests} testes aprovados
              </span>
              <span className={`font-bold ${
                testResults.allTestsPassed ? 'text-green-600' : 'text-red-600'
              }`}>
                {testResults.allTestsPassed ? '✅ APROVADO' : '❌ REPROVADO'}
              </span>
            </div>
            
            <div className="space-y-2">
              {testResults.results.map((test: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{test.testName}</span>
                  <span className={`text-sm font-medium ${
                    test.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {test.success ? '✅' : '❌'} {test.success ? 'PASSOU' : 'FALHOU'}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              Executado em: {new Date(testResults.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={updateHealthStatus}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          🔄 Atualizar Status
        </button>
        
        <button
          onClick={() => apiMonitoringService.resetMetrics()}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          🔄 Resetar Métricas
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ⚡ Reiniciar Serviço
        </button>
      </div>
    </div>
  );
};

export default ApiHealthDashboard; 