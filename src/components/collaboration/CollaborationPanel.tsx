/**
 * COLLABORATION PANEL - SPRINT 4
 * Real-time collaboration interface component
 * V7.5 Enhanced - IA Beta Implementation
 */

import React, { useState, useEffect, useRef } from 'react';
import { useCollaboration } from '../../hooks/useCollaboration';
import { CollaborationParticipant, CreateSessionRequest } from '../../services/collaboration/CollaborationService';

interface CollaborationPanelProps {
  initialIdea?: string;
  onIdeaChange?: (idea: string) => void;
  className?: string;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  initialIdea = '',
  onIdeaChange,
  className = ''
}) => {
  const {
    isConnected,
    currentSession,
    participants,
    isCreating,
    isJoining,
    error,
    cursors,
    createSession,
    joinSession,
    leaveSession,
    updateIdea,
    setTypingStatus,
    getOnlineParticipants,
    getTypingParticipants
  } = useCollaboration();

  const [sessionTitle, setSessionTitle] = useState('');
  const [joinSessionId, setJoinSessionId] = useState('');
  const [ideaText, setIdeaText] = useState(initialIdea);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'session'>('create');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle idea changes
  useEffect(() => {
    if (currentSession && ideaText !== currentSession.currentIdea) {
      setIdeaText(currentSession.currentIdea);
      onIdeaChange?.(currentSession.currentIdea);
    }
  }, [currentSession, onIdeaChange]);

  // Handle typing status
  const handleIdeaChange = (value: string) => {
    setIdeaText(value);
    setTypingStatus(true);
    
    // Debounce typing status
    const timeout = setTimeout(() => {
      setTypingStatus(false);
    }, 1000);

    return () => clearTimeout(timeout);
  };

  // Handle idea update
  const handleIdeaBlur = () => {
    if (currentSession && ideaText !== currentSession.currentIdea) {
      updateIdea(ideaText);
    }
  };

  // Create new session
  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) return;

    const request: CreateSessionRequest = {
      title: sessionTitle,
      initialIdea: ideaText,
      permissions: {
        canEdit: true,
        canComment: true,
        canShare: true,
        canInvite: true
      }
    };

    const session = await createSession(request);
    if (session) {
      setActiveTab('session');
      setInviteLink(`${window.location.origin}/collaborate/${session.id}`);
    }
  };

  // Join existing session
  const handleJoinSession = async () => {
    if (!joinSessionId.trim()) return;

    const request = {
      sessionId: joinSessionId,
      userId: localStorage.getItem('userId') || 'anonymous',
      username: localStorage.getItem('username') || 'Usuário'
    };

    const session = await joinSession(request);
    if (session) {
      setActiveTab('session');
    }
  };

  // Copy invite link
  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      // Show success toast
    } catch (error) {
      console.error('Failed to copy invite link:', error);
    }
  };

  // Get participant color
  const getParticipantColor = (participant: CollaborationParticipant) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const index = participants.indexOf(participant);
    return colors[index % colors.length];
  };

  // Render cursors
  const renderCursors = () => {
    const currentUserId = localStorage.getItem('userId') || 'anonymous';
    
    return Array.from(cursors.entries())
      .filter(([userId]) => userId !== currentUserId)
      .map(([userId, cursor]) => {
        const participant = participants.find(p => p.userId === userId);
        if (!participant) return null;

        return (
          <div
            key={userId}
            className="fixed pointer-events-none z-50 transform -translate-x-1 -translate-y-1"
            style={{
              left: cursor.x,
              top: cursor.y,
              color: cursor.color
            }}
          >
            <div className="flex items-center space-x-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cursor.color }}
              />
              <span className="text-xs bg-black text-white px-1 py-0.5 rounded">
                {participant.username}
              </span>
            </div>
          </div>
        );
      });
  };

  if (!isConnected) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Connecting to collaboration server...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {currentSession ? 'Colaboração Ativa' : 'Colaboração em Tempo Real'}
          </h3>
          {currentSession && (
            <button
              onClick={leaveSession}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Sair
            </button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="px-4 py-2 bg-green-50 border-b border-green-200">
        <div className="flex items-center space-x-2 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm">Conectado ao servidor</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* Tabs */}
      {!currentSession && (
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'create' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Criar Sessão
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'join' 
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('join')}
          >
            Entrar em Sessão
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {!currentSession ? (
          <>
            {/* Create Session Tab */}
            {activeTab === 'create' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Sessão
                  </label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Brainstorm de ideias para YouTube"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ideia Inicial (opcional)
                  </label>
                  <textarea
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Compartilhe sua ideia inicial..."
                  />
                </div>
                <button
                  onClick={handleCreateSession}
                  disabled={isCreating || !sessionTitle.trim()}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Criando...' : 'Criar Sessão'}
                </button>
              </div>
            )}

            {/* Join Session Tab */}
            {activeTab === 'join' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID da Sessão
                  </label>
                  <input
                    type="text"
                    value={joinSessionId}
                    onChange={(e) => setJoinSessionId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cole o ID da sessão aqui"
                  />
                </div>
                <button
                  onClick={handleJoinSession}
                  disabled={isJoining || !joinSessionId.trim()}
                  className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isJoining ? 'Entrando...' : 'Entrar na Sessão'}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Active Session */}
            <div className="space-y-4">
              {/* Session Info */}
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-800">{currentSession.title}</h4>
                    <p className="text-sm text-blue-600">ID: {currentSession.id}</p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Convidar
                  </button>
                </div>
              </div>

              {/* Participants */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2">
                  Participantes ({getOnlineParticipants().length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.userId}
                      className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-full text-sm"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getParticipantColor(participant) }}
                      />
                      <span className={participant.status === 'online' ? 'text-gray-800' : 'text-gray-500'}>
                        {participant.username}
                        {participant.role === 'owner' && ' (Dono)'}
                      </span>
                      {participant.status === 'online' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Typing Indicators */}
              {getTypingParticipants().length > 0 && (
                <div className="text-sm text-gray-500 italic">
                  {getTypingParticipants().map(p => p.username).join(', ')} está digitando...
                </div>
              )}

              {/* Collaborative Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ideia Colaborativa
                </label>
                <textarea
                  ref={textareaRef}
                  value={ideaText}
                  onChange={(e) => handleIdeaChange(e.target.value)}
                  onBlur={handleIdeaBlur}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={6}
                  placeholder="Colabore em tempo real com sua equipe..."
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Convidar Colaboradores</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link de Convite
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cursors */}
      {renderCursors()}
    </div>
  );
};

export default CollaborationPanel; 