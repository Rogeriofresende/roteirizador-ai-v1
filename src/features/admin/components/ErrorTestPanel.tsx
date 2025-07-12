/**
 * Error Test Panel V6.3 - Painel para testar geração de erros
 * Permite simular diferentes tipos de erro para validar o sistema de monitoramento
 */

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Bug, 
  AlertTriangle, 
  Globe, 
  Terminal,
  Zap,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ErrorTestPanel: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Simular erro JavaScript
  const generateJavaScriptError = () => {
    try {
      // @ts-ignore - Forçar erro
      const result = undefined.nonExistentProperty.value;
    } catch (error) {
      console.error('JavaScript Error:', error);
      toast.error('JavaScript error gerado!');
    }
  };

  // Simular erro React
  const generateReactError = () => {
    // Este erro seria capturado por Error Boundary
    const TestComponent = () => {
      // @ts-expect-error - Forçar erro de hooks (removing conditional hook call)
      const [invalidState] = useState('invalid');
      // Simulate the error through improper state usage instead
      throw new Error('React hook error simulado!');
    };
    
    toast.error('React hook error simulado!');
  };

  // Simular erro de Network
  const generateNetworkError = async () => {
    setIsGenerating(true);
    try {
      // Tentar fazer request para endpoint inexistente
      await fetch('https://api.invalid-domain-12345.com/test', {
        method: 'POST',
        body: JSON.stringify({ test: true })
      });
    } catch (error) {
      console.error('Network Error:', error);
      toast.error('Network error gerado!');
    } finally {
      setIsGenerating(false);
    }
  };

  // Simular console warning
  const generateConsoleWarning = () => {
    console.warn('⚠️ Test Warning: React Hook useEffect has missing dependencies');
    console.warn('⚠️ Test Warning: Component is using deprecated API');
    console.warn('⚠️ Test Warning: Performance issue detected');
    toast.warning('Console warnings gerados!');
  };

  // Simular erro crítico
  const generateCriticalError = () => {
    // Simular erro crítico que quebraria a aplicação
    setTimeout(() => {
      // @ts-ignore
      window.dispatchEvent(new ErrorEvent('error', {
        message: 'Critical Application Error: Memory leak detected',
        filename: 'app.js',
        lineno: 123,
        colno: 45,
        error: new Error('Critical Application Error')
      }));
    }, 100);
    
    toast.error('🚨 ERRO CRÍTICO GERADO!', { duration: 5000 });
  };

  // Gerar múltiplos erros
  const generateMultipleErrors = () => {
    generateJavaScriptError();
    setTimeout(generateConsoleWarning, 500);
    setTimeout(generateNetworkError, 1000);
    toast.loading('Gerando múltiplos erros...', { duration: 2000 });
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Painel de Teste de Erros
          </h3>
          <Badge variant="outline">V6.3 Testing</Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Use este painel para gerar diferentes tipos de erro e testar o sistema de monitoramento.
          Os erros aparecerão no dashboard em tempo real.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={generateJavaScriptError}
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 text-red-500" />
            JavaScript Error
          </Button>

          <Button
            variant="outline"
            onClick={generateReactError}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            React Error
          </Button>

          <Button
            variant="outline"
            onClick={generateNetworkError}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4 text-blue-500" />
            Network Error
          </Button>

          <Button
            variant="outline"
            onClick={generateConsoleWarning}
            className="flex items-center gap-2"
          >
            <Terminal className="h-4 w-4 text-yellow-500" />
            Console Warning
          </Button>

          <Button
            variant="destructive"
            onClick={generateCriticalError}
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Critical Error
          </Button>

          <Button
            variant="secondary"
            onClick={generateMultipleErrors}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Multiple Errors
          </Button>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Nota:</strong> Estes são erros de teste controlados. Em produção, o sistema
            capturaria erros reais automaticamente através dos handlers globais implementados
            pela IA Alpha.
          </p>
        </div>
      </div>
    </Card>
  );
}; 