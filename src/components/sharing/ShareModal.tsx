/**
 * SHARE MODAL - SPRINT 4
 * Advanced sharing modal with multiple platforms
 * V7.5 Enhanced - IA Beta Implementation
 */

import React, { useState, useEffect } from 'react';
import { useSharing } from '../../hooks/useSharing';
import { ShareableItem, SharePermissions } from '../../services/sharing/SharingService';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: ShareableItem;
  type?: ShareableItem['type'];
  title?: string;
  content?: string;
  quickShare?: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  item,
  type = 'idea',
  title = '',
  content = '',
  quickShare = false
}) => {
  const {
    isSharing,
    isCreating,
    error,
    lastSharedLink,
    shareItem,
    quickShare: performQuickShare,
    shareViaEmail,
    shareViaSocial,
    copyToClipboard,
    formatShareMessage
  } = useSharing();

  const [activeTab, setActiveTab] = useState<'link' | 'email' | 'social'>('link');
  const [permissions, setPermissions] = useState<SharePermissions>({
    isPublic: true,
    allowComments: true,
    allowCopy: true,
    allowEdit: false,
    allowDownload: true
  });
  const [shareMessage, setShareMessage] = useState('');
  const [recipientEmails, setRecipientEmails] = useState<string[]>(['']);
  const [selectedSocial, setSelectedSocial] = useState<'whatsapp' | 'telegram' | 'twitter' | 'linkedin'>('whatsapp');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Social platform configurations
  const socialPlatforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '📱', color: 'bg-green-500' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', color: 'bg-blue-500' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-400' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' }
  ];

  // Update share link when lastSharedLink changes
  useEffect(() => {
    if (lastSharedLink) {
      setShareLink(lastSharedLink.shortUrl);
    }
  }, [lastSharedLink]);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('link');
      setShareMessage('');
      setRecipientEmails(['']);
      setCopied(false);
      setShareLink('');
    }
  }, [isOpen]);

  // Handle quick share
  const handleQuickShare = async (platform: 'copy' | 'whatsapp' | 'telegram' | 'twitter' | 'linkedin' | 'email') => {
    if (!title || !content) return;

    const result = await performQuickShare(
      type,
      title,
      content,
      platform,
      permissions
    );

    if (result.success && result.shareLink) {
      setShareLink(result.shareLink.shortUrl);
    }
  };

  // Handle share via link
  const handleShareViaLink = async () => {
    if (item) {
      const result = await shareItem({
        itemId: item.id,
        permissions,
        platform: 'copy'
      });

      if (result.success && result.shareLink) {
        setShareLink(result.shareLink.shortUrl);
      }
    } else if (quickShare) {
      await handleQuickShare('copy');
    }
  };

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    if (shareLink) {
      const success = await copyToClipboard({ shortUrl: shareLink } as any);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  // Handle email share
  const handleEmailShare = async () => {
    const validEmails = recipientEmails.filter(email => email.trim() && email.includes('@'));
    if (validEmails.length === 0) return;

    if (item) {
      await shareViaEmail(item.id, validEmails, shareMessage, permissions);
    } else if (quickShare) {
      await handleQuickShare('email');
    }
  };

  // Handle social share
  const handleSocialShare = async () => {
    if (item) {
      await shareViaSocial(item.id, selectedSocial, shareMessage, permissions);
    } else if (quickShare) {
      await handleQuickShare(selectedSocial);
    }
  };

  // Add email input
  const addEmailInput = () => {
    setRecipientEmails([...recipientEmails, '']);
  };

  // Remove email input
  const removeEmailInput = (index: number) => {
    setRecipientEmails(recipientEmails.filter((_, i) => i !== index));
  };

  // Update email
  const updateEmail = (index: number, email: string) => {
    const updated = [...recipientEmails];
    updated[index] = email;
    setRecipientEmails(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Compartilhar {type === 'idea' ? 'Ideia' : 'Conteúdo'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {(item || title) && (
            <p className="text-gray-600 mt-2">{item?.title || title}</p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'link' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('link')}
          >
            Link de Compartilhamento
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'email' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('email')}
          >
            Email
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'social' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('social')}
          >
            Redes Sociais
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Link Tab */}
          {activeTab === 'link' && (
            <div className="space-y-6">
              {/* Permissions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Permissões</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions.isPublic}
                      onChange={(e) => setPermissions({...permissions, isPublic: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Tornar público</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions.allowComments}
                      onChange={(e) => setPermissions({...permissions, allowComments: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Permitir comentários</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions.allowCopy}
                      onChange={(e) => setPermissions({...permissions, allowCopy: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Permitir cópia</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={permissions.allowDownload}
                      onChange={(e) => setPermissions({...permissions, allowDownload: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Permitir download</span>
                  </label>
                </div>
              </div>

              {/* Generate Link */}
              <div>
                <button
                  onClick={handleShareViaLink}
                  disabled={isSharing || isCreating}
                  className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSharing || isCreating ? 'Gerando...' : 'Gerar Link de Compartilhamento'}
                </button>
              </div>

              {/* Share Link */}
              {shareLink && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link de Compartilhamento
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 p-2 border border-gray-300 rounded-md bg-white"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        copied 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              {/* Recipients */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Destinatários</h3>
                <div className="space-y-2">
                  {recipientEmails.map((email, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        placeholder="email@exemplo.com"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {recipientEmails.length > 1 && (
                        <button
                          onClick={() => removeEmailInput(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addEmailInput}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    + Adicionar email
                  </button>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Adicione uma mensagem personalizada..."
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleEmailShare}
                disabled={isSharing || recipientEmails.filter(e => e.trim() && e.includes('@')).length === 0}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSharing ? 'Enviando...' : 'Enviar por Email'}
              </button>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Selecionar Plataforma</h3>
                <div className="grid grid-cols-2 gap-3">
                  {socialPlatforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedSocial(platform.id as any)}
                      className={`p-3 rounded-md border-2 transition-colors ${
                        selectedSocial === platform.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{platform.icon}</span>
                        <span className="font-medium">{platform.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder={`Mensagem para ${socialPlatforms.find(p => p.id === selectedSocial)?.name}...`}
                />
              </div>

              {/* Share Button */}
              <button
                onClick={handleSocialShare}
                disabled={isSharing}
                className={`w-full py-3 px-4 text-white rounded-md transition-colors ${
                  socialPlatforms.find(p => p.id === selectedSocial)?.color || 'bg-blue-500'
                } hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {isSharing ? 'Compartilhando...' : `Compartilhar no ${socialPlatforms.find(p => p.id === selectedSocial)?.name}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 