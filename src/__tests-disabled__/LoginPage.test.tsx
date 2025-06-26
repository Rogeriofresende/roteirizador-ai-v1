import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, beforeAll } from '@testing-library/jest-dom';
import LoginPage from './LoginPage';
import { MemoryRouter } from 'react-router-dom';

// jest.MockedFunction the firebase/auth module
jest.mock('firebase/auth');

// jest.MockedFunction the navigate function from react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// jest.MockedFunction firebaseConfig
jest.mock('../firebaseConfig', () => ({
  auth: {}, // jest.MockedFunctioned auth object
}));


describe('LoginPage component', () => {
  let signInWithEmailAndPassword: any;

  beforeAll(async () => {
    const auth = await import('firebase/auth');
    signInWithEmailAndPassword = auth.signInWithEmailAndPassword;
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAlljest.MockedFunctions();
  });

  it('renders all form elements correctly', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar com google/i })).toBeInTheDocument();
    expect(screen.getByText(/não tem uma conta?/i)).toBeInTheDocument();
  });

  it('allows user to type in email and password fields', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('handles successful login and navigates to home', async () => {
    // jest.MockedFunction the signInWithEmailAndPassword to resolve successfully
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '123' } });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /^entrar$/i }));

    // Wait for the navigation to happen
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows an error message on failed login', async () => {
    // jest.MockedFunction the signInWithEmailAndPassword to reject with an error
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Login failed'));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /^entrar$/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/falha ao fazer login/i)).toBeInTheDocument();
      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
}); 