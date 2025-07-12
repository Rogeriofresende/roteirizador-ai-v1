/**
 * 🧪 ERROR CAPTURE SYSTEM TEST
 * Test to verify all error capture functionality
 */

import React from 'react';
import { Button } from '../components/ui/Button';

export const ErrorCaptureTest: React.FC = () => {
  const testJavaScriptError = () => {
    // This will trigger window.onerror
    throw new Error('Test JavaScript Error - CRITICAL');
  };

  const testReactError = () => {
    // This will be caught by Error Boundary
    const TestComponent = () => {
      throw new Error('Test React Component Error');
    };
    return <TestComponent />;
  };

  const testNetworkError = async () => {
    // This will trigger network interceptor
    try {
      await fetch('https://api.invalid-domain-test.com/endpoint');
    } catch (error) {
      console.error('Network test error:', error);
    }
  };

  const testConsoleWarning = () => {
    console.warn('Test warning: This is a deprecated function call');
  };

  const testUnhandledPromise = () => {
    // This will trigger unhandledrejection
    Promise.reject(new Error('Test Unhandled Promise Rejection'));
  };

  const testSlowRequest = async () => {
    // Simulate slow request (will trigger if > 3s)
    await fetch('https://httpbin.org/delay/4');
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Error Capture System Test V6.3</h2>
      
      <div className="space-y-2">
        <Button 
          onClick={testJavaScriptError}
          variant="destructive"
        >
          Test JavaScript Error (will crash)
        </Button>

        <Button 
          onClick={testReactError}
          variant="destructive"
        >
          Test React Component Error
        </Button>

        <Button 
          onClick={testNetworkError}
          variant="outline"
        >
          Test Network Error
        </Button>

        <Button 
          onClick={testConsoleWarning}
          variant="outline"
        >
          Test Console Warning
        </Button>

        <Button 
          onClick={testUnhandledPromise}
          variant="outline"
        >
          Test Unhandled Promise
        </Button>

        <Button 
          onClick={testSlowRequest}
          variant="outline"
        >
          Test Slow Request (4s)
        </Button>

        <Button 
          onClick={() => {
            const stats = (window as any).errorCaptureStats?.();
            console.log('Error Capture Stats:', stats);
            alert('Check console for stats');
          }}
          variant="secondary"
        >
          Show Capture Stats
        </Button>
      </div>

      <div className="mt-8 p-4 bg-muted rounded">
        <p className="text-sm">
          💡 Tip: Open DevTools Console to see captured errors being logged.
          <br />
          Errors are stored in localStorage and sessionStorage for inspection.
        </p>
      </div>
    </div>
  );
}; 