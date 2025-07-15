/**
 * 🎨 USER DASHBOARD - V7.5 Enhanced Intent-Based Design
 * Dashboard principal otimizado para Marina, Carlos e Ana - Professional Interface
 * Following methodology specs from DETALHAMENTO_FLUXOS_OTIMIZADOS_V7_5.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { 
  Lightbulb, 
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  Target,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

// V7.5 Enhanced Design System Imports
import { Layout } from '../design-system/components/Layout';
import { Button } from '../design-system/components/Button';
import { Card } from '../design-system/components/Card';
import { cn } from '../lib/utils';

interface UserProject {
  id: string;
  title: string;
  content: string;
  platform: string;
  createdAt: Timestamp;
  formData: {
    platform: string;
    duration: string;
  };
}

const SimpleUserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  const loadProjects = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Get user name (first name only for personalization)
      const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Creator';
      setUserName(displayName.split(' ')[0]);

      const q = query(
        collection(db, 'roteiros'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const userProjects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProject[];

      setProjects(userProjects);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser, loadProjects]);

  // V7.5 Enhanced Progress Calculation (Positive Framing)
  const getWeeklyProgress = () => {
    const thisWeek = projects.filter(p => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const projectDate = p.createdAt instanceof Timestamp ? p.createdAt.toDate() : p.createdAt;
      return projectDate > weekAgo;
    }).length;
    
    const targetWeekly = 7; // 1 per day target
    const progressPercentage = Math.min((thisWeek / targetWeekly) * 100, 100);
    
    return {
      completed: thisWeek,
      total: targetWeekly,
      percentage: progressPercentage,
      message: thisWeek === 0 
        ? "Vamos começar sua primeira ideia!" 
        : thisWeek >= 7 
          ? "🎉 Meta semanal alcançada!" 
          : `Faltam ${targetWeekly - thisWeek} para completar a semana`
    };
  };

  const weeklyProgress = getWeeklyProgress();

  if (loading) {
    return (
      <Layout.Page variant="dashboard">
        <Layout.Section spacing="comfortable">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        </Layout.Section>
      </Layout.Page>
    );
  }

  return (
    <Layout.Page variant="dashboard" padding="responsive">
      <Layout.Section spacing="comfortable" maxWidth="container">
        
        {/* V7.5 Enhanced Header - Personalized Welcome */}
        <div className="text-center mb-8">
          <Layout.Heading level={1} className="mb-2 flex items-center justify-center gap-2">
            <span>🏠 Bem-vind{userName.endsWith('a') ? 'a' : 'o'}, {userName}!</span>
            <Sparkles className="w-6 h-6 text-warm-500" />
          </Layout.Heading>
        </div>

        {/* V7.5 Enhanced Intent-Based Design - Primary Question */}
        <div className="text-center mb-12">
          <Layout.Heading level={2} color="secondary" className="mb-8">
            🎯 O que você quer fazer agora?
          </Layout.Heading>

          {/* V7.5 Enhanced Primary Actions - Intent Cards */}
          <Layout.Grid cols={2} gap="lg" className="max-w-4xl mx-auto mb-8">
            
            {/* Primary Intent 1: Generate Ideas */}
            <Layout.Card 
              variant="interactive" 
              padding="lg"
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-primary-200 hover:border-primary-300"
              onClick={() => navigate('/generator')}
            >
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors">
                  <Lightbulb className="w-8 h-8 text-primary-600" />
                </div>
                <Layout.Heading level={3} className="mb-3 text-primary-700">
                  💡 PRECISO DE IDEIAS
                </Layout.Heading>
                <Layout.Text variant="body" color="muted" className="mb-4">
                  Gerar ideias para seus próximos conteúdos
                </Layout.Text>
                <Button 
                  variant="default" 
                  className="bg-primary-600 hover:bg-primary-700 group-hover:bg-primary-700"
                >
                  Gerar Ideias <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Layout.Card>

            {/* Primary Intent 2: Plan Content */}
            <Layout.Card 
              variant="interactive" 
              padding="lg"
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-success-200 hover:border-success-300"
              onClick={() => navigate('/calendar')}
            >
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-success-100 rounded-full group-hover:bg-success-200 transition-colors">
                  <Calendar className="w-8 h-8 text-success-600" />
                </div>
                <Layout.Heading level={3} className="mb-3 text-success-700">
                  📅 PLANEJAR SEMANA
                </Layout.Heading>
                <Layout.Text variant="body" color="muted" className="mb-4">
                  Organizar suas ideias no calendário
                </Layout.Text>
                <Button 
                  variant="outline" 
                  className="border-success-600 text-success-600 hover:bg-success-50 group-hover:bg-success-100"
                >
                  Ver Calendário <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Layout.Card>
          </Layout.Grid>
        </div>

        {/* V7.5 Enhanced Progress Section - Positive Reinforcement */}
        <Layout.Section background="subtle" spacing="comfortable" className="rounded-lg mb-8">
          <div className="text-center">
            <Layout.Heading level={3} className="mb-4 flex items-center justify-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Seu Progresso Semanal
            </Layout.Heading>
            
            {/* Progress Bar - Visual instead of numbers */}
            <div className="max-w-md mx-auto mb-4">
              <div className="flex items-center justify-between mb-2">
                <Layout.Text variant="bodySmall" color="muted">
                  {weeklyProgress.completed} de {weeklyProgress.total} dias planejados
                </Layout.Text>
                <Layout.Text variant="bodySmall" color="primary" weight="medium">
                  {Math.round(weeklyProgress.percentage)}%
                </Layout.Text>
              </div>
              
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-success-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-1"
                  style={{ width: `${weeklyProgress.percentage}%` }}
                >
                  {weeklyProgress.percentage > 10 && (
                    <Sparkles className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>

            <Layout.Text variant="body" color="muted" className="mb-4">
              {weeklyProgress.message}
            </Layout.Text>

            {/* Quick Achievement Badges */}
            {weeklyProgress.completed > 0 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {weeklyProgress.completed >= 1 && (
                  <div className="flex items-center gap-1 bg-success-100 text-success-700 px-3 py-1 rounded-full text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Primeira ideia ✨
                  </div>
                )}
                {weeklyProgress.completed >= 3 && (
                  <div className="flex items-center gap-1 bg-warm-100 text-warm-700 px-3 py-1 rounded-full text-sm">
                    <TrendingUp className="w-4 h-4" />
                    Consistency streak 🔥
                  </div>
                )}
                {weeklyProgress.completed >= 7 && (
                  <div className="flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                    <Sparkles className="w-4 h-4" />
                    Weekly champion 🏆
                  </div>
                )}
              </div>
            )}
          </div>
        </Layout.Section>

        {/* V7.5 Enhanced Quick Actions - Secondary Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Quick Add Modal Trigger */}
          <Layout.Card variant="outlined" padding="md" className="group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                <Plus className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <Layout.Text variant="bodySmall" weight="medium" className="mb-1">
                  Adicionar Rápido
                </Layout.Text>
                <Layout.Text variant="bodySmall" color="muted">
                  Ideia expressa em 30seg
                </Layout.Text>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/generator?quick=true')}>
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </Layout.Card>

          {/* Ideas Bank */}
          <Layout.Card variant="outlined" padding="md" className="group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-warm-100 rounded-lg group-hover:bg-warm-200 transition-colors">
                <Lightbulb className="w-5 h-5 text-warm-600" />
              </div>
              <div className="flex-1">
                <Layout.Text variant="bodySmall" weight="medium" className="mb-1">
                  Banco de Ideias
                </Layout.Text>
                <Layout.Text variant="bodySmall" color="muted">
                  {projects.length} ideias salvas
                </Layout.Text>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/ideas-bank')}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Layout.Card>

          {/* Analytics Quick View */}
          <Layout.Card variant="outlined" padding="md" className="group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-success-100 rounded-lg group-hover:bg-success-200 transition-colors">
                <TrendingUp className="w-5 h-5 text-success-600" />
              </div>
              <div className="flex-1">
                <Layout.Text variant="bodySmall" weight="medium" className="mb-1">
                  Progresso
                </Layout.Text>
                <Layout.Text variant="bodySmall" color="muted">
                  Ver estatísticas
                </Layout.Text>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Layout.Card>
        </div>

        {/* V7.5 Enhanced Recent Activity - Simplified */}
        {projects.length > 0 && (
          <Layout.Section background="white" spacing="comfortable" className="rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <Layout.Heading level={3} className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-neutral-600" />
                Últimas Ideias
              </Layout.Heading>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/ideas-bank')}
              >
                Ver Todas
              </Button>
            </div>
            
            <div className="space-y-3">
              {projects.slice(0, 3).map((project) => (
                <Layout.Card 
                  key={project.id} 
                  variant="flat" 
                  padding="md" 
                  className="flex items-center justify-between group hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Layout.Text variant="bodySmall" weight="medium" className="truncate">
                        {project.title || 'Ideia sem título'}
                      </Layout.Text>
                      <Layout.Text variant="bodySmall" color="muted">
                        {project.platform} • {project.formData?.duration || 'N/A'}
                      </Layout.Text>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/generator', { 
                      state: { editMode: true, scriptData: project } 
                    })}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Layout.Card>
              ))}
            </div>
          </Layout.Section>
        )}

        {/* V7.5 Enhanced Empty State - Positive Encouragement */}
        {projects.length === 0 && (
          <Layout.Section background="subtle" spacing="comfortable" className="rounded-lg text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <Layout.Heading level={3} className="mb-3">
                Sua jornada criativa começa aqui! ✨
              </Layout.Heading>
              <Layout.Text variant="body" color="muted" className="mb-6">
                Vamos criar sua primeira ideia de conteúdo com nossa IA. 
                É rápido, fácil e vai te surpreender!
              </Layout.Text>
              <Button 
                onClick={() => navigate('/generator')}
                className="bg-primary-600 hover:bg-primary-700"
                size="lg"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Gerar Primeira Ideia
              </Button>
            </div>
          </Layout.Section>
        )}

      </Layout.Section>
    </Layout.Page>
  );
};

export default SimpleUserDashboard; 