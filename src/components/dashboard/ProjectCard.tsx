import React, { useState } from 'react';
import { 
  MoreVertical, 
  Star, 
  StarOff, 
  Edit, 
  Copy, 
  Share, 
  Download, 
  FolderOpen, 
  Trash2, 
  Clock, 
  FileText, 
  Calendar,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Separator } from '../ui/Separator';
import type { EnhancedProject } from '../../types';
import { cn } from '../../lib/utils';

interface ProjectCardProps {
  project: EnhancedProject;
  view: 'grid' | 'list';
  onAction: (action: string, project: EnhancedProject) => void;
  isSelected?: boolean;
  allowSelection?: boolean;
  showActions?: boolean;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  view,
  onAction,
  isSelected = false,
  allowSelection = false,
  showActions = true,
  className = ''
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Data desconhecida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'published': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': 
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'published': return 'Publicado';
      case 'draft': 
      default: return 'Rascunho';
    }
  };

  const getPlatformEmoji = (platform: string) => {
    const platformEmojis: Record<string, string> = {
      'YouTube': '📺',
      'Instagram': '📷',
      'TikTok': '🎵',
      'Facebook': '👥',
      'LinkedIn': '💼',
      'Twitter': '🐦',
    };
    return platformEmojis[platform] || '📱';
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (!content || content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const handleActionClick = (action: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setShowMenu(false);
    onAction(action, project);
  };

  const handleCardClick = () => {
    if (allowSelection) {
      onAction('select', project);
    } else {
      onAction('view', project);
    }
  };

  const cardClasses = cn(
    "group relative transition-all duration-200 cursor-pointer",
    "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1",
    "border border-border/50 bg-background/60 backdrop-blur-sm",
    view === 'grid' ? "p-4 rounded-lg" : "p-3 flex items-center gap-4 rounded-md",
    isSelected && "ring-2 ring-primary ring-offset-2",
    "hover:border-primary/30",
    className
  );

  // Renderização em Grid
  if (view === 'grid') {
    return (
      <Card 
        className={cardClasses}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header do Card */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getPlatformEmoji(project.formData.platform)}</span>
              {project.isFavorite && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              {project.isShared && (
                <ExternalLink className="h-3 w-3 text-blue-500" />
              )}
            </div>
            <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
              {project.title || project.formData.subject}
            </h3>
          </div>

          {/* Menu de Ações */}
          {showActions && (
            <div className="relative ml-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                  showMenu && "opacity-100"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {showMenu && (
                <div className="absolute right-0 top-8 bg-background rounded-md shadow-lg border border-border z-20 min-w-[180px]">
                  <div className="py-1">
                    <ActionButton 
                      icon={Edit} 
                      onClick={(e) => handleActionClick('edit', e)}
                    >
                      Editar
                    </ActionButton>
                    <ActionButton 
                      icon={Eye} 
                      onClick={(e) => handleActionClick('view', e)}
                    >
                      Visualizar
                    </ActionButton>
                    <ActionButton 
                      icon={Copy} 
                      onClick={(e) => handleActionClick('duplicate', e)}
                    >
                      Duplicar
                    </ActionButton>
                    <ActionButton 
                      icon={Share} 
                      onClick={(e) => handleActionClick('share', e)}
                    >
                      Compartilhar
                    </ActionButton>
                    <ActionButton 
                      icon={Download} 
                      onClick={(e) => handleActionClick('export', e)}
                    >
                      Exportar
                    </ActionButton>
                    <ActionButton 
                      icon={project.isFavorite ? StarOff : Star} 
                      onClick={(e) => handleActionClick('toggleFavorite', e)}
                    >
                      {project.isFavorite ? 'Desfavoritar' : 'Favoritar'}
                    </ActionButton>
                    <ActionButton 
                      icon={FolderOpen} 
                      onClick={(e) => handleActionClick('move', e)}
                    >
                      Mover para pasta
                    </ActionButton>
                    <Separator className="my-1" />
                    <ActionButton 
                      icon={Trash2} 
                      onClick={(e) => handleActionClick('delete', e)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Excluir
                    </ActionButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prévia do Conteúdo */}
        {project.content && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {truncateContent(project.content)}
            </p>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
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

        {/* Métricas */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {project.formData.duration}s
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {project.formData.platform}
          </Badge>
          <Badge 
            className={cn("text-xs border", getStatusColor(project.status || 'draft'))}
          >
            {getStatusLabel(project.status || 'draft')}
          </Badge>
          {project.wordCount && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {project.wordCount} palavras
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(project.updatedAt || project.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            {project.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {project.viewCount}
              </span>
            )}
            {project.editCount > 0 && (
              <span className="flex items-center gap-1">
                <Edit className="h-3 w-3" />
                {project.editCount}
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Renderização em Lista
  return (
    <Card 
      className={cardClasses}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox de seleção */}
      {allowSelection && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onAction('select', project)}
          className="mr-3 rounded"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Ícone da plataforma */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg">{getPlatformEmoji(project.formData.platform)}</span>
        {project.isFavorite && (
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 min-w-0 px-3">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground truncate">
            {project.title || project.formData.subject}
          </h3>
          {project.isShared && (
            <ExternalLink className="h-3 w-3 text-blue-500 flex-shrink-0" />
          )}
        </div>
        
        {project.content && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {truncateContent(project.content, 100)}
          </p>
        )}
      </div>

      {/* Tags (versão compacta) */}
      <div className="hidden md:flex items-center gap-1 min-w-0">
        {project.tags?.slice(0, 2).map(tag => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {project.tags && project.tags.length > 2 && (
          <span className="text-xs text-muted-foreground">+{project.tags.length - 2}</span>
        )}
      </div>

      {/* Métricas compactas */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {project.formData.duration}s
        </span>
        {project.wordCount && (
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {project.wordCount}
          </span>
        )}
        <Badge 
          className={cn("text-xs border", getStatusColor(project.status || 'draft'))}
        >
          {getStatusLabel(project.status || 'draft')}
        </Badge>
      </div>

      {/* Data */}
      <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground min-w-0">
        <Calendar className="h-3 w-3" />
        <span>{formatDate(project.updatedAt || project.createdAt)}</span>
      </div>

      {/* Menu de ações */}
      {showActions && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
              showMenu && "opacity-100"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-background rounded-md shadow-lg border border-border z-20 min-w-[180px]">
              <div className="py-1">
                <ActionButton 
                  icon={Edit} 
                  onClick={(e) => handleActionClick('edit', e)}
                >
                  Editar
                </ActionButton>
                <ActionButton 
                  icon={Copy} 
                  onClick={(e) => handleActionClick('duplicate', e)}
                >
                  Duplicar
                </ActionButton>
                <ActionButton 
                  icon={Share} 
                  onClick={(e) => handleActionClick('share', e)}
                >
                  Compartilhar
                </ActionButton>
                <ActionButton 
                  icon={project.isFavorite ? StarOff : Star} 
                  onClick={(e) => handleActionClick('toggleFavorite', e)}
                >
                  {project.isFavorite ? 'Desfavoritar' : 'Favoritar'}
                </ActionButton>
                <Separator className="my-1" />
                <ActionButton 
                  icon={Trash2} 
                  onClick={(e) => handleActionClick('delete', e)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Excluir
                </ActionButton>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// Componente auxiliar para itens do menu
interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon: Icon, 
  onClick, 
  className = "", 
  children 
}) => (
  <button
    className={cn(
      "w-full flex items-center gap-2 px-3 py-2 text-sm text-left",
      "hover:bg-muted/50 transition-colors",
      className
    )}
    onClick={onClick}
  >
    <Icon className="h-4 w-4" />
    {children}
  </button>
);

export default ProjectCard; 