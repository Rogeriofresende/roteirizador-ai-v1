// Quality Gate Dashboard - Administrative interface for quality gate system
import React, { useState, useEffect } from 'react';
import { QualityGateOrchestrator } from '../../services/qualityGates/QualityGateOrchestrator';

interface DashboardState {
  orchestrator: QualityGateOrchestrator | null;
  isInitialized: boolean;
  systemStatus: any | null;
  healthReport: any | null;
  isRunningDemo: boolean;
  isRunningTests: boolean;
  logs: string[];
  lastValidation: any | null;
  deploymentHistory: any[];
}

export const QualityGateDashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    orchestrator: null,
    isInitialized: false,
    systemStatus: null,
    healthReport: null,
    isRunningDemo: false,
    isRunningTests: false,
    logs: [],
    lastValidation: null,
    deploymentHistory: []
  });

  // Initialize orchestrator on component mount
  useEffect(() => {
    initializeOrchestrator();
    
    // Cleanup on unmount
    return () => {
      if (state.orchestrator) {
        state.orchestrator.shutdown();
      }
    };
  }, []);

  // Poll for system updates
  useEffect(() => {
    if (state.isInitialized && state.orchestrator) {
      const interval = setInterval(async () => {
        await updateSystemStatus();
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [state.isInitialized]);

  const initializeOrchestrator = async () => {
    try {
      addLog('🎯 Initializing Quality Gate Orchestrator...');
      const orchestrator = new QualityGateOrchestrator();
      
      setState(prev => ({
        ...prev,
        orchestrator,
        isInitialized: orchestrator.isSystemReady()
      }));
      
      addLog('✅ Quality Gate Orchestrator initialized successfully');
      await updateSystemStatus();
      
    } catch (error) {
      addLog(`❌ Failed to initialize orchestrator: ${error}`);
    }
  };

  const updateSystemStatus = async () => {
    if (!state.orchestrator) return;

    try {
      const [systemStatus, healthReport, deploymentHistory] = await Promise.all([
        state.orchestrator.getSystemStatus(),
        state.orchestrator.getSystemHealthReport(),
        state.orchestrator.getDeploymentGateSystem().getDeploymentHistory(5)
      ]);

      setState(prev => ({
        ...prev,
        systemStatus,
        healthReport,
        deploymentHistory
      }));
    } catch (error) {
      addLog(`❌ Error updating system status: ${error}`);
    }
  };

  const runDemonstration = async () => {
    if (!state.orchestrator || state.isRunningDemo) return;

    setState(prev => ({ ...prev, isRunningDemo: true }));
    addLog('🎭 Starting Quality Gate System Demonstration...');

    try {
      await state.orchestrator.runDemonstration();
      addLog('🎉 Demonstration completed successfully!');
    } catch (error) {
      addLog(`❌ Demonstration failed: ${error}`);
    } finally {
      setState(prev => ({ ...prev, isRunningDemo: false }));
      await updateSystemStatus();
    }
  };

  const runSystemTests = async () => {
    if (!state.orchestrator || state.isRunningTests) return;

    setState(prev => ({ ...prev, isRunningTests: true }));
    addLog('🧪 Starting System Tests...');

    try {
      const testResults = await state.orchestrator.runSystemTests();
      addLog(`🧪 Tests completed: ${testResults.passed}/${testResults.total} passed (${((testResults.passed / testResults.total) * 100).toFixed(1)}%)`);
    } catch (error) {
      addLog(`❌ System tests failed: ${error}`);
    } finally {
      setState(prev => ({ ...prev, isRunningTests: false }));
      await updateSystemStatus();
    }
  };

  const validateDeployment = async () => {
    if (!state.orchestrator) return;

    addLog('🚀 Running deployment validation...');

    try {
      const result = await state.orchestrator.validateForDeployment();
      setState(prev => ({ ...prev, lastValidation: result }));
      
      const status = result.approved ? 'APPROVED ✅' : 'BLOCKED ❌';
      addLog(`🚀 Deployment validation: ${status} (Score: ${result.overallScore}%)`);
      
      if (!result.approved && result.criticalIssues.length > 0) {
        result.criticalIssues.forEach((issue: string) => {
          addLog(`🚨 Critical Issue: ${issue}`);
        });
      }
    } catch (error) {
      addLog(`❌ Deployment validation failed: ${error}`);
    }

    await updateSystemStatus();
  };

  const performQualityValidation = async () => {
    if (!state.orchestrator) return;

    addLog('🎯 Running full quality validation...');

    try {
      const result = await state.orchestrator.performFullQualityValidation();
      const status = result.overall.passed ? 'PASSED ✅' : 'FAILED ❌';
      addLog(`🎯 Quality validation: ${status} (Score: ${result.overall.score}%)`);
    } catch (error) {
      addLog(`❌ Quality validation failed: ${error}`);
    }

    await updateSystemStatus();
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    setState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-49), logEntry] // Keep last 50 logs
    }));

    console.log(logEntry);
  };

  const clearLogs = () => {
    setState(prev => ({ ...prev, logs: [] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!state.isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Initializing Quality Gate System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛡️ Quality Gate Dashboard
          </h1>
          <p className="text-gray-600">
            Evidence-Based Validation & Best Practices Implementation - Week 4.2
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={runDemonstration}
            disabled={state.isRunningDemo}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {state.isRunningDemo ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Running Demo...
              </>
            ) : (
              <>
                🎭 Run Demonstration
              </>
            )}
          </button>

          <button
            onClick={runSystemTests}
            disabled={state.isRunningTests}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {state.isRunningTests ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Running Tests...
              </>
            ) : (
              <>
                🧪 Run System Tests
              </>
            )}
          </button>

          <button
            onClick={validateDeployment}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            🚀 Validate Deployment
          </button>

          <button
            onClick={performQualityValidation}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            🎯 Quality Validation
          </button>
        </div>

        {/* System Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* System Status Card */}
          {state.systemStatus && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📊 System Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Overall Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(state.systemStatus.overallStatus)}`}>
                    {state.systemStatus.overallStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Deployment Gate:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(state.systemStatus.deploymentGate)}`}>
                    {state.systemStatus.deploymentGate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Health Monitoring:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(state.systemStatus.healthMonitoring)}`}>
                    {state.systemStatus.healthMonitoring}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Alert System:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(state.systemStatus.alertSystem)}`}>
                    {state.systemStatus.alertSystem}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Health Report Card */}
          {state.healthReport && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                💗 Health Report
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Overall Health:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(state.healthReport.overall)}`}>
                    {state.healthReport.overall}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Deployment Rate: {state.healthReport.metrics.deploymentApprovalRate.toFixed(1)}%</div>
                    <div>Alert Response: {state.healthReport.metrics.alertResponseTime}ms</div>
                    <div>Evidence Quality: {state.healthReport.metrics.evidenceQuality}%</div>
                    <div>Uptime: {Math.round(state.healthReport.metrics.systemUptime / 1000)}s</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Last Validation Card */}
          {state.lastValidation && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🚀 Last Deployment Validation
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${state.lastValidation.approved ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                    {state.lastValidation.approved ? 'APPROVED' : 'BLOCKED'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Score:</span>
                  <span className="font-semibold">{state.lastValidation.overallScore}%</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Critical Issues: {state.lastValidation.criticalIssues.length}</div>
                  <div>Warnings: {state.lastValidation.warnings.length}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deployment History */}
        {state.deploymentHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📋 Recent Deployment Attempts
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Score</th>
                    <th className="px-4 py-2 text-left">Duration</th>
                    <th className="px-4 py-2 text-left">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {state.deploymentHistory.map((attempt, index) => (
                    <tr key={attempt.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2 text-sm font-mono">{attempt.id.split('-').pop()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${attempt.result.approved ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                          {attempt.result.approved ? 'APPROVED' : 'BLOCKED'}
                        </span>
                      </td>
                      <td className="px-4 py-2">{attempt.result.overallScore}%</td>
                      <td className="px-4 py-2">{attempt.duration}ms</td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {new Date(attempt.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📝 Live System Logs
            </h3>
            <button
              onClick={clearLogs}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {state.logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              state.logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Quality Gate System - Week 4.2 Evidence-Based Validation Implementation</p>
          <p>IA Charlie: Quality Gates & Monitoring Specialist</p>
        </div>
      </div>
    </div>
  );
};

export default QualityGateDashboard; 