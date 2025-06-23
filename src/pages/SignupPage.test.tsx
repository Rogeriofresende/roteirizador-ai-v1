import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import SignupPage from './SignupPage';
import { MemoryRouter } from 'react-router-dom';

// Mock the firebase/auth module
vi.mock('firebase/auth');

// Mock the navigate function from react-router-dom
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mock firebaseConfig
vi.mock('../firebaseConfig', () => ({
  auth: {}, // Mocked auth object
}));

describe('SignupPage component', () => {
  let createUserWithEmailAndPassword: any;

  beforeAll(async () => {
    const auth = await import('firebase/auth');
    createUserWithEmailAndPassword = auth.createUserWithEmailAndPassword;
  });

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders all form elements correctly', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar com google/i })).toBeInTheDocument();
    expect(screen.getByText(/já tem uma conta?/i)).toBeInTheDocument();
  });
  
  it('allows user to type in email and password fields', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'password123' } });

    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/^senha$/i)).toHaveValue('password123');
    expect(screen.getByLabelText(/confirmar senha/i)).toHaveValue('password123');
  });

  it('shows an error message if passwords do not match', async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText(/as senhas não coincidem/i)).toBeInTheDocument();
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it('handles successful signup and navigates to home', async () => {
    createUserWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '123' } });

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows an error message on failed signup', async () => {
    createUserWithEmailAndPassword.mockRejectedValueOnce(new Error('Signup failed'));

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText(/falha ao criar conta/i)).toBeInTheDocument();
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
}); 