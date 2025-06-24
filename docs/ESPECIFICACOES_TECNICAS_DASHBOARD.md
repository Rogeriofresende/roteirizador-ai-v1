# ESPECIFICAÇÕES TÉCNICAS - DASHBOARD APRIMORADO

**Projeto:** Roteirar IA - Dashboard Enhancement  
**Versão:** 1.0  
**Data:** Janeiro 2025  

## 🏗️ ARQUITETURA TÉCNICA

### Estrutura de Componentes

```
src/components/dashboard/
├── DashboardFilters.tsx         # Sistema de filtros e busca
├── ProjectCard.tsx              # Card de projeto aprimorado
├── ProjectGrid.tsx              # Grid responsivo de projetos
├── TagManager.tsx               # Gerenciador de tags
├── FolderTree.tsx               # Árvore de pastas
├── DashboardStats.tsx           # Métricas e estatísticas
├── QuickActions.tsx             # Ações rápidas
├── SearchBar.tsx                # Barra de busca
├── FilterDropdowns.tsx          # Dropdowns de filtro
└── EmptyState.tsx               # Estado vazio
```

### Novos Serviços

```
src/services/
├── projectService.ts            # CRUD completo de projetos
├── tagService.ts                # Gerenciamento de tags
├── folderService.ts             # Sistema de pastas
├── searchService.ts             # Busca avançada
├── exportService.ts             # Exportação de projetos
└── shareService.ts              # Compartilhamento
```

## 🗄️ SCHEMA DO BANCO DE DADOS

### Enhanced Project Schema
```typescript
interface EnhancedProject {
  id: string;
  userId: string;
  title: string;
  content: string;
  
  // Metadados originais
  formData: {
    subject: string;
    duration: number;
    platform: string;
    tone: string;
    audience: string;
    additionalNotes?: string;
  };
  
  // Novas funcionalidades
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
  status: 'draft' | 'completed' | 'published';
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastEditedAt?: Timestamp;
  
  // Métricas
  version: number;
  wordCount: number;
  estimatedDuration: number;
  viewCount: number;
  editCount: number;
  
  // Sharing
  isShared: boolean;
  shareLink?: string;
  shareExpiresAt?: Timestamp;
}
```

### Folder Schema
```typescript
interface Folder {
  id: string;
  userId: string;
  name: string;
  description?: string;
  parentId?: string; // Para hierarquia
  color: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  projectCount: number;
  isDefault: boolean;
}
```

### Tag Schema
```typescript
interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  category: 'platform' | 'tone' | 'audience' | 'status' | 'custom';
  usageCount: number;
  createdAt: Timestamp;
  isSystemTag: boolean;
}
```

### User Analytics Schema
```typescript
interface UserAnalytics {
  userId: string;
  period: string; // 'daily', 'weekly', 'monthly'
  date: string;
  
  metrics: {
    projectsCreated: number;
    projectsEdited: number;
    totalWords: number;
    totalDuration: number;
    platformUsage: Record<string, number>;
    tagUsage: Record<string, number>;
    folderUsage: Record<string, number>;
  };
  
  createdAt: Timestamp;
}
```

## 🔍 SISTEMA DE FILTROS E BUSCA

### Filter Interface
```typescript
interface ProjectFilters {
  search?: string;
  tags?: string[];
  folders?: string[];
  platforms?: string[];
  status?: Array<'draft' | 'completed' | 'published'>;
  dateRange?: {
    start: Date;
    end: Date;
  };
  duration?: {
    min: number;
    max: number;
  };
  isFavorite?: boolean;
  sortBy: 'createdAt' | 'updatedAt' | 'title' | 'duration' | 'wordCount';
  sortOrder: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
```

### Search Service Implementation
```typescript
export class SearchService {
  static async searchProjects(
    userId: string, 
    filters: ProjectFilters
  ): Promise<{ projects: EnhancedProject[]; totalCount: number }> {
    let query = collection(db, 'scripts')
      .where('userId', '==', userId);

    // Aplicar filtros
    if (filters.tags?.length) {
      query = query.where('tags', 'array-contains-any', filters.tags);
    }

    if (filters.folders?.length) {
      query = query.where('folderId', 'in', filters.folders);
    }

    if (filters.platforms?.length) {
      query = query.where('formData.platform', 'in', filters.platforms);
    }

    if (filters.status?.length) {
      query = query.where('status', 'in', filters.status);
    }

    if (filters.isFavorite !== undefined) {
      query = query.where('isFavorite', '==', filters.isFavorite);
    }

    // Ordenação
    query = query.orderBy(filters.sortBy, filters.sortOrder);

    // Paginação
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await getDocs(query);
    let projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EnhancedProject[];

    // Busca textual (client-side para flexibilidade)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      projects = projects.filter(project => 
        project.title.toLowerCase().includes(searchTerm) ||
        project.content.toLowerCase().includes(searchTerm) ||
        project.formData.subject.toLowerCase().includes(searchTerm) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filtro de duração (client-side)
    if (filters.duration) {
      projects = projects.filter(project => {
        const duration = project.formData.duration;
        return duration >= filters.duration!.min && 
               duration <= filters.duration!.max;
      });
    }

    return {
      projects,
      totalCount: projects.length
    };
  }
}
```

## 🏷️ SISTEMA DE TAGS

### Tag Manager Component
```typescript
interface TagManagerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  allowCreate?: boolean;
  categoryFilter?: string[];
}

const TagManager: React.FC<TagManagerProps> = ({
  selectedTags,
  onTagsChange,
  allowCreate = true,
  categoryFilter
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Implementação do componente...
};
```

### Tag Service
```typescript
export class TagService {
  static async getUserTags(userId: string): Promise<Tag[]> {
    const q = query(
      collection(db, 'tags'),
      where('userId', '==', userId),
      orderBy('usageCount', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Tag[];
  }

  static async createTag(userId: string, tagData: Partial<Tag>): Promise<string> {
    const tag: Omit<Tag, 'id'> = {
      userId,
      name: tagData.name!,
      color: tagData.color || this.generateRandomColor(),
      category: tagData.category || 'custom',
      usageCount: 0,
      createdAt: Timestamp.now(),
      isSystemTag: false
    };

    const docRef = await addDoc(collection(db, 'tags'), tag);
    return docRef.id;
  }

  static async incrementTagUsage(tagId: string): Promise<void> {
    const tagRef = doc(db, 'tags', tagId);
    await updateDoc(tagRef, {
      usageCount: increment(1)
    });
  }

  private static generateRandomColor(): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
```

## 📁 SISTEMA DE PASTAS

### Folder Tree Component
```typescript
interface FolderTreeProps {
  selectedFolderId?: string;
  onFolderSelect: (folderId: string | undefined) => void;
  allowCreate?: boolean;
  allowReorder?: boolean;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  selectedFolderId,
  onFolderSelect,
  allowCreate = true,
  allowReorder = false
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  // Implementação com hierarquia...
};
```

### Folder Service
```typescript
export class FolderService {
  static async createFolder(
    userId: string, 
    name: string, 
    parentId?: string,
    color?: string
  ): Promise<string> {
    const folder: Omit<Folder, 'id'> = {
      userId,
      name,
      parentId,
      color: color || '#6B7280',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      projectCount: 0,
      isDefault: false
    };

    const docRef = await addDoc(collection(db, 'folders'), folder);
    return docRef.id;
  }

  static async getFolderHierarchy(userId: string): Promise<Folder[]> {
    const q = query(
      collection(db, 'folders'),
      where('userId', '==', userId),
      orderBy('name')
    );

    const snapshot = await getDocs(q);
    const folders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Folder[];

    // Organizar em hierarquia
    return this.buildHierarchy(folders);
  }

  private static buildHierarchy(folders: Folder[]): Folder[] {
    const folderMap = new Map<string, Folder & { children: Folder[] }>();
    
    // Criar map com propriedade children
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    const rootFolders: (Folder & { children: Folder[] })[] = [];

    // Construir hierarquia
    folders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!;
      
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children.push(folderWithChildren);
        } else {
          rootFolders.push(folderWithChildren);
        }
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

    return rootFolders;
  }
}
```

## 📊 SISTEMA DE MÉTRICAS

### Analytics Service
```typescript
export class AnalyticsService {
  static async getUserStats(
    userId: string, 
    period: 'week' | 'month' | 'year' = 'month'
  ): Promise<UserStats> {
    const projects = await this.getUserProjects(userId);
    
    const now = new Date();
    const startDate = this.getStartDate(now, period);
    
    const filteredProjects = projects.filter(project => 
      project.createdAt.toDate() >= startDate
    );

    return {
      totalProjects: projects.length,
      recentProjects: filteredProjects.length,
      totalWords: projects.reduce((sum, p) => sum + p.wordCount, 0),
      totalDuration: projects.reduce((sum, p) => sum + p.formData.duration, 0),
      platformStats: this.calculatePlatformStats(projects),
      tagStats: this.calculateTagStats(projects),
      folderStats: await this.calculateFolderStats(userId, projects),
      timelineData: this.generateTimelineData(projects, period)
    };
  }

  private static calculatePlatformStats(projects: EnhancedProject[]): Record<string, number> {
    return projects.reduce((acc, project) => {
      const platform = project.formData.platform;
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private static calculateTagStats(projects: EnhancedProject[]): Record<string, number> {
    const tagStats: Record<string, number> = {};
    
    projects.forEach(project => {
      project.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
    });

    return tagStats;
  }
}
```

## 🎯 AÇÕES RÁPIDAS

### Quick Actions Component
```typescript
interface QuickActionsProps {
  project: EnhancedProject;
  onEdit: (project: EnhancedProject) => void;
  onDuplicate: (project: EnhancedProject) => void;
  onShare: (project: EnhancedProject) => void;
  onExport: (project: EnhancedProject) => void;
  onToggleFavorite: (project: EnhancedProject) => void;
  onMove: (project: EnhancedProject) => void;
  onDelete: (project: EnhancedProject) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  project,
  onEdit,
  onDuplicate,
  onShare,
  onExport,
  onToggleFavorite,
  onMove,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowMenu(!showMenu)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-8 bg-white rounded-md shadow-lg border z-10 min-w-[180px]">
          <div className="py-1">
            <ActionButton icon={Edit} onClick={() => onEdit(project)}>
              Editar
            </ActionButton>
            <ActionButton icon={Copy} onClick={() => onDuplicate(project)}>
              Duplicar
            </ActionButton>
            <ActionButton icon={Share} onClick={() => onShare(project)}>
              Compartilhar
            </ActionButton>
            <ActionButton icon={Download} onClick={() => onExport(project)}>
              Exportar
            </ActionButton>
            <ActionButton 
              icon={project.isFavorite ? StarOff : Star} 
              onClick={() => onToggleFavorite(project)}
            >
              {project.isFavorite ? 'Desfavoritar' : 'Favoritar'}
            </ActionButton>
            <ActionButton icon={FolderOpen} onClick={() => onMove(project)}>
              Mover para pasta
            </ActionButton>
            <Separator />
            <ActionButton 
              icon={Trash2} 
              onClick={() => onDelete(project)}
              className="text-red-600 hover:text-red-700"
            >
              Excluir
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🎨 COMPONENTES DE UI

### Project Card Enhanced
```typescript
interface ProjectCardProps {
  project: EnhancedProject;
  view: 'grid' | 'list';
  onAction: (action: string, project: EnhancedProject) => void;
  isSelected?: boolean;
  allowSelection?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  view,
  onAction,
  isSelected = false,
  allowSelection = false
}) => {
  const cardClasses = cn(
    "bg-white rounded-lg border transition-all duration-200 hover:shadow-md",
    view === 'grid' ? "p-4" : "p-3 flex items-center gap-4",
    isSelected && "ring-2 ring-blue-500",
    "group"
  );

  return (
    <Card className={cardClasses}>
      {allowSelection && (
        <Checkbox 
          checked={isSelected}
          onChange={(checked) => onAction('select', project)}
          className="absolute top-2 left-2"
        />
      )}
      
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {project.title || project.formData.subject}
          </h3>
          {project.isFavorite && (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {project.formData.duration}s
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {project.formData.platform}
          </Badge>
          <Badge 
            variant={project.status === 'completed' ? 'default' : 'outline'} 
            className="text-xs"
          >
            {project.status}
          </Badge>
        </div>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 mb-3">
          Criado em {formatDate(project.createdAt)}
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <QuickActions 
          project={project}
          onEdit={(p) => onAction('edit', p)}
          onDuplicate={(p) => onAction('duplicate', p)}
          onShare={(p) => onAction('share', p)}
          onExport={(p) => onAction('export', p)}
          onToggleFavorite={(p) => onAction('toggleFavorite', p)}
          onMove={(p) => onAction('move', p)}
          onDelete={(p) => onAction('delete', p)}
        />
      </div>
    </Card>
  );
};
```

## ⚡ OTIMIZAÇÕES DE PERFORMANCE

### Virtual Scrolling para Grandes Listas
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedProjectList: React.FC<{
  projects: EnhancedProject[];
  height: number;
  itemHeight: number;
}> = ({ projects, height, itemHeight }) => {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <ProjectCard 
        project={projects[index]} 
        view="list"
        onAction={handleAction}
      />
    </div>
  );

  return (
    <List
      height={height}
      itemCount={projects.length}
      itemSize={itemHeight}
      itemData={projects}
    >
      {Row}
    </List>
  );
};
```

### Infinite Scroll Implementation
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

const useInfiniteProjects = (userId: string, filters: ProjectFilters) => {
  return useInfiniteQuery({
    queryKey: ['projects', userId, filters],
    queryFn: ({ pageParam = 0 }) => 
      SearchService.searchProjects(userId, {
        ...filters,
        offset: pageParam * 20,
        limit: 20
      }),
    getNextPageParam: (lastPage, pages) => 
      lastPage.projects.length === 20 ? pages.length : undefined,
  });
};
```

---

*Esta especificação técnica serve como guia para a implementação do dashboard aprimorado e deve ser consultada durante todo o desenvolvimento.* 