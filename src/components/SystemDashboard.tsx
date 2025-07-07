import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Tabs } from './ui/Tabs';
import { Badge } from './ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { AdminDashboardGuard, SystemLogsGuard, UserManagementGuard } from './auth/RoleGuard';
import { adminService } from '../services/adminService';
import AdminDocumentation from './admin/AdminDocumentation';
import AIInsightsDashboard from './analytics/AIInsightsDashboard';
import MultiAIVisualDashboard from './MultiAIVisualDashboard';
import { createLogger } from '../utils/logger';

interface SystemDashboardProps {
  onClose: () => void;
}

const logger = createLogger('SystemDashboard');

export const SystemDashboard: React.FC<SystemDashboardProps> = ({ onClose }) => {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats] = useState({
    uptime: '99.9%',
    response: '150ms',
    status: 'healthy' as 'healthy' | 'degraded' | 'down',
    totalUsers: 42,
    activeUsers: 15,
    totalProjects: 128,
    projectsToday: 7
  });

  useEffect(() => {
    // Set current user in admin service for permission checking
    adminService.setCurrentUser(currentUser?.email || null);
    
    logger.info('SystemDashboard opened', {
      userId: currentUser?.uid,
      userRole: currentUser?.role,
      isAdmin,
      adminServiceConfigured: adminService.getAccessStats().isConfigured
    });
  }, [currentUser, isAdmin]);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-foreground">Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-muted-foreground">Sistema Online</span>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-2">Uptime</h3>
          <p className="text-2xl font-bold text-green-500">{stats.uptime}</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-2">Resposta</h3>
          <p className="text-2xl font-bold text-blue-500">{stats.response}</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-2">Versão</h3>
          <p className="text-lg font-semibold text-primary">v2.1.3</p>
        </Card>
      </div>

      {/* Services Status */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Serviços Ativos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Gemini AI</span>
              <Badge variant="default">✓ Ativo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Firebase Auth</span>
              <Badge variant="default">✓ Ativo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Microsoft Clarity</span>
              <Badge variant="default">✓ Ativo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">AI Analytics</span>
              <Badge variant="default">✓ Ativo</Badge>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Analytics</span>
              <Badge variant="default">✓ Ativo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">PWA Service</span>
              <Badge variant="default">✓ Ativo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tally Forms</span>
              <Badge variant="default">✓ Ativo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Performance Monitor</span>
              <Badge variant="default">✓ Ativo</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDocumentationTab = () => (
    <AdminDashboardGuard
      fallback={
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Documentação Administrativa</h3>
          <p className="text-muted-foreground">
            Você precisa de permissões de administrador para acessar a documentação metodológica.
          </p>
        </Card>
      }
    >
      <AdminDocumentation />
    </AdminDashboardGuard>
  );

  const renderMultiAITab = () => (
    <div className="h-[80vh] overflow-auto">
      <MultiAIVisualDashboard />
    </div>
  );

  const renderAIAnalyticsTab = () => (
    <AdminDashboardGuard
      fallback={
        <Card className="p-8 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI Analytics</h3>
          <p className="text-muted-foreground">
            Você precisa de permissões de administrador para acessar insights de AI Analytics.
          </p>
        </Card>
      }
    >
      <AIInsightsDashboard />
    </AdminDashboardGuard>
  );

  const renderAdminTab = () => (
    <AdminDashboardGuard
      fallback={
        <Card className="p-8 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground">
            Você precisa de permissões de administrador para ver esta seção.
          </p>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-foreground">Usuários</h3>
            </div>
            <p className="text-2xl font-bold text-blue-500">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground">Total cadastrados</p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Ativos Agora</h3>
            <p className="text-2xl font-bold text-green-500">{stats.activeUsers}</p>
            <p className="text-sm text-muted-foreground">Online agora</p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Projetos</h3>
            <p className="text-2xl font-bold text-purple-500">{stats.totalProjects}</p>
            <p className="text-sm text-muted-foreground">Total criados</p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Hoje</h3>
            <p className="text-2xl font-bold text-orange-500">{stats.projectsToday}</p>
            <p className="text-sm text-muted-foreground">Projetos hoje</p>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ações Administrativas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UserManagementGuard>
              <Button variant="outline" className="justify-start h-auto p-4">
                <Users className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Gerenciar Usuários</div>
                  <div className="text-sm text-muted-foreground">Visualizar e administrar contas</div>
                </div>
              </Button>
            </UserManagementGuard>

            <SystemLogsGuard>
              <Button variant="outline" className="justify-start h-auto p-4">
                <FileText className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Logs do Sistema</div>
                  <div className="text-sm text-muted-foreground">Visualizar logs e eventos</div>
                </div>
              </Button>
            </SystemLogsGuard>

            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => setActiveTab('ai-analytics')}
            >
              <Brain className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">AI Analytics</div>
                <div className="text-sm text-muted-foreground">Insights automáticos e predições</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => setActiveTab('documentation')}
            >
              <BookOpen className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Documentação Multi-AI</div>
                <div className="text-sm text-muted-foreground">Metodologia e coordenação</div>
              </div>
            </Button>

            <Button variant="outline" className="justify-start h-auto p-4">
              <Settings className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Configurações</div>
                <div className="text-sm text-muted-foreground">Configurar sistema</div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </AdminDashboardGuard>
  );

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Activity },
    { id: 'multi-ai', label: 'Multi-AI Control', icon: Bot },
    ...(isAdmin ? [
      { id: 'admin', label: 'Administração', icon: Shield },
      { id: 'ai-analytics', label: 'AI Analytics', icon: Brain },
      { id: 'documentation', label: 'Documentação', icon: BookOpen }
    ] : []),
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-background">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Dashboard do Sistema</h2>
              <p className="text-muted-foreground">
                {isAdmin ? 'Painel administrativo completo com AI Analytics' : 'Monitoramento básico do sistema'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </Button>
          </div>

          {/* User Info */}
          {currentUser && (
            <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {currentUser.displayName || currentUser.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Role: <Badge variant={isAdmin ? "default" : "secondary"}>{currentUser.role}</Badge>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'multi-ai' && renderMultiAITab()}
              {activeTab === 'admin' && renderAdminTab()}
              {activeTab === 'ai-analytics' && renderAIAnalyticsTab()}
              {activeTab === 'documentation' && renderDocumentationTab()}
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}; 