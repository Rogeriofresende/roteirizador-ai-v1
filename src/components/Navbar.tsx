import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Button } from "./ui/Button";
import { LogOut, Menu, X, Home, FileText, User, UserPlus, MessageCircle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from "./ui/ThemeToggle";
import { SystemDashboard } from './SystemDashboard';
import { tallyService } from '../services/tallyService';
import { createLogger } from '../utils/logger';
import PWAFeedback from './PWAFeedback';
import { isPWAInstalled } from '../utils/pwaUtils';

const logger = createLogger('Navbar');

const Navbar: React.FC = () => {
  const { currentUser, isFirebaseEnabled, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [systemStatus] = useState<'healthy' | 'degraded' | 'down'>('healthy');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDashboard(true);
      }
      
      // Keyboard shortcut for feedback (Ctrl+Shift+F)
      if (event.ctrlKey && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        handleFeedbackClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    if (!isFirebaseEnabled || !auth) {
      console.warn('Logout não disponível - Firebase não configurado');
      return;
    }
    
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error: unknown) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const NavLink: React.FC<{ to: string; children: React.ReactNode; icon: React.ReactNode }> = ({ to, children, icon }) => (
    <Link 
      to={to} 
      onClick={closeMenu}
      className="text-foreground/80 hover:text-primary transition-colors duration-200 flex items-center gap-2 px-2 py-2 md:p-0"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (systemStatus) {
      case 'healthy': return 'Sistema OK';
      case 'degraded': return 'Atenção';
      case 'down': return 'Problema';
      default: return 'Verificando...';
    }
  };

  const handleFeedbackClick = () => {
    try {
      // Try Tally first (external form)
      const tallySuccess = tallyService.openFeedbackForm();
      
      if (!tallySuccess) {
        logger.info('Tally service unavailable, using built-in feedback modal');
        // Use our enhanced PWA feedback as primary option
        setShowFeedback(true);
      } else {
        logger.info('Feedback opened via Tally service');
      }
    } catch (error: unknown) {
      logger.error('Error with feedback system', { error });
      // Fallback to our enhanced feedback modal
      setShowFeedback(true);
    }
  };

  const handleSystemDashboard = () => {
    setShowDashboard(true);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? 'py-2 border-b border-border/20 backdrop-blur-md bg-background/60' : 'py-3 bg-transparent'}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary relative group" onClick={closeMenu}>
            <span className="relative z-10">Roteirar IA</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Desktop Navigation - V5.1 Enhanced Quick Access */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* V5.1 Critical: Direct access to main functionality */}
              {!isFirebaseEnabled ? (
                <>
                  <NavLink to="/" icon={<FileText size={16} />}>Gerador</NavLink>
                  <NavLink to="/about" icon={<Home size={16} />}>Sobre</NavLink>
                  <NavLink to="/dashboard" icon={<User size={16} />}>Dashboard</NavLink>
                </>
              ) : currentUser ? (
                <>
                  <NavLink to="/" icon={<FileText size={16} />}>Gerador</NavLink>
                  <NavLink to="/about" icon={<Home size={16} />}>Sobre</NavLink>
                  <NavLink to="/dashboard" icon={<User size={16} />}>Dashboard</NavLink>
                  {/* V6.2: Admin Dashboard Access */}
                  {isAdmin && (
                    <NavLink to="/admin" icon={<Shield size={16} className="text-primary" />}>
                      Admin
                    </NavLink>
                  )}
                  <Button variant="destructive" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut size={16} />
                    <span>Sair</span>
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/" icon={<FileText size={16} />}>Gerador</NavLink>
                  <NavLink to="/about" icon={<Home size={16} />}>Sobre</NavLink>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <User size={16} />
                      <span>Login</span>
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="flex items-center gap-2">
                      <UserPlus size={16} />
                      <span>Criar Conta</span>
                    </Button>
                  </Link>
                </>
              )}
            </nav>

            {/* Enhanced Feedback Button with better UX */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFeedbackClick}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-accent"
              title="Compartilhar feedback (Ctrl+Shift+F)"
              aria-label="Abrir formulário de feedback"
            >
              <MessageCircle size={16} className="mr-2" />
              <span className="hidden sm:inline">Feedback</span>
            </Button>

            {/* System Status Indicator */}
            <button
              onClick={handleSystemDashboard}
              className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={`${getStatusText()} - Clique para ver detalhes (Ctrl+Shift+D)`}
            >
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}>
                <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}></div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-300 hidden sm:inline">
                {getStatusText()}
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-foreground focus:outline-none"
              onClick={toggleMenu}
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <nav className="flex flex-col space-y-4 py-4">
                {/* V5.1 Enhanced Mobile Navigation */}
                {!isFirebaseEnabled ? (
                  <>
                    <NavLink to="/" icon={<FileText size={18} />}>Gerador</NavLink>
                    <NavLink to="/about" icon={<Home size={18} />}>Sobre</NavLink>
                    <NavLink to="/dashboard" icon={<User size={18} />}>Dashboard</NavLink>
                  </>
                ) : currentUser ? (
                  <>
                    <NavLink to="/" icon={<FileText size={18} />}>Gerador</NavLink>
                    <NavLink to="/about" icon={<Home size={18} />}>Sobre</NavLink>
                    <NavLink to="/dashboard" icon={<User size={18} />}>Dashboard</NavLink>
                    {/* V6.2: Admin Dashboard Access Mobile */}
                    {isAdmin && (
                      <NavLink to="/admin" icon={<Shield size={18} className="text-primary" />}>
                        Admin Dashboard
                      </NavLink>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full justify-start px-2 py-2 mt-2"
                    >
                      <LogOut size={16} />
                      <span>Sair</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <NavLink to="/" icon={<FileText size={18} />}>Gerador</NavLink>
                    <NavLink to="/about" icon={<Home size={18} />}>Sobre</NavLink>
                    <Link to="/login" onClick={closeMenu} className="w-full">
                      <Button variant="outline" size="sm" className="flex items-center gap-2 w-full justify-start">
                        <User size={16} />
                        <span>Login</span>
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={closeMenu} className="w-full">
                      <Button size="sm" className="flex items-center gap-2 w-full justify-start">
                        <UserPlus size={16} />
                        <span>Criar Conta</span>
                      </Button>
                    </Link>
                  </>
                )}
                
                {/* Mobile Feedback Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    closeMenu();
                    handleFeedbackClick();
                  }}
                  className="flex items-center gap-2 w-full justify-start px-2 py-2 text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle size={16} />
                  <span>Enviar Feedback</span>
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* System Dashboard Modal */}
      {showDashboard && (
        <SystemDashboard onClose={() => setShowDashboard(false)} />
      )}

      {/* Enhanced PWA Feedback Modal */}
      {showFeedback && (
        <PWAFeedback
          variant="modal-only"
          onClose={() => setShowFeedback(false)}
          isInstalled={isPWAInstalled()}
        />
      )}
    </header>
  );
};

export default Navbar; 