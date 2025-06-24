import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import GeneratorPage from './pages/GeneratorPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import UserDashboardPage from './pages/UserDashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import { PWAInstall } from './components/PWAInstall'
import { Toaster } from 'react-hot-toast'
import { healthCheckService } from './services/healthCheckService'
import { analyticsService } from './services/analyticsService'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  // Inicializar serviços de monitoramento
  useEffect(() => {
    const initializeMonitoring = async () => {
      try {
        console.log('🚀 Inicializando sistema de monitoramento...');
        
        // Analytics já é inicializado automaticamente no constructor
        // Health checks já começam automaticamente
        
        // Solicitar permissão para notificações se não tiver
        if ('Notification' in window) {
          await healthCheckService.requestNotificationPermission();
        }
        
        // Track page view inicial
        analyticsService.trackPageView(window.location.pathname);
        
        // Track Web Vitals
        analyticsService.trackWebVitals();
        
        console.log('✅ Sistema de monitoramento inicializado');
        
        // Expor serviços globalmente para debugging em desenvolvimento
        if (import.meta.env.DEV) {
          (window as any).healthCheck = healthCheckService;
          (window as any).analytics = analyticsService;
          console.log('🔧 Serviços expostos globalmente para debugging');
          console.log('📊 Use healthCheck.getHealth() para verificar saúde do sistema');
          console.log('📈 Use analytics.getDebugInfo() para ver status do analytics');
        }
        
      } catch (error) {
        console.error('❌ Erro ao inicializar monitoramento:', error);
      }
    };

    initializeMonitoring();
  }, []);

  // Track mudanças de rota
  const location = useLocation();
  useEffect(() => {
    analyticsService.trackPageView(location.pathname);
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AuthProvider>
        <PWAInstall />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/generator" element={<GeneratorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </div>
  )
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default AppWrapper
