import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
// import { usePWAAnalytics } from '../hooks/usePWAAnalytics';

export const PWAInstall: React.FC = () => {
  const { 
    isInstallable, 
    isInstalled, 
    isOffline, 
    hasUpdate, 
    install, 
    update, 
    dismissUpdate,
    showInstallPrompt 
  } = usePWA();
  
  // const { trackInstallPrompt, trackInstallation, trackError } = usePWAAnalytics();
  
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showOfflineDetails, setShowOfflineDetails] = useState(false);
  
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
        console.log('PWA Install: Successfully installed');
        // trackInstallation('browser-prompt'); // Rastrear instalação bem-sucedida
      }
    } catch (error) {
      console.error('PWA Install: Installation failed', error);
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
  
  return (
    <div style={containerStyle}>
      {/* Offline Indicator */}
      {isOffline && (
        <div style={sectionStyle}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div style={contentStyle}>
            <div style={titleStyle}>Você está offline</div>
            <div style={descriptionStyle}>
              {showOfflineDetails ? (
                <>
                  Interface disponível • Conecte-se para gerar novos roteiros • 
                  Últimos roteiros podem estar no cache local
                </>
              ) : (
                'Algumas funcionalidades podem não estar disponíveis'
              )}
            </div>
          </div>
          <button
            onClick={() => setShowOfflineDetails(!showOfflineDetails)}
            style={dismissButtonStyle}
            title={showOfflineDetails ? 'Menos detalhes' : 'Mais detalhes'}
          >
            {showOfflineDetails ? '▲' : '▼'}
          </button>
        </div>
      )}
      
      {/* Update Available */}
      {hasUpdate && (
        <div style={hasUpdate && isOffline ? sectionStyle : lastSectionStyle}>
          <span style={{ fontSize: '1.5rem' }}>🔄</span>
          <div style={contentStyle}>
            <div style={titleStyle}>Nova versão disponível!</div>
            <div style={descriptionStyle}>
              Atualize para acessar as últimas funcionalidades e melhorias de performance.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={dismissUpdate}
              style={dismissButtonStyle}
              title="Dispensar atualização"
            >
              ✕
            </button>
            <button
              onClick={handleUpdate}
              style={buttonStyle}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <span style={{ 
                    animation: 'spin 1s linear infinite',
                    display: 'inline-block'
                  }}>⟳</span>
                  Atualizando...
                </>
              ) : (
                <>
                  🚀 Atualizar
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Install Prompt */}
      {isInstallable && !isInstalled && (
        <div style={lastSectionStyle}>
          <span style={{ fontSize: '1.5rem' }}>📱</span>
          <div style={contentStyle}>
            <div style={titleStyle}>Instalar Roteirar IA</div>
            <div style={descriptionStyle}>
              Adicione à tela inicial para acesso rápido como um app nativo. 
              Funciona offline e sempre atualizado!
            </div>
          </div>
          <button
            onClick={handleInstall}
            style={buttonStyle}
            disabled={isInstalling}
          >
            {isInstalling ? (
              <>
                <span style={{ 
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block'
                }}>⟳</span>
                Instalando...
              </>
            ) : (
              <>
                ⬇️ Instalar
              </>
            )}
          </button>
        </div>
      )}
      
      {/* Keyframes para animação de loading */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (hover: hover) {
            .pwa-button:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
          }
          
          @media (max-width: 640px) {
            .pwa-container {
              margin: 0 0.5rem;
            }
            
            .pwa-section {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.75rem;
            }
            
            .pwa-buttons {
              width: 100%;
              justify-content: flex-end;
            }
          }
        `}
      </style>
    </div>
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