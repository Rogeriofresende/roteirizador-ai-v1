/**
 * CollaborationPanel Component - Real-time Collaboration Interface
 * Week 8 - IA Alpha - Collaboration Frontend Implementation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  MessageCircle, 
  Settings, 
  X, 
  Share2, 
  Crown, 
  Eye, 
  Edit3, 
  MessageSquare,
  Circle,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useCollaboration } from '../hooks/useCollaboration';
import type { 
  CollaborationPanelProps,
  CollaborationParticipant,
  CollaborationMessage 
} from '../types/collaboration.types';

/**
 * Main collaboration panel component
 * Provides real-time collaboration features including participants, chat, and settings
 */
export function CollaborationPanel({
  projectId,
  isVisible,
  onClose,
  currentUserId
}: CollaborationPanelProps) {
  // Collaboration state and actions
  const collaboration = useCollaboration(projectId, {
    onParticipantJoined: (participant) => {
      console.log('👥 Participant joined:', participant.displayName);
      // Show notification
    },
    onParticipantLeft: (participantId) => {
      console.log('👥 Participant left:', participantId);
      // Show notification  
    },
    onMessageReceived: (message) => {
      console.log('💬 New message:', message.content);
      // Show notification
    },
    onError: (error, details) => {
      console.error('❌ Collaboration error:', error, details);
      // Show error notification
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'participants' | 'chat' | 'settings'>('participants');
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [shareLink, setShareLink] = useState('');

  // Generate share link when session is active
  useEffect(() => {
    if (collaboration.session) {
      const link = `${window.location.origin}/collaborate/${collaboration.session.id}`;
      setShareLink(link);
    }
  }, [collaboration.session]);

  // Handle sending chat messages
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await collaboration.sendMessage(newMessage.trim());
    setNewMessage('');
  }, [newMessage, collaboration.sendMessage]);

  // Handle copying share link
  const handleCopyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // Show success notification
      console.log('✅ Share link copied to clipboard');
    } catch (error) {
      console.error('❌ Failed to copy share link:', error);
    }
  }, [shareLink]);

  // Handle starting collaboration session
  const handleStartCollaboration = useCallback(async () => {
    const settings = {
      allowEdit: true,
      allowComment: true,
      allowVoiceChat: false,
      maxParticipants: 10
    };

    await collaboration.createSession(projectId, settings);
  }, [collaboration.createSession, projectId]);

  // Render participant status icon
  const renderParticipantStatus = (participant: CollaborationParticipant) => {
    const statusColors = {
      online: 'text-green-500',
      away: 'text-yellow-500',
      offline: 'text-gray-400'
    };

    return (
      <Circle 
        className={`w-3 h-3 fill-current ${statusColors[participant.status]}`}
      />
    );
  };

  // Render participant role icon
  const renderParticipantRole = (participant: CollaborationParticipant) => {
    switch (participant.role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor':
        return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'commenter':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-20 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">
            Colaboração
          </h3>
          {collaboration.isActive && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Ativa
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Start Collaboration Button */}
          {!collaboration.isActive && (
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={handleStartCollaboration}
                disabled={collaboration.isLoading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>
                  {collaboration.isLoading ? 'Iniciando...' : 'Iniciar Colaboração'}
                </span>
              </button>
            </div>
          )}

          {/* Share Link */}
          {collaboration.isActive && shareLink && (
            <div className="p-4 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link de Compartilhamento
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                />
                <button
                  onClick={handleCopyShareLink}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Copiar link"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.open(shareLink, '_blank')}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          {collaboration.isActive && (
            <>
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('participants')}
                  className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'participants'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>Pessoas</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {collaboration.participants.length}
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'chat'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                    {collaboration.messages.length > 0 && (
                      <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full text-xs">
                        {collaboration.messages.length}
                      </span>
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === 'settings'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Content */}
              <div className="h-64 overflow-y-auto">
                {/* Participants Tab */}
                {activeTab === 'participants' && (
                  <div className="p-4 space-y-3">
                    {collaboration.participants.map((participant) => (
                      <div
                        key={participant.userId}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-shrink-0">
                          {participant.avatar ? (
                            <img
                              src={participant.avatar}
                              alt={participant.displayName}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {participant.displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {participant.displayName}
                              {participant.userId === currentUserId && (
                                <span className="text-gray-500 ml-1">(você)</span>
                              )}
                            </p>
                            {renderParticipantRole(participant)}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {participant.email}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0">
                          {renderParticipantStatus(participant)}
                        </div>
                      </div>
                    ))}
                    
                    {collaboration.participants.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum participante ativo</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full">
                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                      {collaboration.messages.map((message) => {
                        const isOwn = message.userId === currentUserId;
                        const participant = collaboration.getParticipantById(message.userId);
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isOwn ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {!isOwn && (
                                <p className="text-xs opacity-75 mb-1">
                                  {participant?.displayName || 'Usuário'}
                                </p>
                              )}
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        );
                      })}
                      
                      {collaboration.messages.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nenhuma mensagem ainda</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Message Input */}
                    <div className="border-t border-gray-200 p-4">
                      <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Digite uma mensagem..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Enviar
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Configurações da Sessão
                      </h4>
                      {collaboration.session && (
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Permitir edição:</span>
                            <span className={collaboration.session.settings.allowEdit ? 'text-green-600' : 'text-red-600'}>
                              {collaboration.session.settings.allowEdit ? 'Sim' : 'Não'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Permitir comentários:</span>
                            <span className={collaboration.session.settings.allowComment ? 'text-green-600' : 'text-red-600'}>
                              {collaboration.session.settings.allowComment ? 'Sim' : 'Não'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Máx. participantes:</span>
                            <span>{collaboration.session.settings.maxParticipants}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {collaboration.isHost && (
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={collaboration.leaveSession}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Encerrar Sessão
                        </button>
                      </div>
                    )}
                    
                    {!collaboration.isHost && (
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={collaboration.leaveSession}
                          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Sair da Sessão
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Error Display */}
          {collaboration.error && (
            <div className="p-4 bg-red-50 border-t border-red-200">
              <p className="text-sm text-red-600">{collaboration.error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
