/**
 * V7.5 Enhanced Admin Dashboard Page
 * Administrative interface with V7.5 Enhanced design system integration
 * Professional-grade enterprise admin experience
 */

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IntelligenceDashboard } from '../components/admin/IntelligenceDashboard';
import MonitoringDashboard from '../components/admin/MonitoringDashboard';
import { AdminDocumentation } from '../components/admin/AdminDocumentation';
import { ErrorDashboard } from '../components/admin/ErrorDashboard';
import { ErrorTestPanel } from '../components/admin/ErrorTestPanel';

// V7.5 Enhanced Design System Components
import { 
  PageLayout, 
  Section, 
  Grid as LayoutGrid, 
  CardLayout, 
  Heading, 
  Text, 
  Spacer 
} from '../design-system/components/Layout';
import { 
  TabNavigation,
  NavigationItem 
} from '../design-system/components/Navigation';
import { 
  PrimaryButton, 
  SecondaryButton 
} from '../design-system/components/Button';

// Legacy UI Components (maintaining compatibility)
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Brain, 
  Activity, 
  FileText, 
  Shield,
  Settings,
  ChevronLeft,
  Users,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const AdminDashboard: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('intelligence');

  // Redirecionar se não for admin
  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // V7.5 Enhanced Navigation Configuration
  const adminNavigationItems: NavigationItem[] = [
    {
      id: 'intelligence',
      label: 'Intelligence',
      icon: <Brain className="h-4 w-4" />,
      active: activeTab === 'intelligence',
      onClick: () => setActiveTab('intelligence'),
      description: 'AI analytics and insights'
    },
    {
      id: 'monitoring',
      label: 'Monitoramento',
      icon: <Activity className="h-4 w-4" />,
      active: activeTab === 'monitoring',
      onClick: () => setActiveTab('monitoring'),
      description: 'System health and performance'
    },
    {
      id: 'errors',
      label: 'Erros',
      icon: <AlertCircle className="h-4 w-4" />,
      active: activeTab === 'errors',
      onClick: () => setActiveTab('errors'),
      description: 'Error tracking and debugging'
    },
    {
      id: 'documentation',
      label: 'Documentação',
      icon: <FileText className="h-4 w-4" />,
      active: activeTab === 'documentation',
      onClick: () => setActiveTab('documentation'),
      description: 'Administrative documentation'
    }
  ];

  return (
    <PageLayout variant="admin" padding="none">
      {/* V7.5 Enhanced Header */}
      <Section background="card" padding="compact" sticky={true}>
        <LayoutGrid cols={1} gap="none">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <SecondaryButton size="sm" variant="ghost">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </SecondaryButton>
                </Link>
                <div className="hidden sm:block border-l border-border h-6" />
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <Heading level={1} size="lg" color="primary">
                    Admin Dashboard
                  </Heading>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Text variant="caption" color="muted" className="hidden sm:inline">
                  {currentUser.email}
                </Text>
                <SecondaryButton variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </SecondaryButton>
              </div>
            </div>
          </div>
        </LayoutGrid>
      </Section>

      {/* V7.5 Enhanced Main Content */}
      <Section background="background" spacing="loose">
        <LayoutGrid cols={1} gap="xl" className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* V7.5 Enhanced Tab Navigation */}
          <CardLayout variant="elevated" padding="sm">
            <TabNavigation
              items={adminNavigationItems}
              variant="professional"
              size="large"
              alignment="center"
              responsive={true}
              className="max-w-4xl mx-auto"
            />
          </CardLayout>

          <Spacer size={6} />

          {/* Tab Content with V7.5 Enhanced Layout */}
          {activeTab === 'intelligence' && (
            <Section background="transparent" spacing="normal">
              <CardLayout variant="professional" padding="xs">
                <IntelligenceDashboard 
                  refreshInterval={30000}
                  onExportData={(data) => {
                    console.log('Dados exportados:', data);
                  }}
                />
              </CardLayout>
            </Section>
          )}

          {activeTab === 'monitoring' && (
            <Section background="transparent" spacing="normal">
              <CardLayout variant="professional" padding="lg">
                <MonitoringDashboard />
              </CardLayout>
            </Section>
          )}

          {activeTab === 'errors' && (
            <Section background="transparent" spacing="normal">
              <LayoutGrid cols={1} gap="lg">
                <CardLayout variant="professional" padding="lg">
                  <ErrorDashboard />
                </CardLayout>
                <ErrorTestPanel />
              </LayoutGrid>
            </Section>
          )}

          {activeTab === 'documentation' && (
            <Section background="transparent" spacing="normal">
              <CardLayout variant="professional" padding="lg">
                <AdminDocumentation />
              </CardLayout>
            </Section>
          )}

          <Spacer size={8} />

          {/* V7.5 Enhanced Quick Stats */}
          <Section background="neutral" padding="lg" rounded={true}>
            <Heading level={2} size="md" color="secondary" className="mb-6">
              Statistics Overview
            </Heading>
            <LayoutGrid cols={4} gap="md" responsive={{
              sm: { cols: 2 },
              xs: { cols: 1 }
            }}>
              <CardLayout variant="interactive" padding="md" hover={true}>
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="caption" color="muted">Total Usuários</Text>
                    <Heading level={3} size="xl" color="primary">10,234</Heading>
                  </div>
                  <Users className="h-8 w-8 text-primary/20" />
                </div>
              </CardLayout>
              
              <CardLayout variant="interactive" padding="md" hover={true}>
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="caption" color="muted">Roteiros Hoje</Text>
                    <Heading level={3} size="xl" color="success">1,456</Heading>
                  </div>
                  <FileText className="h-8 w-8 text-green-500/20" />
                </div>
              </CardLayout>
              
              <CardLayout variant="interactive" padding="md" hover={true}>
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="caption" color="muted">Uptime</Text>
                    <Heading level={3} size="xl" color="info">99.9%</Heading>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500/20" />
                </div>
              </CardLayout>
              
              <CardLayout variant="interactive" padding="md" hover={true}>
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="caption" color="muted">API Calls</Text>
                    <Heading level={3} size="xl" color="warning">45.2K</Heading>
                  </div>
                  <Zap className="h-8 w-8 text-purple-500/20" />
                </div>
              </CardLayout>
            </LayoutGrid>
          </Section>
          
        </LayoutGrid>
      </Section>
    </PageLayout>
  );
};

export default AdminDashboard; 