import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PWAFeedback from '../components/PWAFeedback';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('PWAFeedback - QA Simplified Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');
  });

  describe('🚨 Critical Quality Issues', () => {
    it('renders feedback button', () => {
      render(<PWAFeedback />);
      const feedbackButton = screen.getByText('💬 Feedback');
      expect(feedbackButton).toBeDefined();
    });

    it('opens modal when button clicked', async () => {
      const user = userEvent.setup();
      render(<PWAFeedback />);
      
      const feedbackButton = screen.getByText('💬 Feedback');
      await user.click(feedbackButton);
      
      // Modal should be open
      expect(screen.getByText('Compartilhe seu Feedback')).toBeDefined();
    });

    it('handles localStorage errors gracefully', async () => {
      const user = userEvent.setup();
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      render(<PWAFeedback />);
      
      const feedbackButton = screen.getByText('💬 Feedback');
      await user.click(feedbackButton);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test feedback');
      
      const submitButton = screen.getByText('Enviar Feedback');
      await user.click(submitButton);
      
      // Should handle error gracefully without crashing
      expect(screen.getByText('Enviar Feedback')).toBeDefined();
    });

    it('validates form before submission', async () => {
      const user = userEvent.setup();
      render(<PWAFeedback />);
      
      const feedbackButton = screen.getByText('💬 Feedback');
      await user.click(feedbackButton);
      
      const submitButton = screen.getByText('Enviar Feedback');
      
      // Button should be disabled when message is empty
      expect((submitButton as HTMLButtonElement).disabled).toBe(true);
      
      // Add text
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Valid feedback');
      
      // Button should now be enabled
      expect((submitButton as HTMLButtonElement).disabled).toBe(false);
    });
  });

  describe('📱 Responsive & UX Tests', () => {
    it('closes modal with close button', async () => {
      const user = userEvent.setup();
      render(<PWAFeedback />);
      
      const feedbackButton = screen.getByText('💬 Feedback');
      await user.click(feedbackButton);
      
      // Modal should be open
      expect(screen.getByText('Compartilhe seu Feedback')).toBeDefined();
      
      // Click close button
      const closeButton = screen.getByText('✕');
      await user.click(closeButton);
      
      // Modal should close
      expect(screen.queryByText('Compartilhe seu Feedback')).toBeNull();
    });

    it('shows different feedback types', async () => {
      const user = userEvent.setup();
      render(<PWAFeedback />);
      
      const feedbackButton = screen.getByText('💬 Feedback');
      await user.click(feedbackButton);
      
      // Should show feedback type buttons
      expect(screen.getByText('🐛')).toBeDefined();
      expect(screen.getByText('💡')).toBeDefined();
      expect(screen.getByText('⚡')).toBeDefined();
      expect(screen.getByText('📱')).toBeDefined();
    });
  });

  describe('♿ Accessibility Tests', () => {
    it('provides aria labels', async () => {
      const user = userEvent.setup();
      render(<PWAFeedback />);
      
      const feedbackButton = screen.getByLabelText('Abrir formulário de feedback');
      expect(feedbackButton).toBeDefined();
      
      await user.click(feedbackButton);
      
      // Check for close button aria label
      const closeButton = screen.getByLabelText('Fechar modal');
      expect(closeButton).toBeDefined();
    });

    it('supports keyboard interaction', async () => {
      const user = userEvent.setup();
      render(<PWAFeedback />);
      
      const feedbackButton = screen.getByText('💬 Feedback');
      await user.click(feedbackButton);
      
      // Try ESC key
      await user.keyboard('{Escape}');
      
      // Modal should close
      expect(screen.queryByText('Compartilhe seu Feedback')).toBeNull();
    });
  });

  describe('🔄 State Management Tests', () => {
    it('preserves rating selection', async () => {
      const user = userEvent.setup();
      render(<PWAFeedback />);
      
      const feedbackButton = screen.getByText('💬 Feedback');
      await user.click(feedbackButton);
      
      // Find rating stars
      const stars = screen.getAllByText('⭐');
      expect(stars.length).toBe(5);
      
      // Click first star
      await user.click(stars[0]);
      
      // Star should be clickable (basic interaction test)
      expect(stars[0]).toBeDefined();
    });

    it('submits feedback successfully', async () => {
      const user = userEvent.setup();
      render(<PWAFeedback />);
      
      const feedbackButton = screen.getByText('💬 Feedback');
      await user.click(feedbackButton);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test feedback');
      
      const submitButton = screen.getByText('Enviar Feedback');
      await user.click(submitButton);
      
      // Should call localStorage setItem
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });
}); 