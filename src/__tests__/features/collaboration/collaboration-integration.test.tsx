/**
 * Collaboration Integration Tests
 * Week 8 - IA Alpha - Collaboration Frontend Implementation
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all collaboration dependencies
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => [{
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User'
  }, false, null]
}));

jest.mock('../../../firebaseConfig', () => ({
  auth: {},
  db: {},
  storage: {}
}));

jest.mock('../../../services/collaborationService', () => ({
  CollaborationService: {
    createSession: jest.fn(),
    cleanup: jest.fn()
  }
}));

jest.mock('../../../services/analyticsService', () => ({
  analyticsService: {
    trackUserAction: jest.fn()
  }
}));

// Import components after mocks
import { ShareButton } from '../../../features/collaboration/components/ShareButton';

describe('Collaboration Integration', () => {
  it('renders ShareButton component without crashing', () => {
    const props = {
      projectId: 'test-project',
      onShare: jest.fn(),
      size: 'medium' as const
    };
    
    render(<ShareButton {...props} />);
    expect(screen.getByText('Compartilhar')).toBeInTheDocument();
  });

  it('ShareButton can be disabled', () => {
    const props = {
      projectId: 'test-project',
      onShare: jest.fn(),
      disabled: true,
      size: 'medium' as const
    };
    
    render(<ShareButton {...props} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('ShareButton has correct size classes', () => {
    const props = {
      projectId: 'test-project',
      onShare: jest.fn(),
      size: 'small' as const
    };
    
    render(<ShareButton {...props} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-2', 'py-1', 'text-xs');
  });

  it('collaboration types are properly exported', () => {
    // Test that types can be imported without errors
    const typesModule = require('../../../features/collaboration/types/collaboration.types');
    expect(typesModule).toBeDefined();
  });

  it('collaboration hook can be imported', () => {
    // Test that hook can be imported without errors
    const hookModule = require('../../../features/collaboration/hooks/useCollaboration');
    expect(hookModule.useCollaboration).toBeDefined();
  });

  it('collaboration components can be imported from barrel export', () => {
    // Test barrel exports work
    const collaborationModule = require('../../../features/collaboration');
    expect(collaborationModule.CollaborationPanel).toBeDefined();
    expect(collaborationModule.ShareButton).toBeDefined();
    expect(collaborationModule.useCollaboration).toBeDefined();
  });
});
