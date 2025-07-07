import React, { useState } from 'react';
import { Button } from './ui/Button';

interface ShareData {
  title: string;
  text: string;
  url?: string;
  content?: string;
}

interface ShareButtonProps {
  shareData: ShareData;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  children?: React.ReactNode;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  shareData,
  className = '',
  size = 'md',
  variant = 'outline',
  children,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Verificar se Web Share API está disponível
  const isWebShareSupported = typeof navigator !== 'undefined' && 'share' in navigator;

  const handleNativeShare = async () => {
    if (!isWebShareSupported) {
      setShowFallback(true);
      return;
    }

    setIsSharing(true);

    try {
      const sharePayload: ShareData = {
        title: shareData.title,
        text: shareData.text,
        ...(shareData.url && { url: shareData.url }),
      };

      await navigator.share(sharePayload);
      console.log('Share API: Content shared successfully');
    } catch (error: unknown) {
      // Usuário cancelou ou erro no compartilhamento
      if (error.name !== 'AbortError') {
        console.error('Share API: Error sharing content', error);
        setShowFallback(true);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleFallbackShare = () => {
    // Fallback para navegadores sem Web Share API
    const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.content || ''}\n\n${shareData.url || window.location.href}`;
    
    // Tentar copiar para clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Roteiro copiado para a área de transferência! 📋');
      }).catch(() => {
        // Fallback para métodos tradicionais
        openFallbackOptions(shareText);
      });
    } else {
      openFallbackOptions(shareText);
    }
  };

  const openFallbackOptions = (text: string) => {
    const encodedText = encodeURIComponent(text);
    const url = shareData.url || window.location.href;
    const encodedUrl = encodeURIComponent(url);

    const options = [
      {
        name: 'WhatsApp',
        url: `https://wa.me/?text=${encodedText}`,
        icon: '💬',
      },
      {
        name: 'Telegram',
        url: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareData.title)}`,
        icon: '✈️',
      },
      {
        name: 'Twitter',
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodedUrl}`,
        icon: '🐦',
      },
      {
        name: 'Email',
        url: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodedText}`,
        icon: '📧',
      },
    ];

    // Criar mini modal com opções
    const modalHtml = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: system-ui, sans-serif;
      " id="share-modal">
        <div style="
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        ">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">Compartilhar Roteiro</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            ${options.map(option => `
              <a href="${option.url}" target="_blank" style="
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                border: 1px solid #e5e5e5;
                border-radius: 8px;
                text-decoration: none;
                color: #333;
                font-size: 14px;
                transition: all 0.2s;
              " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">
                <span style="font-size: 18px;">${option.icon}</span>
                ${option.name}
              </a>
            `).join('')}
          </div>
          <button onclick="document.getElementById('share-modal').remove()" style="
            width: 100%;
            padding: 12px;
            background: #6366f1;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
          ">Fechar</button>
        </div>
      </div>
    `;

    // Remover modal existente se houver
    const existingModal = document.getElementById('share-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Adicionar novo modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  const handleShare = () => {
    if (isWebShareSupported) {
      handleNativeShare();
    } else {
      handleFallbackShare();
    }
  };

  if (showFallback && isWebShareSupported) {
    setShowFallback(false);
    handleFallbackShare();
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={isSharing}
      className={`${className} transition-all duration-200`}
      title={isWebShareSupported ? 'Compartilhar usando app nativo' : 'Compartilhar roteiro'}
    >
      {isSharing ? (
        <>
          <span className="animate-spin inline-block">⟳</span>
          Compartilhando...
        </>
      ) : (
        <>
          {children || (
            <>
              <span className="text-lg">🔗</span>
              Compartilhar
            </>
          )}
        </>
      )}
    </Button>
  );
};

// Hook para compartilhamento programático
export const useShare = () => {
  const isWebShareSupported = typeof navigator !== 'undefined' && 'share' in navigator;

  const shareContent = async (data: ShareData): Promise<boolean> => {
    if (!isWebShareSupported) {
      console.warn('Web Share API not supported');
      return false;
    }

    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        ...(data.url && { url: data.url }),
      });
      return true;
    } catch (error: unknown) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return false;
    }
  };

  const canShare = (data: ShareData): boolean => {
    if (!isWebShareSupported) return false;
    return navigator.canShare ? navigator.canShare(data) : true;
  };

  return {
    shareContent,
    canShare,
    isSupported: isWebShareSupported,
  };
};

export default ShareButton; 