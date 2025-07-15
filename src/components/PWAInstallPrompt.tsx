import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface PWAInstallPromptProps {
  onClose?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installResult, setInstallResult] = useState<'success' | 'failed' | null>(null);

  const {
    canInstall,
    isInstalled,
    isStandalone,
    isOnline,
    swUpdateAvailable,
    showInstallPrompt,
    updateServiceWorker,
    isIOSDevice,
    isAndroidDevice,
    getInstallInstructions
  } = usePWA();

  // Mostrar prompt automaticamente se puder instalar
  useEffect(() => {
    if (canInstall && !isInstalled && !isStandalone) {
      const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown');
      if (!hasShownPrompt) {
        setShowPrompt(true);
      }
    }
  }, [canInstall, isInstalled, isStandalone]);

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const success = await showInstallPrompt();
      
      if (success) {
        setInstallResult('success');
        localStorage.setItem('pwa-install-prompt-shown', 'true');
        setTimeout(() => {
          setShowPrompt(false);
          onClose?.();
        }, 2000);
      } else {
        setInstallResult('failed');
        setTimeout(() => {
          setInstallResult(null);
          setIsInstalling(false);
        }, 2000);
      }
    } catch (error) {
      setInstallResult('failed');
      console.error('Install failed:', error);
      setTimeout(() => {
        setInstallResult(null);
        setIsInstalling(false);
      }, 2000);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-shown', 'true');
    onClose?.();
  };

  const handleUpdateApp = async () => {
    try {
      await updateServiceWorker();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (!showPrompt || isInstalled || isStandalone) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Instalar Roteirar IA
              </h3>
              <p className="text-sm text-gray-500">
                Acesso rápido e recursos offline
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${
            isOnline ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {isOnline ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Conectado' : 'Offline'}
            </span>
          </div>

          {/* Update Available */}
          {swUpdateAvailable && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-blue-50 text-blue-800">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">
                Atualização disponível!
              </span>
              <button
                onClick={handleUpdateApp}
                className="ml-auto px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Atualizar
              </button>
            </div>
          )}

          {/* Benefits */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Benefícios do App:
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Acesso mais rápido na tela inicial
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Funciona offline para visualizar ideias
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Notificações para novas funcionalidades
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Interface otimizada para mobile
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Menos uso de dados e bateria
              </li>
            </ul>
          </div>

          {/* Platform specific instructions */}
          {(isIOSDevice() || isAndroidDevice()) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Como instalar:
              </h4>
              <p className="text-sm text-gray-600">
                {getInstallInstructions()}
              </p>
            </div>
          )}

          {/* Install Result */}
          {installResult && (
            <div className={`mb-4 p-3 rounded-lg ${
              installResult === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {installResult === 'success' ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      App instalado com sucesso!
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Falha na instalação. Tente novamente.
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Agora não
            </button>
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Instalando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Instalar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Tamanho: ~2MB</span>
            <span>Versão: 1.0.0</span>
            <span>Funciona offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar status PWA na interface
export const PWAStatus: React.FC = () => {
  const { isInstalled, isStandalone, isOnline, swUpdateAvailable } = usePWA();

  if (!isInstalled && !isStandalone) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Install Status */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
        isStandalone ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}>
        <Smartphone className="w-3 h-3" />
        <span>{isStandalone ? 'App' : 'Web'}</span>
      </div>

      {/* Online Status */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
        isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isOnline ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      {/* Update Available */}
      {swUpdateAvailable && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800">
          <RefreshCw className="w-3 h-3" />
          <span>Atualização</span>
        </div>
      )}
    </div>
  );
};

export default PWAInstallPrompt; 