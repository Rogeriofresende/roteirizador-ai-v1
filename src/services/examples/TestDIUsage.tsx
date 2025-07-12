/**
 * Test DI Usage Component
 * Exemplo de como usar o sistema de Dependency Injection V6.4
 */

import React, { useEffect, useState } from 'react';
import { Services, getSystemStatus, ServiceHealthStatus } from '../index';
import { createLogger } from '../../utils/logger';

const logger = createLogger('TestDIUsage');

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'offline';
  services: Array<{
    name: string;
    status: string;
    health: ServiceHealthStatus;
  }>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    offline: number;
  };
}

export const TestDIUsage: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [analyticsTest, setAnalyticsTest] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSystemHealth();
  }, []);

  const loadSystemHealth = async () => {
    try {
      const health = await Services.getSystemHealth();
      setSystemHealth(health);
      logger.info('System health loaded', health);
    } catch (error) {
      logger.error('Failed to load system health', error);
    }
  };

  const testAnalyticsService = async () => {
    setLoading(true);
    setAnalyticsTest('Testing...');
    
    try {
      const analyticsService = await Services.getAnalytics();
      
      await analyticsService.track({
        name: 'di_test',
        parameters: {
          source: 'TestDIUsage',
          timestamp: new Date().toISOString()
        }
      });
      
      const metrics = await analyticsService.getMetrics();
      
      setAnalyticsTest(`✅ Success! Total events: ${metrics.totalEvents}`);
      logger.info('Analytics service test completed', metrics);
    } catch (error) {
      setAnalyticsTest(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      logger.error('Analytics service test failed', error);
    } finally {
      setLoading(false);
    }
  };

  const testAllServices = async () => {
    setLoading(true);
    
    try {
      const tests = await Promise.allSettled([
        Services.getAnalytics().then(s => s.track({ name: 'test_all_services' })),
        Services.getTemplate().then(s => s.generateScript?.({ 
          topic: 'DI Test', 
          style: 'technical' 
        })),
        Services.getSystemHealth()
      ]);
      
      const results = tests.map((test, i) => ({
        service: ['Analytics', 'Template', 'SystemHealth'][i],
        success: test.status === 'fulfilled'
      }));
      
      logger.info('All services test completed', results);
      alert(`Test Results:\n${results.map(r => `${r.service}: ${r.success ? '✅' : '❌'}`).join('\n')}`);
    } catch (error) {
      logger.error('All services test failed', error);
      alert('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">DI System Test V6.4</h1>
      
      {/* System Health Overview */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">System Health</h2>
        
        {systemHealth ? (
          <div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              systemHealth.overall === 'healthy' ? 'bg-green-100 text-green-800' :
              systemHealth.overall === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Overall: {systemHealth.overall.toUpperCase()}
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{systemHealth.summary.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{systemHealth.summary.healthy}</div>
                <div className="text-sm text-gray-600">Healthy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{systemHealth.summary.degraded}</div>
                <div className="text-sm text-gray-600">Degraded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{systemHealth.summary.offline}</div>
                <div className="text-sm text-gray-600">Offline</div>
              </div>
            </div>
          </div>
        ) : (
          <div>Loading system health...</div>
        )}
        
        <button 
          onClick={loadSystemHealth}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Health
        </button>
      </div>
      
      {/* Service Testing */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Service Testing</h2>
        
        <div className="space-y-4">
          <div>
            <button 
              onClick={testAnalyticsService}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Analytics Service'}
            </button>
            {analyticsTest && (
              <div className="mt-2 p-2 bg-gray-100 rounded">
                {analyticsTest}
              </div>
            )}
          </div>
          
          <div>
            <button 
              onClick={testAllServices}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test All Services'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Service Details */}
      {systemHealth && (
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Service Details</h2>
          
          <div className="space-y-2">
            {systemHealth.services.map((service, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{service.name}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  service.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 