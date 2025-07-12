/**
 * ShareButton Component - Collaboration Sharing
 * Week 8 - IA Alpha - Collaboration Frontend Implementation
 */

import React, { useState, useCallback } from 'react';
import { Share2, Copy, Users, Link, ExternalLink } from 'lucide-react';
import { useCollaboration } from '../hooks/useCollaboration';
import type { ShareButtonProps } from '../types/collaboration.types';

/**
 * Share button component for starting collaboration and sharing projects
 */
export function ShareButton({
  projectId,
  onShare,
  disabled = false,
  size = 'medium'
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const collaboration = useCollaboration(projectId);

  // Size variants
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  // Handle starting collaboration
  const handleStartCollaboration = useCallback(async () => {
    if (collaboration.isActive) {
      setIsOpen(!isOpen);
      return;
    }

    const settings = {
      allowEdit: true,
      allowComment: true,
      allowVoiceChat: false,
      maxParticipants: 10
    };

    try {
      await collaboration.createSession(projectId, settings);
      setIsOpen(true);
    } catch (error) {
      console.error('❌ Failed to create collaboration session:', error);
    }
  }, [collaboration, projectId, isOpen]);

  // Handle copying share link
  const handleCopyLink = useCallback(async () => {
    if (!collaboration.session) return;

    const shareLink = `${window.location.origin}/collaborate/${collaboration.session.id}`;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      onShare(shareLink);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      console.log('✅ Share link copied to clipboard');
    } catch (error) {
      console.error('❌ Failed to copy share link:', error);
    }
  }, [collaboration.session, onShare]);

  // Handle opening link in new tab
  const handleOpenLink = useCallback(() => {
    if (!collaboration.session) return;
    
    const shareLink = `${window.location.origin}/collaborate/${collaboration.session.id}`;
    window.open(shareLink, '_blank');
  }, [collaboration.session]);

  return (
    <div className="relative">
      {/* Main Share Button */}
      <button
        onClick={handleStartCollaboration}
        disabled={disabled || collaboration.isLoading}
        className={`
          ${sizeClasses[size]}
          bg-indigo-600 text-white rounded-lg 
          hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center space-x-2 transition-colors duration-200
        `}
      >
        {collaboration.isLoading ? (
          <>
            <div className={`${iconSizes[size]} animate-spin rounded-full border-2 border-white border-t-transparent`} />
            <span>Carregando...</span>
          </>
        ) : collaboration.isActive ? (
          <>
            <Users className={iconSizes[size]} />
            <span>
              {collaboration.participants.length > 1 
                ? `${collaboration.participants.length} pessoas`
                : 'Colaborando'
              }
            </span>
          </>
        ) : (
          <>
            <Share2 className={iconSizes[size]} />
            <span>Compartilhar</span>
          </>
        )}
      </button>

      {/* Share Options Dropdown */}
      {isOpen && collaboration.isActive && collaboration.session && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Compartilhar Colaboração
            </h3>
            
            {/* Share Link */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Link de Compartilhamento
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 truncate">
                      /collaborate/{collaboration.session.id.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center space-x-2 text-sm"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
              
              <button
                onClick={handleOpenLink}
                className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 flex items-center justify-center space-x-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir</span>
              </button>
            </div>

            {/* Session Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Participantes ativos</span>
                <span className="font-medium">
                  {collaboration.onlineParticipants.length} de {collaboration.participants.length}
                </span>
              </div>
              
              {collaboration.session.settings.allowEdit && (
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>Edição</span>
                  <span className="text-green-600 font-medium">Permitida</span>
                </div>
              )}
              
              {collaboration.session.settings.allowComment && (
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>Comentários</span>
                  <span className="text-green-600 font-medium">Permitidos</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Close button */}
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Status Indicator */}
      {collaboration.isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}
