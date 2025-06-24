import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { 
  Grid, 
  List, 
  Plus, 
  Settings, 
  BarChart, 
  Search as SearchIcon,
  Tag,
  Filter,
  Calendar,
  TrendingUp,
  FileText
} from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

// Novos componentes do dashboard
import DashboardFilters from '../components/dashboard/DashboardFilters';
import DashboardStats from '../components/dashboard/DashboardStats';
import ProjectCard from '../components/dashboard/ProjectCard';
import TagManager from '../components/dashboard/TagManager';

// Serviços
import { ProjectService } from '../services/projectService';
import { SearchService } from '../services/searchService';
import { TagService } from '../services/tagService';
import { AnalyticsService } from '../services/analyticsService';

import type { EnhancedProject, ProjectFilters as ProjectFiltersType } from '../types';
import { cn } from '../lib/utils';

const UserDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Estados principais
  const [projects, setProjects] = useState<EnhancedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<EnhancedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados da interface
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Estados dos filtros
  const [filters, setFilters] = useState<ProjectFiltersType>({
    search: '',
    tags: [],
    platforms: [],
    status: [],
    dateRange: {
      start: null,
      end: null
    },
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadProjects();
    
    // Track page view
    if (currentUser) {
      AnalyticsService.trackPageView(currentUser.uid, 'dashboard');
    }
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [projects, filters]);

  const loadProjects = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError('');

      // Buscar projetos usando o novo serviço
      const userProjects = await ProjectService.getUserProjects(currentUser.uid);
      
      // Migrar projetos antigos automaticamente
      const migratedProjects = await Promise.all(
        userProjects.map(project => ProjectService.migrateOldProject(project))
      );

      setProjects(migratedProjects);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
      setError('Falha ao carregar projetos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    if (!currentUser) return;

    try {
      const filtered = await SearchService.searchProjects(currentUser.uid, filters);
      setFilteredProjects(filtered);
    } catch (err) {
      console.error('Erro ao filtrar projetos:', err);
      setFilteredProjects(projects);
    }
  };

  const handleFilterChange = (newFilters: ProjectFiltersType) => {
    setFilters(newFilters);
    
    // Track search se há termo de busca
    if (newFilters.search && currentUser) {
      AnalyticsService.trackSearch(currentUser.uid, newFilters.search, filteredProjects.length);
    }
  };

  const handleProjectAction = async (action: string, project: EnhancedProject) => {
    if (!currentUser) return;

    try {
      switch (action) {
        case 'view':
        case 'edit':
          navigate('/generator', { 
            state: { 
              editMode: true, 
              scriptData: project 
            } 
          });
          break;

        case 'duplicate':
          const duplicated = await ProjectService.duplicateProject(project.id, currentUser.uid);
          if (duplicated) {
            await loadProjects();
            // Track analytics
            AnalyticsService.trackProjectAction(currentUser.uid, 'duplicated', project);
          }
          break;

        case 'toggleFavorite':
          const updated = await ProjectService.updateProject(project.id, {
            isFavorite: !project.isFavorite
          });
          if (updated) {
            await loadProjects();
            // Track analytics
            AnalyticsService.trackProjectAction(
              currentUser.uid, 
              project.isFavorite ? 'unfavorited' : 'favorited', 
              project
            );
          }
          break;

        case 'share':
          const shareData = await ProjectService.shareProject(project.id);
          if (shareData) {
            await navigator.clipboard.writeText(shareData.shareUrl);
            alert('Link de compartilhamento copiado!');
            // Track analytics
            AnalyticsService.trackProjectAction(currentUser.uid, 'shared', project);
          }
          break;

        case 'export':
          const exported = await ProjectService.exportProject(project.id);
          if (exported) {
            // Trigger download
            const blob = new Blob([exported.content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title || project.formData.subject}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }
          break;

        case 'delete':
          if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
            const deleted = await ProjectService.deleteProject(project.id);
            if (deleted) {
              await loadProjects();
              // Track analytics
              AnalyticsService.trackProjectAction(currentUser.uid, 'deleted', project);
            }
          }
          break;

        case 'select':
          setSelectedProjects(prev => 
            prev.includes(project.id) 
              ? prev.filter(id => id !== project.id)
              : [...prev, project.id]
          );
          break;
      }
    } catch (err) {
      console.error('Erro na ação do projeto:', err);
      alert('Erro ao executar ação. Tente novamente.');
    }
  };

  const handleBulkActions = async (action: string) => {
    if (!currentUser || selectedProjects.length === 0) return;

    try {
      switch (action) {
        case 'delete':
          if (window.confirm(`Tem certeza que deseja excluir ${selectedProjects.length} projetos?`)) {
            await Promise.all(
              selectedProjects.map(id => ProjectService.deleteProject(id))
            );
            await loadProjects();
            setSelectedProjects([]);
          }
          break;

        case 'favorite':
          await Promise.all(
            selectedProjects.map(id => 
              ProjectService.updateProject(id, { isFavorite: true })
            )
          );
          await loadProjects();
          setSelectedProjects([]);
          break;

        case 'export':
          // Implementar exportação em lote
          break;
      }
    } catch (err) {
      console.error('Erro nas ações em lote:', err);
      alert('Erro ao executar ações em lote.');
    }
  };

  const renderProjectsGrid = () => {
    if (loading) {
      return (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}>
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-48 w-full" />
            </Card>
          ))}
        </div>
      );
    }

    if (filteredProjects.length === 0) {
      return (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {filters.search || filters.tags.length > 0 
              ? 'Nenhum projeto encontrado' 
              : 'Nenhum projeto criado ainda'
            }
          </h3>
          <p className="text-muted-foreground mb-4">
            {filters.search || filters.tags.length > 0
              ? 'Ajuste os filtros ou crie um novo projeto.'
              : 'Crie seu primeiro roteiro para começar.'
            }
          </p>
          <Button onClick={() => navigate('/generator')}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Projeto
          </Button>
        </Card>
      );
    }

    return (
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      )}>
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            view={viewMode}
            onAction={handleProjectAction}
            isSelected={selectedProjects.includes(project.id)}
            allowSelection={showBulkActions}
          />
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="p-6 text-center">
          <div className="text-red-500 mb-4">⚠️ {error}</div>
          <Button onClick={loadProjects}>Tentar Novamente</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos e acompanhe seu progresso
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            title={`Alternar para visualização em ${viewMode === 'grid' ? 'lista' : 'grade'}`}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          
          <Button onClick={() => navigate('/generator')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
          <button
            className={cn(
              "px-4 py-2 rounded-md transition-colors text-sm font-medium",
              activeTab === 'dashboard' 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart className="h-4 w-4 mr-2 inline" />
            Dashboard
          </button>
          <button
            className={cn(
              "px-4 py-2 rounded-md transition-colors text-sm font-medium",
              activeTab === 'projects' 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('projects')}
          >
            <FileText className="h-4 w-4 mr-2 inline" />
            Projetos ({filteredProjects.length})
          </button>
          <button
            className={cn(
              "px-4 py-2 rounded-md transition-colors text-sm font-medium",
              activeTab === 'tags' 
                ? "bg-background shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('tags')}
          >
            <Tag className="h-4 w-4 mr-2 inline" />
            Tags
          </button>
        </div>
      </Tabs>

      {/* Conteúdo das Tabs */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <DashboardStats />
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Filtros */}
          <DashboardFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            projectCount={filteredProjects.length}
            totalProjects={projects.length}
          />

          {/* Ações em lote */}
          {selectedProjects.length > 0 && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedProjects.length} selecionados
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkActions('favorite')}
                  >
                    Favoritar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkActions('export')}
                  >
                    Exportar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkActions('delete')}
                  >
                    Excluir
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProjects([]);
                      setShowBulkActions(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Grid de Projetos */}
          {renderProjectsGrid()}
        </div>
      )}

      {activeTab === 'tags' && (
        <div className="space-y-6">
          <TagManager />
        </div>
      )}

      {/* Floating Action Button para seleção múltipla */}
      <Button
        className={cn(
          "fixed bottom-6 right-6 rounded-full shadow-lg transition-all duration-200",
          showBulkActions ? "bg-destructive hover:bg-destructive/90" : ""
        )}
        size="icon"
        onClick={() => {
          setShowBulkActions(!showBulkActions);
          setSelectedProjects([]);
        }}
        title={showBulkActions ? "Cancelar seleção" : "Selecionar múltiplos"}
      >
        {showBulkActions ? (
          <span className="text-xl">✕</span>
        ) : (
          <span className="text-xl">☑</span>
        )}
      </Button>
    </div>
  );
};

export default UserDashboardPage; 