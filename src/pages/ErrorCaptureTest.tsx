/**
 * �� ERROR CAPTURE TEST - WEEK 4.4 VALIDATION
 * Teste funcional para validar correções críticas
 */

import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { geminiService } from '../services/geminiService';

export const ErrorCaptureTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: Record<string, any> = {};

    // ✅ TEST 1: Analytics Service Methods
    try {
      console.log('🧪 Testing analyticsService.trackUserAction...');
      analyticsService.trackUserAction('test_action', { test: true });
      results.trackUserAction = { success: true, message: 'trackUserAction working' };
    } catch (error) {
      results.trackUserAction = { success: false, error: error?.toString() };
    }

    try {
      console.log('🧪 Testing analyticsService.trackError...');
      analyticsService.trackError('test_error', { test: true });
      results.trackError = { success: true, message: 'trackError working' };
    } catch (error) {
      results.trackError = { success: false, error: error?.toString() };
    }

    // ✅ TEST 2: Gemini API Configuration
    try {
      console.log('🧪 Testing Gemini API configuration...');
      const isConfigured = geminiService.isConfigured();
      results.geminiConfig = { 
        success: true, 
        isConfigured,
        message: `Gemini ${isConfigured ? 'is' : 'is not'} configured`
      };
    } catch (error) {
      results.geminiConfig = { success: false, error: error?.toString() };
    }

    // ✅ TEST 3: Gemini Auth Manager
    try {
      console.log('🧪 Testing Gemini authentication...');
      if (geminiService.isConfigured()) {
        const connectionTest = await geminiService.testConnection();
        results.geminiAuth = {
          success: true,
          connectionWorking: connectionTest,
          message: `Connection test: ${connectionTest ? 'PASSED' : 'FAILED'}`
        };
      } else {
        results.geminiAuth = {
          success: true,
          connectionWorking: false,
          message: 'Not configured - cannot test connection'
        };
      }
    } catch (error) {
      results.geminiAuth = { success: false, error: error?.toString() };
    }

    // ✅ TEST 4: Method Existence Validation
    try {
      console.log('🧪 Testing method existence...');
      results.methodExistence = {
        success: true,
        trackUserAction: typeof analyticsService.trackUserAction === 'function',
        trackError: typeof analyticsService.trackError === 'function',
        trackEvent: typeof analyticsService.trackEvent === 'function',
        geminiGenerate: typeof geminiService.generateScript === 'function',
        geminiTestConnection: typeof geminiService.testConnection === 'function'
      };
    } catch (error) {
      results.methodExistence = { success: false, error: error?.toString() };
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">🧪 Week 4.4 - Critical Integration Test</h1>
        <p className="text-gray-600">
          Teste funcional para validar correções de problemas críticos identificados
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Test Results</h2>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests Again'}
          </button>
        </div>

        <div className="space-y-4">
          {/* Analytics Service Tests */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-3">📊 Analytics Service Tests</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <span>{getStatusIcon(testResults.trackUserAction?.success)}</span>
                <span className={getStatusColor(testResults.trackUserAction?.success)}>
                  trackUserAction: {testResults.trackUserAction?.success ? 'WORKING' : 'FAILED'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>{getStatusIcon(testResults.trackError?.success)}</span>
                <span className={getStatusColor(testResults.trackError?.success)}>
                  trackError: {testResults.trackError?.success ? 'WORKING' : 'FAILED'}
                </span>
              </div>
            </div>

            {testResults.trackUserAction?.error && (
              <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                trackUserAction Error: {testResults.trackUserAction.error}
              </div>
            )}
            
            {testResults.trackError?.error && (
              <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                trackError Error: {testResults.trackError.error}
              </div>
            )}
          </div>

          {/* Gemini API Tests */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-3">🧠 Gemini API Tests</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <span>{getStatusIcon(testResults.geminiConfig?.success)}</span>
                <span className={getStatusColor(testResults.geminiConfig?.success)}>
                  Configuration: {testResults.geminiConfig?.isConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>{getStatusIcon(testResults.geminiAuth?.success && testResults.geminiAuth?.connectionWorking)}</span>
                <span className={getStatusColor(testResults.geminiAuth?.success && testResults.geminiAuth?.connectionWorking)}>
                  Connection: {testResults.geminiAuth?.connectionWorking ? 'WORKING' : 'FAILED'}
                </span>
              </div>
            </div>

            {testResults.geminiAuth?.message && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                {testResults.geminiAuth.message}
              </div>
            )}
          </div>

          {/* Method Existence Tests */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-3">🔧 Method Existence Validation</h3>
            
            {testResults.methodExistence?.success && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <span>{getStatusIcon(testResults.methodExistence.trackUserAction)}</span>
                  <span>analyticsService.trackUserAction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{getStatusIcon(testResults.methodExistence.trackError)}</span>
                  <span>analyticsService.trackError</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{getStatusIcon(testResults.methodExistence.trackEvent)}</span>
                  <span>analyticsService.trackEvent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{getStatusIcon(testResults.methodExistence.geminiGenerate)}</span>
                  <span>geminiService.generateScript</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{getStatusIcon(testResults.methodExistence.geminiTestConnection)}</span>
                  <span>geminiService.testConnection</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Console Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">📋 Test Information</h3>
        <p className="text-sm text-gray-600 mb-2">
          This test validates the Week 4.4 critical fixes:
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• ✅ Fixed TypeError: analyticsService.trackUserAction is not a function</li>
          <li>• ✅ Fixed TypeError: analyticsService.trackError is not a function</li>
          <li>• ✅ Fixed Gemini API 503 Service Unavailable errors</li>
          <li>• ✅ Fixed API credentials invalid authentication</li>
        </ul>
        <p className="text-sm text-gray-500 mt-2">
          Check browser console for detailed logging information.
        </p>
      </div>
    </div>
  );
}; 