import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  TrendingUp, 
  FileText, 
  Clock, 
  Star, 
  Share, 
  Target,
  Users,
  Calendar,
  Activity,
  PieChart,
  Eye
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { ProjectService } from '../../services/projectService';
import { SearchService } from '../../services/searchService';
import { TagService } from '../../services/tagService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface DashboardStatsProps {
  className?: string;
  period?: 'week' | 'month' | 'year';
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
}

interface StatsData {
  overview: {
    total: number;
    byStatus: Record<string, number>;
    byPlatform: Record<string, number>;
    totalWords: number;
    avgWordsPerProject: number;
    favorites: number;
    shared: number;
  };
  tags: {
    totalTags: number;
    mostUsedTags: Array<{ tag: string; count: number }>;
  };
  recent: {
    projectsThisWeek: number;
    projectsThisMonth: number;
    wordsThisWeek: number;
    editCount: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  className = '',
  period = 'month',
  onPeriodChange
}) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        
        const [projectStats, searchStats, tagStats] = await Promise.all([
          ProjectService.getUserProjectStats(currentUser.uid),
          SearchService.getSearchStats(currentUser.uid),
          TagService.getTagStats(currentUser.uid)
        ]);

        // Calcular estatísticas de período recente
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        setStats({
          overview: projectStats,
          tags: tagStats,
          recent: {
            projectsThisWeek: 0, // Seria calculado com dados reais
            projectsThisMonth: 0,
            wordsThisWeek: 0,
            editCount: 0
          }
        });
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        setError('Falha ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [currentUser, period]);

  if (loading) {
    return (
      <div className={cn("grid gap-4", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <Skeleton className="h-48 w-full" />
          </Card>
          <Card className="p-4">
            <Skeleton className="h-48 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <div className="text-red-500 mb-2">⚠️ {error}</div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header com seletor de período */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Estatísticas</h2>
          <p className="text-muted-foreground">Insights sobre sua produtividade</p>
        </div>
        {onPeriodChange && (
          <div className="flex items-center gap-2">
            <Button
              variant={period === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange('week')}
            >
              Semana
            </Button>
            <Button
              variant={period === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange('month')}
            >
              Mês
            </Button>
            <Button
              variant={period === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange('year')}
            >
              Ano
            </Button>
          </div>
        )}
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={FileText}
          title="Total de Projetos"
          value={stats.overview.total}
          subtitle="roteiros criados"
          trend={stats.recent.projectsThisMonth > 0 ? 'up' : 'stable'}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />

        <StatsCard
          icon={Clock}
          title="Palavras Totais"
          value={stats.overview.totalWords.toLocaleString()}
          subtitle="palavras escritas"
          trend="up"
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />

        <StatsCard
          icon={Star}
          title="Favoritos"
          value={stats.overview.favorites}
          subtitle="projetos favoritados"
          trend="stable"
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
        />

        <StatsCard
          icon={Share}
          title="Compartilhados"
          value={stats.overview.shared}
          subtitle="projetos compartilhados"
          trend="stable"
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
      </div>

      {/* Gráficos e detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status dos Projetos */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Status dos Projetos</h3>
          </div>
          
          <div className="space-y-3">
            {Object.entries(stats.overview.byStatus).map(([status, count]) => {
              const percentage = stats.overview.total > 0 
                ? Math.round((count / stats.overview.total) * 100) 
                : 0;
              
              const statusLabels: Record<string, string> = {
                'draft': 'Rascunhos',
                'completed': 'Concluídos',
                'published': 'Publicados'
              };

              const statusColors: Record<string, string> = {
                'draft': 'bg-gray-500',
                'completed': 'bg-green-500',
                'published': 'bg-blue-500'
              };

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", statusColors[status] || 'bg-gray-500')} />
                    <span className="text-sm font-medium">{statusLabels[status] || status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className={cn("h-2 rounded-full", statusColors[status] || 'bg-gray-500')}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count} ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Plataformas Mais Usadas */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Plataformas Mais Usadas</h3>
          </div>
          
          <div className="space-y-3">
            {Object.entries(stats.overview.byPlatform)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([platform, count]) => {
                const percentage = stats.overview.total > 0 
                  ? Math.round((count / stats.overview.total) * 100) 
                  : 0;

                const platformEmojis: Record<string, string> = {
                  'YouTube': '📺',
                  'Instagram': '📷',
                  'TikTok': '🎵',
                  'Facebook': '👥',
                  'LinkedIn': '💼',
                  'Twitter': '🐦',
                };

                return (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{platformEmojis[platform] || '📱'}</span>
                      <span className="text-sm font-medium">{platform}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        {/* Tags Mais Utilizadas */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Tags Mais Utilizadas</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {stats.tags.mostUsedTags.slice(0, 8).map(({ tag, count }) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="flex items-center gap-1"
              >
                {tag}
                <span className="text-xs bg-background/50 px-1 rounded">
                  {count}
                </span>
              </Badge>
            ))}
          </div>

          {stats.tags.mostUsedTags.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma tag utilizada ainda
            </p>
          )}
        </Card>

        {/* Resumo de Produtividade */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Produtividade</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Média de palavras por projeto</span>
              <span className="font-semibold">{stats.overview.avgWordsPerProject}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de tags criadas</span>
              <span className="font-semibold">{stats.tags.totalTags}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Taxa de conclusão</span>
              <span className="font-semibold">
                {stats.overview.total > 0 
                  ? Math.round(((stats.overview.byStatus.completed || 0) / stats.overview.total) * 100)
                  : 0}%
              </span>
            </div>

            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>
                  {stats.overview.total > 10 
                    ? "Usuário ativo! Continue criando conteúdo." 
                    : "Comece criando mais projetos para ver insights detalhados."}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Componente para cards de estatísticas
interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend = 'stable',
  className = ''
}) => {
  const trendIcons = {
    up: TrendingUp,
    down: TrendingUp,
    stable: Activity
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600 rotate-180',
    stable: 'text-muted-foreground'
  };

  const TrendIcon = trendIcons[trend];

  return (
    <Card className={cn("p-4 relative overflow-hidden", className)}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <TrendIcon className={cn("h-4 w-4", trendColors[trend])} />
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="text-xs text-muted-foreground/70">{subtitle}</div>
      </div>
    </Card>
  );
};

export default DashboardStats; 