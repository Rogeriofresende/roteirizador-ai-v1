import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { usePWA } from '../hooks/usePWA';
import { createLogger } from '../utils/logger';
// import { usePWAAnalytics } from '../hooks/usePWAAnalytics';

const logger = createLogger('PWAInstall');

interface PWAInstallProps {
  variant?: 'button' | 'banner' | 'card';
  showOnMobile?: boolean;
  className?: string;
}

export const PWAInstall: React.FC<PWAInstallProps> = ({
  variant = 'button',
  showOnMobile = true,
  className = ''
}) => {
  const { 
    isInstallable, 
    isInstalled, 
    isOffline, 
    hasUpdate, 
    install, 
    update, 
    dismissUpdate,
    showInstallPrompt,
    canInstall
  } = usePWA();
  
  // const { trackInstallPrompt, trackInstallation, trackError } = usePWAAnalytics();
  
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showOfflineDetails, setShowOfflineDetails] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar se é mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Mostrar apenas se pode instalar e não está instalado
    setIsVisible(canInstall && !isInstalled && (showOnMobile || !isMobile));
  }, [canInstall, isInstalled, showOnMobile, isMobile]);

  // Não mostrar nada se já instalado e tudo OK
  if (isInstalled && !hasUpdate && !isOffline) {
    return null;
  }
  
  const handleInstall = async () => {
    setIsInstalling(true);
    // trackInstallPrompt(); // Rastrear prompt mostrado
    
    try {
      const success = await install();
      if (success) {
        logger.info('PWA installed successfully');
        setIsVisible(false);
        // trackInstallation('browser-prompt'); // Rastrear instalação bem-sucedida
      }
    } catch (error) {
      logger.error('PWA installation failed', { error });
      // trackError(error.toString(), 'install-process');
    } finally {
      setIsInstalling(false);
    }
  };
  
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await update();
    } catch (error) {
      console.error('PWA Install: Update failed', error);
      setIsUpdating(false);
    }
  };
  
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '1rem',
    left: '1rem',
    right: '1rem',
    background: 'rgba(139, 92, 246, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '1rem',
    padding: '1rem',
    color: 'white',
    zIndex: 1000,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '500px',
    margin: '0 auto',
    '@media (min-width: 768px)': {
      left: '50%',
      right: 'auto',
      transform: 'translateX(-50%)'
    }
  };
  
  const buttonStyle: React.CSSProperties = {
    background: 'white',
    color: '#8B5CF6',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '120px',
    justifyContent: 'center'
  };
  
  const dismissButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'transparent',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    minWidth: 'auto',
    padding: '0.5rem'
  };
  
  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem'
  };
  
  const lastSectionStyle: React.CSSProperties = {
    ...sectionStyle,
    marginBottom: 0
  };
  
  const contentStyle: React.CSSProperties = {
    flex: 1
  };
  
  const titleStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '1rem',
    marginBottom: '0.25rem'
  };
  
  const descriptionStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    opacity: 0.9,
    lineHeight: 1.4
  };
  
  if (!isVisible) return null;

  const content = {
    title: isMobile ? 'Instalar App' : 'Instalar Roteirar IA',
    description: isMobile 
      ? 'Adicione à sua tela inicial' 
      : 'Instale o app para acesso rápido offline',
    button: isMobile ? '📱 Instalar' : '💻 Instalar App'
  };

  if (variant === 'banner') {
    return (
      <div className={`fixed bottom-4 left-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50 md:left-auto md:right-4 md:max-w-sm ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-card-foreground mb-1">
              {content.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {content.description}
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleInstall}
                size="sm"
                className="flex-1 md:flex-none"
              >
                {content.button}
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="outline"
                size="sm"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="font-semibold text-card-foreground mb-2">
            {content.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {content.description}
          </p>
          <Button onClick={handleInstall} className="w-full">
            {content.button}
          </Button>
        </div>
      </div>
    );
  }

  // variant === 'button' (default)
  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className={className}
    >
      {content.button}
    </Button>
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

export default PWAInstall; 