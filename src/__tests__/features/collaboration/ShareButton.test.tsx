/**
 * ShareButton Component Tests
 * Week 8 - IA Alpha - Collaboration Frontend Implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShareButton } from '../../../features/collaboration/components/ShareButton';

// Mock Firebase hooks
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => [{
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  }, false, null]
}));

// Mock Firebase config
jest.mock('../../../firebaseConfig', () => ({
  auth: {},
  db: {},
  storage: {}
}));

// Mock collaboration service
jest.mock('../../../services/collaborationService', () => ({
  CollaborationService: {
    createSession: jest.fn().mockResolvedValue({
      id: 'test-session-id',
      participants: [{ userId: 'test-user-id' }]
    }),
    cleanup: jest.fn()
  }
}));

// Mock analytics service
jest.mock('../../../services/analyticsService', () => ({
  analyticsService: {
    trackUserAction: jest.fn()
  }
}));

describe('ShareButton', () => {
  const defaultProps = {
    projectId: 'test-project-id',
    onShare: jest.fn(),
    disabled: false,
    size: 'medium' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true
    });
  });

  it('renders share button with correct text', () => {
    render(<ShareButton {...defaultProps} />);
    
    expect(screen.getByText('Compartilhar')).toBeInTheDocument();
  });

  it('renders in different sizes', () => {
    const { rerender } = render(<ShareButton {...defaultProps} size="small" />);
    expect(screen.getByText('Compartilhar')).toHaveClass('px-2', 'py-1', 'text-xs');
    
    rerender(<ShareButton {...defaultProps} size="large" />);
    expect(screen.getByText('Compartilhar')).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('can be disabled', () => {
    render(<ShareButton {...defaultProps} disabled={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows loading state when creating collaboration', async () => {
    render(<ShareButton {...defaultProps} />);
    
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('creates collaboration session when clicked', async () => {
    const { CollaborationService } = require('../../../services/collaborationService');
    
    render(<ShareButton {...defaultProps} />);
    
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(CollaborationService.createSession).toHaveBeenCalledWith(
        'test-project-id',
        'test-user-id',
        {
          allowEdit: true,
          allowComment: true,
          allowVoiceChat: false,
          maxParticipants: 10
        }
      );
    });
  });

  it('shows collaboration options when active', async () => {
    render(<ShareButton {...defaultProps} />);
    
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Colaborando')).toBeInTheDocument();
    });
  });

  it('displays share options dropdown when collaboration is active', async () => {
    render(<ShareButton {...defaultProps} />);
    
    // Start collaboration
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Compartilhar Colaboração')).toBeInTheDocument();
      expect(screen.getByText('Link de Compartilhamento')).toBeInTheDocument();
    });
  });

  it('copies share link to clipboard', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve())
      }
    });
    
    const onShare = jest.fn();
    render(<ShareButton {...defaultProps} onShare={onShare} />);
    
    // Start collaboration first
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    await waitFor(() => {
      const copyButton = screen.getByText('Copiar');
      fireEvent.click(copyButton);
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'http://localhost:3000/collaborate/test-session-id'
    );
    expect(onShare).toHaveBeenCalledWith(
      'http://localhost:3000/collaborate/test-session-id'
    );
  });

  it('opens share link in new tab', async () => {
    // Mock window.open
    const mockOpen = jest.fn();
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true
    });
    
    render(<ShareButton {...defaultProps} />);
    
    // Start collaboration first
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    await waitFor(() => {
      const openButton = screen.getByText('Abrir');
      fireEvent.click(openButton);
    });
    
    expect(mockOpen).toHaveBeenCalledWith(
      'http://localhost:3000/collaborate/test-session-id',
      '_blank'
    );
  });

  it('shows participant count when multiple users are collaborating', async () => {
    const { CollaborationService } = require('../../../services/collaborationService');
    CollaborationService.createSession.mockResolvedValue({
      id: 'test-session-id',
      participants: [
        { userId: 'user1' },
        { userId: 'user2' },
        { userId: 'user3' }
      ]
    });
    
    render(<ShareButton {...defaultProps} />);
    
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('3 pessoas')).toBeInTheDocument();
    });
  });

  it('displays session settings in dropdown', async () => {
    render(<ShareButton {...defaultProps} />);
    
    // Start collaboration
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Edição')).toBeInTheDocument();
      expect(screen.getByText('Permitida')).toBeInTheDocument();
      expect(screen.getByText('Comentários')).toBeInTheDocument();
      expect(screen.getByText('Permitidos')).toBeInTheDocument();
    });
  });

  it('can close the dropdown', async () => {
    render(<ShareButton {...defaultProps} />);
    
    // Start collaboration
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    await waitFor(() => {
      const closeButton = screen.getByText('Fechar');
      fireEvent.click(closeButton);
    });
    
    expect(screen.queryByText('Compartilhar Colaboração')).not.toBeInTheDocument();
  });

  it('shows status indicator when collaboration is active', async () => {
    render(<ShareButton {...defaultProps} />);
    
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    await waitFor(() => {
      // Status indicator should be visible
      const statusIndicator = document.querySelector('.bg-green-500');
      expect(statusIndicator).toBeInTheDocument();
    });
  });

  it('handles collaboration creation errors gracefully', async () => {
    const { CollaborationService } = require('../../../services/collaborationService');
    CollaborationService.createSession.mockRejectedValue(new Error('Failed to create session'));
    
    render(<ShareButton {...defaultProps} />);
    
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    // Should not show collaboration active state
    await waitFor(() => {
      expect(screen.queryByText('Colaborando')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <ShareButton {...defaultProps} />
        <div data-testid="outside">Outside content</div>
      </div>
    );
    
    // Start collaboration
    const button = screen.getByText('Compartilhar');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Compartilhar Colaboração')).toBeInTheDocument();
    });
    
    // Click outside
    fireEvent.click(screen.getByTestId('outside'));
    
    expect(screen.queryByText('Compartilhar Colaboração')).not.toBeInTheDocument();
  });
});
