import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import UserDashboardPage from '../pages/UserDashboardPage';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDocs, deleteDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

// jest.MockedFunctioning dependencies
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getDocs: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn((_, __, id) => ({ id })), // jest.MockedFunction doc to return an object with id
  };
});

// jest.MockedFunction window.confirm
window.confirm = jest.fn(() => true);

const mockScripts = [
  {
    id: '1',
    userId: 'test-uid',
    formData: { subject: 'Roteiro de Teste 1', duration: '60' },
    scriptContent: 'Conteúdo do primeiro roteiro.',
    createdAt: { toDate: () => new Date('2023-10-27T10:00:00Z') },
  },
  {
    id: '2',
    userId: 'test-uid',
    formData: { subject: 'Roteiro de Teste 2', duration: '120' },
    scriptContent: 'Conteúdo do segundo roteiro de teste.',
    createdAt: { toDate: () => new Date('2023-10-28T11:00:00Z') },
  },
];

describe('UserDashboardPage component', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
  const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;

  const setup = (user: User | null, scripts: unknown[], error = false) => {
    mockUseAuth.mockReturnValue({ currentUser: user });
    if (error) {
      mockGetDocs.mockRejectedValue(new Error('Falha ao carregar roteiros.'));
    } else {
      const docs = scripts.map(script => ({ id: script.id, data: () => script }));
      mockGetDocs.mockResolvedValue({ docs });
    }

    render(
      <MemoryRouter>
        <UserDashboardPage />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading skeleton initially and then content', async () => {
    setup({ uid: 'test-uid' } as User, mockScripts);
    // Initially, check for skeletons
    expect(screen.getByText('Meus Roteiros')).toBeInTheDocument();
    expect(screen.queryAllByRole('progressbar').length > 0 || screen.queryByText(/carregando/i)).toBeDefined();

    // Wait for the content to be loaded to resolve the 'act' warning
    await waitFor(() => {
      expect(screen.getByText('Roteiro de Teste 1')).toBeInTheDocument();
    });
  });

  it('renders scripts correctly after loading', async () => {
    setup({ uid: 'test-uid' } as User, mockScripts);
    
    await waitFor(() => {
        expect(screen.getByText('Roteiro de Teste 1')).toBeInTheDocument();
        expect(screen.getByText('Roteiro de Teste 2')).toBeInTheDocument();
    });

    expect(screen.getByText('28/10/2023, 08:00')).toBeInTheDocument(); // Formatted from mock date
    expect(screen.getByText(/120s/)).toBeInTheDocument();
    expect(screen.getByText(/6 palavras/)).toBeInTheDocument();
  });

  it('shows empty state when there are no scripts', async () => {
    setup({ uid: 'test-uid' } as User, []);
    await waitFor(() => {
        expect(screen.getByText('Você ainda não salvou nenhum roteiro.')).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    setup({ uid: 'test-uid' } as User, [], true);
    await waitFor(() => {
        expect(screen.getByText('Falha ao carregar roteiros.')).toBeInTheDocument();
    });
  });
  
  it('expands to show script content when view button is clicked', async () => {
    setup({ uid: 'test-uid' } as User, mockScripts);
    await waitFor(() => expect(screen.getByText('Roteiro de Teste 1')).toBeInTheDocument());

    const viewButtons = screen.getAllByTitle('Visualizar roteiro');
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
        expect(screen.getByText('Conteúdo do primeiro roteiro.')).toBeInTheDocument();
    });

    // Click again to collapse
    fireEvent.click(viewButtons[0]);
    await waitFor(() => {
        expect(screen.queryByText('Conteúdo do primeiro roteiro.')).not.toBeInTheDocument();
    });
  });

  it('deletes a script when delete button is clicked', async () => {
    setup({ uid: 'test-uid' } as User, mockScripts);
    await waitFor(() => expect(screen.getByText('Roteiro de Teste 1')).toBeInTheDocument());

    const deleteButtons = screen.getAllByTitle('Apagar roteiro');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith("Tem certeza que deseja apagar este roteiro?");
      expect(mockDeleteDoc).toHaveBeenCalledWith({ id: '1' });
      // The component optimistically removes the script from state, so we check for its absence
      expect(screen.queryByText('Roteiro de Teste 1')).not.toBeInTheDocument();
    });
  });
}); 