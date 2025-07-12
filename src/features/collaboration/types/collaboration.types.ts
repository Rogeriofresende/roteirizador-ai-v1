/**
 * Collaboration Feature Types
 * Week 8 - IA Alpha - Collaboration Frontend Implementation
 */

import { Timestamp } from 'firebase/firestore';

// Re-export main collaboration types from global types
export type {
  CollaborationSession,
  CollaborationParticipant,
  RealtimeEdit,
  Comment,
  CommentReply,
  CollaborationMessage
} from '../../../types';

// Feature-specific types for UI components
export interface CollaborationPanelProps {
  projectId: string;
  isVisible: boolean;
  onClose: () => void;
  currentUserId: string;
}

export interface ParticipantListProps {
  participants: CollaborationParticipant[];
  currentUserId: string;
  onParticipantAction: (participantId: string, action: 'remove' | 'changeRole') => void;
}

export interface ShareButtonProps {
  projectId: string;
  onShare: (shareLink: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface CollaborationState {
  isActive: boolean;
  session: CollaborationSession | null;
  participants: CollaborationParticipant[];
  messages: CollaborationMessage[];
  edits: RealtimeEdit[];
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}

export interface CollaborationActions {
  createSession: (projectId: string, settings: CollaborationSession['settings']) => Promise<void>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  sendEdit: (operation: RealtimeEdit['operation'], position: number, content: string) => Promise<void>;
  addComment: (content: string, position: Comment['position']) => Promise<void>;
  updateCursor: (x: number, y: number, selection?: { start: number; end: number }) => Promise<void>;
}

export interface UseCollaborationReturn extends CollaborationState, CollaborationActions {
  // Computed properties
  isHost: boolean;
  canEdit: boolean;
  canComment: boolean;
  onlineParticipants: CollaborationParticipant[];
  
  // UI helpers
  getParticipantById: (userId: string) => CollaborationParticipant | undefined;
  isParticipantOnline: (userId: string) => boolean;
}

// Real-time events
export interface RealtimeCollaborationEvent {
  type: 'participant_joined' | 'participant_left' | 'edit_received' | 'message_received' | 'cursor_updated';
  data: unknown;
  timestamp: Timestamp;
  userId: string;
}

// Collaboration UI state
export interface CollaborationUIState {
  showParticipants: boolean;
  showChat: boolean;
  showComments: boolean;
  activeParticipantId: string | null;
  selectedComment: string | null;
  isDragging: boolean;
  panelPosition: { x: number; y: number };
}

// Collaboration settings for UI
export interface CollaborationSettings {
  notifications: {
    participantJoined: boolean;
    participantLeft: boolean;
    newMessage: boolean;
    newComment: boolean;
    editReceived: boolean;
  };
  ui: {
    showCursors: boolean;
    showParticipantList: boolean;
    autoScrollToEdit: boolean;
    highlightChanges: boolean;
  };
  permissions: {
    allowInvite: boolean;
    allowKick: boolean;
    allowRoleChange: boolean;
  };
}

// Collaboration metrics for analytics
export interface CollaborationMetrics {
  sessionId: string;
  duration: number;
  participantCount: number;
  editCount: number;
  messageCount: number;
  commentCount: number;
  activeTime: number;
  productivityScore: number;
}

// Error types specific to collaboration
export type CollaborationError = 
  | 'SESSION_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'MAX_PARTICIPANTS_REACHED'
  | 'CONNECTION_FAILED'
  | 'INVALID_OPERATION'
  | 'SESSION_ENDED';

// Collaboration event handlers
export interface CollaborationEventHandlers {
  onParticipantJoined?: (participant: CollaborationParticipant) => void;
  onParticipantLeft?: (participantId: string) => void;
  onEditReceived?: (edit: RealtimeEdit) => void;
  onMessageReceived?: (message: CollaborationMessage) => void;
  onCommentAdded?: (comment: Comment) => void;
  onSessionEnded?: () => void;
  onError?: (error: CollaborationError, details?: string) => void;
}
