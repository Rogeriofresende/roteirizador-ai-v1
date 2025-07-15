/**
 * 🔍 SYSTEM STATUS PAGE - Week 4.4+ Design System Enhanced
 * Página para diagnóstico completo do sistema - Professional Interface
 */

import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { analyticsService } from '../services/analyticsService';

// Design System Imports - Using Available Components
import { Layout } from '../design-system/components/Layout';
import { Card } from '../design-system/components/Card';
import { Button } from '../design-system/components/Button';

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

  const getStatusBadge = (status: SystemCheck['status']) => {
    switch (status) {
      case 'checking': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const successCount = checks.filter(c => c.status === 'success').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  const overallHealth = errorCount === 0 ? 'Healthy' : errorCount < checks.length / 2 ? 'Issues' : 'Critical';

  const getOverallHealthStyle = () => {
    if (overallHealth === 'Healthy') return 'bg-green-50 border-green-200 text-green-800';
    if (overallHealth === 'Issues') return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    return 'bg-red-50 border-red-200 text-red-800';
  };

  return (
    <Layout.Page variant="dashboard" className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🔍 System Status
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive system health check - Professional Diagnostics
        </p>
      </div>

      {/* Overall Health Status */}
      <Card 
        variant="elevated" 
        className={`mb-8 border-2 ${getOverallHealthStyle()}`}
      >
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Overall System Health: {overallHealth}
            </h2>
            <p className="text-sm opacity-80">
              {successCount} working, {errorCount} with issues
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full border text-lg font-semibold ${getStatusBadge(overallHealth === 'Healthy' ? 'success' : overallHealth === 'Issues' ? 'checking' : 'error')}`}>
            {overallHealth}
          </div>
        </div>
      </Card>

      {/* System Components Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          System Components
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {checks.map(check => (
            <Card key={check.name} variant="outlined" className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Check Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getStatusIcon(check.status)}</span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {check.name}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(check.status)}`}>
                    {check.status.toUpperCase()}
                  </span>
                </div>
                
                {/* Check Message */}
                <p className={`text-sm mb-3 ${getStatusColor(check.status)}`}>
                  {check.message}
                </p>
                
                {/* Check Details */}
                {check.details && (
                  <Card variant="subtle" className="bg-gray-50 border-gray-200">
                    <div className="p-3">
                      <p className="text-xs text-gray-700">
                        <strong>Details:</strong> {check.details}
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            size="large"
            onClick={runSystemChecks}
            className="w-full"
          >
            🔄 Re-run Checks
          </Button>
          
          <Button
            variant="secondary"
            size="large"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            🔄 Reload Application
          </Button>
          
          <Button
            variant="ghost"
            size="large"
            onClick={() => {
              console.clear();
              console.log('🧹 Console cleared for fresh debugging');
            }}
            className="w-full"
          >
            🧹 Clear Console
          </Button>
        </div>
      </div>

      {/* Debug Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          🐛 Debug Information
        </h2>
        
        <Card variant="subtle" className="bg-gray-50 border-gray-200">
          <div className="p-6 space-y-3">
            <div>
              <p className="text-sm text-gray-700">
                <strong>User Agent:</strong> {navigator.userAgent}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>URL:</strong> {window.location.href}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>Timestamp:</strong> {new Date().toISOString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>Local Storage Keys:</strong> {Object.keys(localStorage).join(', ') || 'None'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout.Page>
  );
};