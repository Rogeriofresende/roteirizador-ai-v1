import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Label } from "../components/ui/Label";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/Alert";
import { CircleAlert, Mail, Lock, LogIn } from "lucide-react";
import { Separator } from "../components/ui/Separator";
import Navbar from '../components/Navbar';

// DESIGN SYSTEM IMPORTS
import { Layout } from '../design-system/components/Layout';
import { theme } from '../design-system/tokens';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: unknown) {
      console.error('Erro no login:', err);
      const error = err as Error;
      setError(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: unknown) {
      console.error('Erro no Google Sign-In:', err);
      const error = err as Error;
      setError(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout.Page variant="centered">
      <Navbar />
      
      <Layout.Section spacing="loose" className="pt-20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 w-full h-full bg-grid-white/[0.02] bg-[size:20px_20px] pointer-events-none" />
        <div className="absolute h-[200px] w-[200px] rounded-full bg-primary-200/30 blur-3xl -top-20 -left-20" />
        <div className="absolute h-[300px] w-[300px] rounded-full bg-accent-200/20 blur-3xl -bottom-40 -right-20" />
        
        <Layout.Card 
          variant="elevated" 
          padding="lg" 
          className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/80 border border-neutral-200/50 shadow-xl relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <LogIn className="h-8 w-8 text-primary-600" />
            </div>
            <Layout.Heading level={2} color="primary" className="mb-2">
              Entrar na Plataforma
            </Layout.Heading>
            <Layout.Text variant="body" color="muted" className="text-center">
              Entre com suas credenciais para acessar sua conta
            </Layout.Text>
          </div>
          
          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <Alert variant="destructive">
                <CircleAlert className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">
                <Layout.Text variant="label">Email</Layout.Text>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  <Layout.Text variant="label">Senha</Layout.Text>
                </Label>
                <Link 
                  to="#" 
                  className="text-xs text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-200" 
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          {/* Separator */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-neutral-500">
                ou continue com
              </span>
            </div>
          </div>
          
          {/* Google Login */}
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </Button>
          
          {/* Footer */}
          <div className="text-center mt-8">
            <Layout.Text variant="bodySmall" color="muted">
              Não tem uma conta?{' '}
              <Link 
                to="/signup" 
                className="text-primary-600 font-medium hover:text-primary-700 hover:underline transition-colors"
              >
                Cadastre-se
              </Link>
            </Layout.Text>
          </div>
        </Layout.Card>
      </Layout.Section>
    </Layout.Page>
  );
};

export default LoginPage; 