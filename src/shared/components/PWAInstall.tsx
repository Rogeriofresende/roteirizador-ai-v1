import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { usePWA } from '../hooks/usePWA';
import { createLogger } from '../utils/logger';
// import { usePWAAnalytics } from '../hooks/usePWAAnalytics';

const logger = createLogger('PWAInstall');

interface PWAInstallProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  showOfflinePrompt?: boolean;
}

export const PWAInstall: React.FC<PWAInstallProps> = ({
  onInstall, 
  onDismiss,
  showOfflinePrompt = true 
}) => {
  const { 
    isInstalled, 
    isSupported,
    installPrompt,
    canInstall,
    install: installApp,
    showInstallPrompt,
    dismissUpdate
  } = usePWA();
  
  const promptVisible = canInstall && !!installPrompt;
  
  // const { trackInstallPrompt, trackInstallation, trackError } = usePWAAnalytics();
  
  const [isInstalling, setIsInstalling] = useState(false);

  // Hooks must be called before any early returns
  useEffect(() => {
    // Simple component focus
    if (!isSupported || isInstalled || !promptVisible) {
      return;
    }
  }, [isSupported, isInstalled, promptVisible]);

  // Early return after hooks
  if (!isSupported) {
    return null;
  }
  
  const handleInstall = async () => {
    if (!installPrompt) return;
    
    setIsInstalling(true);
    // trackInstallPrompt(); // Rastrear prompt mostrado
    
    try {
      await installApp();
      onInstall?.();
        logger.info('PWA installed successfully');
        // trackInstallation('browser-prompt'); // Rastrear instalação bem-sucedida
    } catch (error: unknown) {
      logger.error('PWA installation failed', { error });
      // trackError(error.toString(), 'install-process');
    } finally {
      setIsInstalling(false);
    }
  };
  
  const handleDismiss = () => {
    dismissUpdate();
    onDismiss?.();
  };

  // Don't render if conditions not met
  if (!isSupported || isInstalled || !promptVisible) {
    return null;
  }

    return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                Instalar App
              </h3>
              <p className="text-sm text-muted-foreground">
                Acesso rápido e offline disponível
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            PWA
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-green-500">✓</span>
            <span>Funciona offline</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-green-500">✓</span>
            <span>Carregamento instantâneo</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-green-500">✓</span>
            <span>Notificações em tempo real</span>
        </div>
      </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1"
          >
            {isInstalling ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Instalando...
              </>
            ) : (
              <>
                <span className="mr-2">⬇️</span>
                Instalar
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            disabled={isInstalling}
          >
            Agora não
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Componente adicional para mostrar status PWA no header (opcional)
export const PWAStatus: React.FC = () => {
  const { isInstalled, isOffline, hasUpdate } = usePWA();
  
  if (!isInstalled && !isOffline && !hasUpdate) {
    return null;
  }
  
  const statusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '1rem',
    background: 'rgba(139, 92, 246, 0.1)',
    color: '#8B5CF6',
    border: '1px solid rgba(139, 92, 246, 0.2)'
  };
  
  return (
    <div style={statusStyle}>
      {isInstalled && <span title="Rodando como PWA">📱</span>}
      {isOffline && <span title="Offline">⚠️</span>}
      {hasUpdate && <span title="Atualização disponível">🔄</span>}
      {isInstalled ? 'PWA' : isOffline ? 'Offline' : hasUpdate ? 'Update' : ''}
    </div>
  );
};