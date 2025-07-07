import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
import { LazyLoadingBoundary } from '../components/ui/LazyLoadingBoundary';
import { PageSkeleton } from '../components/ui/PageLoadingSpinner';

import type { EnhancedProject, ProjectFilters as ProjectFiltersType } from '../types';
import { cn } from '../lib/utils';
import { performanceService } from '../services/performance';

// =============================================================================
// LAZY LOADED COMPONENTS - HEAVY DASHBOARD COMPONENTS
// =============================================================================

// Lazy load heavy dashboard components
const DashboardFilters = lazy(() => 
  performanceService.measureFunction('load_DashboardFilters', () =>
    import('../components/dashboard/DashboardFilters').then(module => {
      return module;
    })
  )
);

const DashboardStats = lazy(() => 
  performanceService.measureFunction('load_DashboardStats', () =>
    import('../components/dashboard/DashboardStats').then(module => {
      return { default: module.DashboardStats };
    })
  )
);

const ProjectCard = lazy(() => 
  performanceService.measureFunction('load_ProjectCard', () =>
    import('../components/dashboard/ProjectCard').then(module => {
      return module;
    })
  )
);

const TagManager = lazy(() => 
  performanceService.measureFunction('load_TagManager', () =>
    import('../components/dashboard/TagManager').then(module => {
      return module;
    })
  )
);

const FilterPresets = lazy(() => 
  performanceService.measureFunction('load_FilterPresets', () =>
    import('../components/dashboard/FilterPresets').then(module => {
      return { default: module.FilterPresets };
    })
  )
);

// =============================================================================
// LAZY LOADED SERVICES - HEAVY BUSINESS LOGIC
// =============================================================================

// Dynamic imports for services to reduce initial bundle
// Enhanced service loading functions with Firebase fallback
import { serviceFactory } from '../services/mockServices';
import { createLogger } from '../utils/logger';

const userDashboardLogger = createLogger('UserDashboard');

// Enhanced service loaders with automatic fallback
const loadProjectService = async () => {
  try {
    userDashboardLogger.debug('Loading ProjectService...');
    const service = await serviceFactory.getProjectService();
    userDashboardLogger.info('ProjectService loaded successfully', { 
      type: service.name || 'MockProjectService' 
    });
    return service;
  } catch (error) {
    userDashboardLogger.error('Failed to load ProjectService', { error });
    throw error;
  }
};

const loadSearchService = async () => {
  try {
    userDashboardLogger.debug('Loading SearchService...');
    const service = await serviceFactory.getSearchService();
    userDashboardLogger.info('SearchService loaded successfully', { 
      type: service.name || 'MockSearchService' 
    });
    return service;
  } catch (error) {
    userDashboardLogger.error('Failed to load SearchService', { error });
    throw error;
  }
};

const loadTagService = async () => {
  try {
    userDashboardLogger.debug('Loading TagService...');
    const service = await serviceFactory.getTagService();
    userDashboardLogger.info('TagService loaded successfully', { 
      type: service.name || 'MockTagService' 
    });
    return service;
  } catch (error) {
    userDashboardLogger.error('Failed to load TagService', { error });
    throw error;
  }
};

const loadAnalyticsService = async () => {
  try {
    userDashboardLogger.debug('Loading AnalyticsService...');
    const service = await serviceFactory.getAnalyticsService();
    userDashboardLogger.info('AnalyticsService loaded successfully', { 
      type: service.constructor?.name || 'MockAnalyticsService' 
    });
    return service;
  } catch (error) {
    userDashboardLogger.error('Failed to load AnalyticsService', { error });
    throw error;
  }
};

export {
  loadProjectService,
  loadSearchService,
  loadTagService,
  loadAnalyticsService
};

// =============================================================================
// DASHBOARD TABS AS SEPARATE COMPONENTS
// =============================================================================

// Dashboard Tab Component
const DashboardTab: React.FC<{ userId: string }> = ({ userId }) => (
  <div className="space-y-6">
    <LazyLoadingBoundary 
      name="DashboardStats" 
      skeleton="dashboard"
      fallback={<PageSkeleton variant="dashboard" />}
    >
      <Suspense fallback={<PageSkeleton variant="dashboard" />}>
        <DashboardStats 
          userId={userId} 
          timeRange="30d" 
          onTimeRangeChange={() => {}} 
        />
      </Suspense>
    </LazyLoadingBoundary>
  </div>
);

// Projects Tab Component with Advanced Filters
const ProjectsTab: React.FC<{
  userId: string;
  viewMode: 'grid' | 'list';
  selectedProjects: string[];
  showBulkActions: boolean;
  onProjectAction: (action: string, project: EnhancedProject) => void;
  onBulkActions: (action: string) => void;
  onSelectProject: (projects: string[]) => void;
  onCancelSelection: () => void;
  navigate: (path: string) => void;
}> = ({
  userId,
  viewMode,
  selectedProjects,
  showBulkActions,
  onProjectAction,
  onBulkActions,
  onSelectProject,
  onCancelSelection,
  navigate
}) => {
  
  // Mock data for removed useAdvancedFilters hook
  const projects = [];
  const totalCount = 0;
  const isLoading = false;
  const error = null;
  const filters = { search: "" };
  const setFilters = () => {};
  const clearFilters = () => {};
  const stats = null;
  const filterSuggestions = { tags: [], folders: [] };
  const lastSearchTime = 0;
  const cacheInfo = { hits: 0, misses: 0, size: 0 };

  // Track analytics
  useEffect(() => {
    if (filters.search) {
      userDashboardLogger.info('Search performed', { 
        query: filters.search, 
        results: projects.length,
        searchTime: `${lastSearchTime.toFixed(2)}ms`
      });
    }
  }, [filters.search, projects.length, lastSearchTime]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const renderProjectsGrid = () => {
    if (isLoading) {
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

    if (error) {
      return (
        <Card className="p-6 text-center">
          <div className="text-red-500 mb-4">⚠️ {error}</div>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </Card>
      );
    }

    if (projects.length === 0) {
      return (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {filters.search || Object.keys(filters).some(key => filters[key as keyof FilterOptions] && key !== 'sortBy' && key !== 'sortOrder')
              ? 'Nenhum projeto encontrado' 
              : 'Nenhum projeto criado ainda'
            }
          </h3>
          <p className="text-muted-foreground mb-4">
            {filters.search || Object.keys(filters).some(key => filters[key as keyof FilterOptions] && key !== 'sortBy' && key !== 'sortOrder')
              ? 'Ajuste os filtros ou crie um novo projeto.'
              : 'Crie seu primeiro roteiro para começar.'
            }
          </p>
          <div className="flex gap-2 justify-center">
            {Object.keys(filters).some(key => filters[key as keyof FilterOptions] && key !== 'sortBy' && key !== 'sortOrder') && (
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
            <Button onClick={() => navigate('/generator')}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Projeto
            </Button>
          </div>
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
        {projects.map(project => (
          <LazyLoadingBoundary 
            key={project.id}
            name="ProjectCard"
            skeleton={<Skeleton className="h-48 w-full" />}
          >
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
              <ProjectCard
                project={project}
                view={viewMode}
                onAction={onProjectAction}
                isSelected={selectedProjects.includes(project.id)}
                allowSelection={showBulkActions}
              />
            </Suspense>
          </LazyLoadingBoundary>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Advanced Filters with Presets */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <LazyLoadingBoundary 
            name="DashboardFilters" 
            skeleton={<PageSkeleton variant="form" />}
          >
            <Suspense fallback={<PageSkeleton variant="form" />}>
              <DashboardFilters
                filters={filters}
                onFiltersChange={handleFilterChange}
                totalProjects={totalCount}
                filteredCount={projects.length}
                isLoading={isLoading}
                userTags={filterSuggestions.tags.map(name => ({ 
                  id: name, 
                  name, 
                  color: '#3B82F6', 
                  usageCount: 0,
                  isSystem: false,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }))}
                userFolders={filterSuggestions.folders}
              />
            </Suspense>
          </LazyLoadingBoundary>
        </div>

        <div className="lg:w-auto">
          <LazyLoadingBoundary 
            name="FilterPresets" 
            skeleton={<div className="h-12 w-48 bg-gray-200 rounded animate-pulse" />}
          >
            <Suspense fallback={<div className="h-12 w-48 bg-gray-200 rounded animate-pulse" />}>
              <FilterPresets
                currentFilters={filters}
                onApplyFilters={setFilters}
                userId={userId}
              />
            </Suspense>
          </LazyLoadingBoundary>
        </div>
      </div>

      {/* Performance Stats (Development mode) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Search Performance: {lastSearchTime.toFixed(2)}ms</span>
            <span>Cache: {cacheInfo.hits}/{cacheInfo.hits + cacheInfo.misses} hits ({cacheInfo.size} entries)</span>
            <span>Results: {projects.length}/{totalCount}</span>
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
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
                onClick={() => onBulkActions('favorite')}
              >
                Favoritar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkActions('export')}
              >
                Exportar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onBulkActions('delete')}
              >
                Excluir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelSelection}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Projects Grid */}
      {renderProjectsGrid()}

      {/* Analytics Panel (if available) */}
      {stats && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Estatísticas</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
              <div className="text-sm text-gray-600">Projetos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.averageWordsPerProject}</div>
              <div className="text-sm text-gray-600">Palavras/projeto</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{Object.keys(stats.projectsByPlatform).length}</div>
              <div className="text-sm text-gray-600">Plataformas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.mostUsedTags.length}</div>
              <div className="text-sm text-gray-600">Tags ativas</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Enhanced Tags Tab Component
const TagsTab: React.FC<{ userId: string }> = ({ userId }) => (
  <div className="space-y-6">
    <LazyLoadingBoundary 
      name="TagManager" 
      skeleton={<PageSkeleton variant="page" />}
    >
      <Suspense fallback={<PageSkeleton variant="page" />}>
        <TagManager 
          userId={userId}
          showAnalytics={true}
          allowBulkOperations={true}
        />
      </Suspense>
    </LazyLoadingBoundary>
  </div>
);

// =============================================================================
// MAIN DASHBOARD COMPONENT
// =============================================================================

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

  interface DynamicServices {
    ProjectService?: typeof import('../services/projectService').ProjectService;
    SearchService?: typeof import('../services/searchService').SearchService;
    TagService?: typeof import('../services/tagService').TagService;
    analyticsService?: typeof import('../services/analyticsService').AnalyticsService;
  }

  const [services, setServices] = useState<DynamicServices>({});

  // Load services dynamically
  useEffect(() => {
    const loadServices = async () => {
      try {
        const [ProjectService, SearchService, TagService, analyticsService] = await Promise.all([
          loadProjectService(),
          loadSearchService(),
          loadTagService(),
          loadAnalyticsService(),
        ]);

        setServices({
          ProjectService,
          SearchService,
          TagService,
          analyticsService,
        });

        userDashboardLogger.info('Dashboard services loaded dynamically', {
          services: ['ProjectService', 'SearchService', 'TagService', 'analyticsService']
        }, 'LAZY_LOADING');
      } catch (error) {
        userDashboardLogger.error('Failed to load dashboard services', { error }, 'LAZY_LOADING');
      }
    };

    loadServices();
  }, []);

  useEffect(() => {
    loadProjects();
    
    // Track page view
    if (currentUser && services.analyticsService) {
      services.analyticsService.trackPageView(currentUser.uid, 'dashboard');
    }
  }, [currentUser, services.analyticsService]);

  useEffect(() => {
    applyFilters();
  }, [projects, filters, services.SearchService]);

  const loadProjects = async () => {
    if (!currentUser || !services.ProjectService) return;

    try {
      setLoading(true);
      setError('');

      // Buscar projetos usando o serviço carregado dinamicamente
      const userProjects = await services.ProjectService.getUserProjects(currentUser.uid);
      
      // Migrar projetos antigos automaticamente
      const migratedProjects = await Promise.all(
        userProjects.map((project: EnhancedProject) => services.ProjectService!.migrateOldProject(project))
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
    if (!currentUser || !services.SearchService) return;

    try {
      const filtered = await services.SearchService.searchProjects(currentUser.uid, filters);
      setFilteredProjects(filtered);
    } catch (err) {
      console.error('Erro ao filtrar projetos:', err);
      setFilteredProjects(projects);
    }
  };

  const handleFilterChange = (newFilters: ProjectFiltersType) => {
    setFilters(newFilters);
    
    // Track search se há termo de busca
    if (newFilters.search && currentUser && services.analyticsService) {
      services.analyticsService.trackSearch(currentUser.uid, newFilters.search, filteredProjects.length);
    }
  };

  const handleProjectAction = async (action: string, project: EnhancedProject) => {
    if (!currentUser || !services.ProjectService) return;

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
          const duplicated = await services.ProjectService.duplicateProject(project.id, currentUser.uid);
          if (duplicated) {
            await loadProjects();
            // Track analytics
            if (services.analyticsService) {
              services.analyticsService.trackProjectAction(currentUser.uid, 'duplicated', project);
            }
          }
          break;

        case 'toggleFavorite':
          const updated = await services.ProjectService.updateProject(project.id, {
            isFavorite: !project.isFavorite
          });
          if (updated) {
            await loadProjects();
            // Track analytics
            if (services.analyticsService) {
              services.analyticsService.trackProjectAction(
                currentUser.uid, 
                project.isFavorite ? 'unfavorited' : 'favorited', 
                project
              );
            }
          }
          break;

        case 'share':
          const shareData = await services.ProjectService.shareProject(project.id);
          if (shareData) {
            await navigator.clipboard.writeText(shareData.shareUrl);
            alert('Link de compartilhamento copiado!');
            // Track analytics
            if (services.analyticsService) {
              services.analyticsService.trackProjectAction(currentUser.uid, 'shared', project);
            }
          }
          break;

        case 'export':
          const exported = await services.ProjectService.exportProject(project.id);
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
            const deleted = await services.ProjectService.deleteProject(project.id);
            if (deleted) {
              await loadProjects();
              // Track analytics
              if (services.analyticsService) {
                services.analyticsService.trackProjectAction(currentUser.uid, 'deleted', project);
              }
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
    if (!currentUser || selectedProjects.length === 0 || !services.ProjectService) return;

    try {
      switch (action) {
        case 'delete':
          if (window.confirm(`Tem certeza que deseja excluir ${selectedProjects.length} projetos?`)) {
            await Promise.all(
              selectedProjects.map(id => services.ProjectService.deleteProject(id))
            );
            await loadProjects();
            setSelectedProjects([]);
          }
          break;

        case 'favorite':
          await Promise.all(
            selectedProjects.map(id => 
              services.ProjectService.updateProject(id, { isFavorite: true })
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

      {/* Tab Content with Enhanced Integration */}
      {activeTab === 'dashboard' && (
        <DashboardTab userId={currentUser?.uid || ""} />
      )}

      {activeTab === 'projects' && (
        <ProjectsTab
          userId={currentUser?.uid || ""}
          viewMode={viewMode}
          selectedProjects={selectedProjects}
          showBulkActions={showBulkActions}
          onProjectAction={handleProjectAction}
          onBulkActions={handleBulkActions}
          onSelectProject={setSelectedProjects}
          onCancelSelection={() => {
            setSelectedProjects([]);
            setShowBulkActions(false);
          }}
          navigate={navigate}
        />
      )}

      {activeTab === 'tags' && <TagsTab userId={currentUser?.uid || ""} />}

      {/* Enhanced Floating Action Button */}
      {activeTab === 'projects' && (
        <Button
          className={cn(
            "fixed bottom-6 right-6 rounded-full shadow-lg transition-all duration-200 z-50",
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
      )}
    </div>
  );
};

export default UserDashboardPage; 