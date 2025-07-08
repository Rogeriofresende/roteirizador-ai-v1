/**
 * V6.2 Admin Dashboard Page
 * Página administrativa com Intelligence Dashboard integrado
 */

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IntelligenceDashboard } from '../components/admin/IntelligenceDashboard';
import { MonitoringDashboard } from '../components/admin/MonitoringDashboard';
import { AdminDocumentation } from '../components/admin/AdminDocumentation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
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
  Zap
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="hidden sm:block border-l border-border h-6" />
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {currentUser.email}
              </span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Intelligence</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Monitoramento</span>
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documentação</span>
            </TabsTrigger>
          </TabsList>

          {/* Intelligence Dashboard Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            <Card className="p-1">
              <IntelligenceDashboard 
                refreshInterval={30000}
                onExportData={(data) => {
                  console.log('Dados exportados:', data);
                }}
              />
            </Card>
          </TabsContent>

          {/* Monitoring Dashboard Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card className="p-6">
              <MonitoringDashboard />
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation" className="space-y-6">
            <Card className="p-6">
              <AdminDocumentation />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Usuários</p>
                <p className="text-2xl font-bold">10,234</p>
              </div>
              <Users className="h-8 w-8 text-primary/20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Roteiros Hoje</p>
                <p className="text-2xl font-bold">1,456</p>
              </div>
              <FileText className="h-8 w-8 text-green-500/20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500/20" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Calls</p>
                <p className="text-2xl font-bold">45.2K</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500/20" />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 