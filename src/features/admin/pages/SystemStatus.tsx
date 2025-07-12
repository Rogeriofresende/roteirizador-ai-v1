/**
 * 🔍 SYSTEM STATUS PAGE - Week 4.4+ 
 * Página para diagnóstico completo do sistema
 */

import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { analyticsService } from '../services/analyticsService';

interface SystemCheck {
  name: string;
  status: 'checking' | 'success' | 'error';
  message: string;
  details?: string;
}

export const SystemStatus: React.FC = () => {
  const [checks, setChecks] = useState<SystemCheck[]>([
    { name: 'Analytics Service', status: 'checking', message: 'Verificando...' },
    { name: 'Gemini API Connection', status: 'checking', message: 'Verificando...' },
    { name: 'Template Service', status: 'checking', message: 'Verificando...' },
    { name: 'Service Worker', status: 'checking', message: 'Verificando...' }
  ]);

  const updateCheck = (name: string, status: SystemCheck['status'], message: string, details?: string) => {
    setChecks(prev => prev.map(check => 
      check.name === name 
        ? { ...check, status, message, details }
        : check
    ));
  };

  const runSystemChecks = async () => {
    console.log('🔍 Starting comprehensive system checks...');

    // 1. Analytics Service Check
    try {
      console.log('🧪 Testing analyticsService methods...');
      
      // Test trackUserAction
      if (typeof analyticsService.trackUserAction === 'function') {
        analyticsService.trackUserAction('system_status_check', { timestamp: new Date().toISOString() });
        console.log('✅ trackUserAction - OK');
      } else {
        throw new Error('trackUserAction method not found');
      }

      // Test trackError
      if (typeof analyticsService.trackError === 'function') {
        analyticsService.trackError('test_error', { test: true });
        console.log('✅ trackError - OK');
      } else {
        throw new Error('trackError method not found');
      }

      updateCheck('Analytics Service', 'success', 'All methods working correctly');
    } catch (error) {
      console.error('❌ Analytics Service Error:', error);
      updateCheck('Analytics Service', 'error', 'Method errors detected', error?.toString());
    }

    // 2. Gemini API Check
    try {
      console.log('🧪 Testing Gemini API connection...');
      
      const isConfigured = geminiService.isConfigured();
      if (!isConfigured) {
        updateCheck('Gemini API Connection', 'error', 'API key not configured');
        return;
      }

      // Try a simple connection test
      const testResult = await geminiService.testConnection();
      if (testResult) {
        updateCheck('Gemini API Connection', 'success', 'API connection working');
      } else {
        updateCheck('Gemini API Connection', 'error', 'API connection failed', 'Service may be unavailable');
      }
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      updateCheck('Gemini API Connection', 'error', 'Connection test failed', error?.toString());
    }

    // 3. Template Service Check
    try {
      console.log('🧪 Testing Template Service...');
      
      // Try to import template service
      const { TemplateService } = await import('../services/templateService');
      
      // Try to get featured templates
      const templates = await TemplateService.getFeaturedTemplates(2);
      if (Array.isArray(templates) && templates.length > 0) {
        updateCheck('Template Service', 'success', `${templates.length} templates loaded successfully`);
      } else {
        updateCheck('Template Service', 'error', 'No templates loaded', 'Mock fallback may be in use');
      }
    } catch (error) {
      console.error('❌ Template Service Error:', error);
      updateCheck('Template Service', 'error', 'Template loading failed', error?.toString());
    }

    // 4. Service Worker Check
    try {
      console.log('🧪 Testing Service Worker...');
      
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          updateCheck('Service Worker', 'success', 'Service worker active');
        } else {
          updateCheck('Service Worker', 'error', 'Service worker not registered');
        }
      } else {
        updateCheck('Service Worker', 'error', 'Service worker not supported');
      }
    } catch (error) {
      console.error('❌ Service Worker Error:', error);
      updateCheck('Service Worker', 'error', 'Service worker check failed', error?.toString());
    }

    console.log('🏁 System checks completed');
  };

  useEffect(() => {
    runSystemChecks();
  }, []);

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'checking': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: SystemCheck['status']) => {
    switch (status) {
      case 'checking': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const successCount = checks.filter(c => c.status === 'success').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  const overallHealth = errorCount === 0 ? 'Healthy' : errorCount < checks.length / 2 ? 'Issues' : 'Critical';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🔍 System Status</h1>
        <p className="text-gray-600">
          Comprehensive system health check - Week 4.4+ diagnostics
        </p>
      </div>

      {/* Overall Health */}
      <div className={`p-4 rounded-lg mb-6 ${
        overallHealth === 'Healthy' ? 'bg-green-50 border border-green-200' :
        overallHealth === 'Issues' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <h2 className={`text-lg font-semibold ${
          overallHealth === 'Healthy' ? 'text-green-800' :
          overallHealth === 'Issues' ? 'text-yellow-800' :
          'text-red-800'
        }`}>
          Overall System Health: {overallHealth}
        </h2>
        <p className={`text-sm ${
          overallHealth === 'Healthy' ? 'text-green-700' :
          overallHealth === 'Issues' ? 'text-yellow-700' :
          'text-red-700'
        }`}>
          {successCount} working, {errorCount} with issues
        </p>
      </div>

      {/* Individual Checks */}
      <div className="space-y-4">
        {checks.map(check => (
          <div key={check.name} className="bg-white rounded-lg shadow p-4 border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getStatusIcon(check.status)}</span>
                <h3 className="font-semibold">{check.name}</h3>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(check.status)}`}>
                {check.status.toUpperCase()}
              </span>
            </div>
            
            <p className={`text-sm ${getStatusColor(check.status)}`}>
              {check.message}
            </p>
            
            {check.details && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                <strong>Details:</strong> {check.details}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={runSystemChecks}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔄 Re-run Checks
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🔄 Reload Application
        </button>
        
        <button
          onClick={() => {
            console.clear();
            console.log('🧹 Console cleared for fresh debugging');
          }}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          🧹 Clear Console
        </button>
      </div>

      {/* Debug Information */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">🐛 Debug Information</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>User Agent:</strong> {navigator.userAgent}</p>
          <p><strong>URL:</strong> {window.location.href}</p>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          <p><strong>Local Storage Keys:</strong> {Object.keys(localStorage).join(', ') || 'None'}</p>
        </div>
      </div>
    </div>
  );
};