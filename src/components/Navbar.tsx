/**
 * 🧭 NAVBAR - V7.5 Enhanced Professional Navigation
 * Sistema completo de navegação seguindo metodologia V7.5 Enhanced
 * Maintaining all existing functionality with professional interface
 * 
 * Features: Authentication + Mobile Menu + System Dashboard + Feedback + Glass-morphism
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { SystemDashboard } from './SystemDashboard';
import { tallyService } from '../services/tallyService';
import { createLogger } from '../utils/logger';
import PWAFeedback from './PWAFeedback';
import { isPWAInstalled } from '../utils/pwaUtils';

// V7.5 Enhanced Design System Imports
import { Layout } from '../design-system/components/Layout';
import { Button } from '../design-system/components/Button';
import { cn } from '../lib/utils';

// V7.5 Enhanced Icons
import { 
  LogOut, 
  Menu, 
  X, 
  Home, 
  FileText, 
  User, 
  UserPlus, 
  MessageCircle, 
  Shield, 
  Lightbulb, 
  Settings,
  Brain,
  BarChart3,
  Zap,
  Star
} from 'lucide-react';

const logger = createLogger('Navbar');

// ============================================================================
// TYPES & INTERFACES - V7.5 ENHANCED
// ============================================================================

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  external?: boolean;
  adminOnly?: boolean;
}

interface NavbarProps {
  className?: string;
  variant?: 'default' | 'transparent' | 'glass';
}

// ============================================================================
// MAIN COMPONENT - V7.5 ENHANCED
// ============================================================================

const Navbar: React.FC<NavbarProps> = ({ 
  className,
  variant = 'glass' 
}) => {
  const { currentUser, isFirebaseEnabled, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [systemStatus] = useState<'healthy' | 'degraded' | 'down'>('healthy');

  // V7.5 Enhanced Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // V7.5 Enhanced Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDashboard(true);
      }
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // V7.5 Enhanced Actions (maintained functionality)
  const handleLogout = async () => {
    try {
      if (isFirebaseEnabled) {
        await signOut(auth);
        logger.info('User logged out successfully');
      }
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      logger.error('Logout error', error);
    }
  };

  const handleLogin = () => {
    navigate('/login');
    setIsOpen(false);
  };

  const handleSignup = () => {
    navigate('/signup');
    setIsOpen(false);
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleFeedbackClick = async () => {
    try {
      if (tallyService.isEnabled()) {
        await tallyService.openFeedbackForm();
        logger.info('Feedback opened via Tally service');
      } else {
        setShowFeedback(true);
        logger.info('Feedback opened via enhanced modal');
      }
    } catch (error: unknown) {
      logger.error('Error with feedback system', { error });
      setShowFeedback(true);
    }
  };

  // V7.5 Enhanced Navigation Configuration
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        id: 'generator',
        label: 'Gerador',
        href: '/',
        icon: <FileText className="w-4 h-4" />
      },
      {
        id: 'banco-ideias',
        label: 'Banco de Ideias',
        href: '/banco-ideias',
        icon: <Lightbulb className="w-4 h-4" />,
        badge: 'Novo'
      },
      {
        id: 'content-analyzer',
        label: 'Análise de Conteúdo',
        href: '/content-analyzer',
        icon: <BarChart3 className="w-4 h-4" />,
        badge: 'Beta'
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: <User className="w-4 h-4" />
      }
    ];

    // Add admin navigation for admin users
    if (isAdmin && currentUser) {
      baseItems.push({
        id: 'admin',
        label: 'Admin',
        href: '/admin',
        icon: <Shield className="w-4 h-4" />,
        adminOnly: true
      });
    }

    return baseItems;
  };

  // V7.5 Enhanced Status Indicator
  const StatusIndicator: React.FC = () => (
    <div className="flex items-center gap-2">
      <div 
        className={cn(
          'w-2 h-2 rounded-full animate-pulse',
          systemStatus === 'healthy' ? 'bg-success-500' :
          systemStatus === 'degraded' ? 'bg-warning-500' :
          'bg-error-500'
        )}
        title={`Sistema ${systemStatus === 'healthy' ? 'operacional' : systemStatus}`}
      />
      <Layout.Text variant="caption" color="muted" className="hidden sm:inline">
        {systemStatus === 'healthy' ? 'Operacional' : 
         systemStatus === 'degraded' ? 'Degradado' : 'Inativo'}
      </Layout.Text>
    </div>
  );

  // V7.5 Enhanced Navigation Item Component
  const NavigationItem: React.FC<{ item: NavigationItem; isMobile?: boolean }> = ({ 
    item, 
    isMobile = false 
  }) => (
    <Link
      to={item.href}
      onClick={closeMenu}
      className={cn(
        'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200',
        'hover:bg-white/10 focus:bg-white/20 focus:outline-none',
        'group relative',
        isMobile ? 'text-base' : 'text-sm'
      )}
    >
      <span className="transition-transform duration-200 group-hover:scale-110">
        {item.icon}
      </span>
      <Layout.Text variant={isMobile ? "body" : "bodySmall"} className="font-medium">
        {item.label}
      </Layout.Text>
      {item.badge && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-500 text-white">
          {item.badge}
        </span>
      )}
      {item.adminOnly && (
        <Layout.Text variant="caption" color="muted">
          (Admin)
        </Layout.Text>
      )}
    </Link>
  );

  // V7.5 Enhanced User Actions Component
  const UserActions: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
    if (!currentUser) {
      return (
        <div className={cn('flex gap-2', isMobile ? 'flex-col w-full' : 'items-center')}>
          <Button
            variant="ghost"
            size={isMobile ? "md" : "sm"}
            onClick={handleLogin}
            className={cn('flex items-center gap-2', isMobile ? 'w-full justify-start' : '')}
          >
            <User className="w-4 h-4" />
            <span>Login</span>
          </Button>
          <Button
            variant="primary"
            size={isMobile ? "md" : "sm"}
            onClick={handleSignup}
            className={cn('flex items-center gap-2', isMobile ? 'w-full justify-start' : '')}
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar</span>
          </Button>
        </div>
      );
    }

    return (
      <div className={cn('flex gap-2', isMobile ? 'flex-col w-full' : 'items-center')}>
        <Button
          variant="ghost"
          size={isMobile ? "md" : "sm"}
          onClick={handleFeedbackClick}
          className={cn('flex items-center gap-2', isMobile ? 'w-full justify-start' : '')}
        >
          <MessageCircle className="w-4 h-4" />
          {isMobile && <span>Feedback</span>}
        </Button>
        <Button
          variant="ghost"
          size={isMobile ? "md" : "sm"}
          onClick={() => setShowDashboard(true)}
          className={cn('flex items-center gap-2', isMobile ? 'w-full justify-start' : '')}
        >
          <Settings className="w-4 h-4" />
          {isMobile && <span>Sistema</span>}
        </Button>
        <Button
          variant="danger"
          size={isMobile ? "md" : "sm"}
          onClick={handleLogout}
          className={cn('flex items-center gap-2', isMobile ? 'w-full justify-start' : '')}
        >
          <LogOut className="w-4 h-4" />
          {isMobile && <span>Sair</span>}
        </Button>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER - V7.5 ENHANCED
  // ============================================================================

  return (
    <>
      {/* V7.5 Enhanced Navigation Bar */}
      <nav 
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          variant === 'glass' && [
            'backdrop-blur-xl',
            scrolled ? 'bg-white/80 border-b border-neutral-200/50 shadow-lg' : 'bg-white/60'
          ],
          variant === 'default' && 'bg-white border-b border-neutral-200',
          variant === 'transparent' && 'bg-transparent',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* V7.5 Enhanced Brand Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group"
              onClick={closeMenu}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <Layout.Heading 
                level={3} 
                className="hidden sm:block font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
              >
                Roteirar IA
              </Layout.Heading>
            </Link>

            {/* V7.5 Enhanced Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-1">
                {getNavigationItems().map((item) => (
                  <NavigationItem key={item.id} item={item} />
                ))}
              </div>
              
              <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
                <StatusIndicator />
                <UserActions />
              </div>
            </div>

            {/* V7.5 Enhanced Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="md:hidden"
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* V7.5 Enhanced Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
            onClick={closeMenu}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 max-w-sm bg-white/95 backdrop-blur-xl border-l border-neutral-200/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                
                {/* V7.5 Enhanced Mobile Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <Layout.Heading level={4} className="font-bold">
                      Menu
                    </Layout.Heading>
                  </div>
                  <Button variant="ghost" size="sm" onClick={closeMenu}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* V7.5 Enhanced Mobile Navigation */}
                <div className="space-y-2 mb-8">
                  {getNavigationItems().map((item) => (
                    <NavigationItem key={item.id} item={item} isMobile />
                  ))}
                </div>

                {/* V7.5 Enhanced Mobile User Actions */}
                <div className="border-t border-neutral-200 pt-6 mb-6">
                  <UserActions isMobile />
                </div>

                {/* V7.5 Enhanced System Status */}
                <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                  <StatusIndicator />
                </div>
                
                {/* V7.5 Enhanced Mobile Footer */}
                <div className="mt-6 text-center">
                  <Layout.Text variant="caption" color="muted">
                    Roteirar IA • V7.5 Enhanced
                  </Layout.Text>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* V7.5 Enhanced Modal Systems (maintained) */}
      <AnimatePresence>
        {showDashboard && (
          <SystemDashboard onClose={() => setShowDashboard(false)} />
        )}
        {showFeedback && (
          <PWAFeedback onClose={() => setShowFeedback(false)} />
        )}
      </AnimatePresence>

      {/* V7.5 Enhanced Spacer for Fixed Navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar; 