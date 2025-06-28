import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  GitBranch, 
  Settings, 
  BarChart, 
  FileText,
  ExternalLink,
  Download,
  Lightbulb,
  Code,
  Monitor,
  CheckCircle
} from 'lucide-react';

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';
import { adminService } from '../../services/adminService';
import { createLogger } from '../../utils/logger';

const logger = createLogger('AdminDocumentation');

interface DocumentationSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  file: string;
  lastUpdated: string;
  size: string;
  category: 'methodology' | 'coordination' | 'technical' | 'operations';
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'view' | 'download' | 'external';
}

const AdminDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [permissions] = useState(adminService.getPermissions());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Log access to admin documentation
    adminService.logAccess('admin:documentation', 'granted');
    logger.info('Admin documentation accessed', {
      user: adminService.getCurrentRole()?.email,
      permissions: permissions,
    });
  }, [permissions]);

  const documentationSections: DocumentationSection[] = [
    {
      id: 'multi-ai-coordination',
      title: 'Coordenação Multi-AI',
      description: 'Sistema de coordenação entre múltiplas IAs trabalhando simultaneamente',
      icon: <Users className="h-5 w-5" />,
      file: 'COORDENACAO_MULTI_AI.md',
      lastUpdated: '26/01/2025',
      size: '12KB',
      category: 'coordination'
    },
    {
      id: 'project-board',
      title: 'Metodologia Triple Track',
      description: 'Sistema organizacional para múltiplos projetos coordenados',
      icon: <BarChart className="h-5 w-5" />,
      file: 'PROJECT_BOARD.md',
      lastUpdated: '26/01/2025',
      size: '8KB',
      category: 'methodology'
    },
    {
      id: 'ai-coordination-prompt',
      title: 'Prompt Coordenação 3 IAs',
      description: 'Instruções completas para trabalho coordenado entre IAs',
      icon: <FileText className="h-5 w-5" />,
      file: 'AI_COORDINATION_PROMPT_3_IAS.md',
      lastUpdated: '26/01/2025',
      size: '6KB',
      category: 'coordination'
    },
    {
      id: 'status-tracker',
      title: 'Status Tracker JSON',
      description: 'Tracking em tempo real do status de cada IA',
      icon: <Monitor className="h-5 w-5" />,
      file: 'AI_STATUS_TRACKER.json',
      lastUpdated: '26/01/2025',
      size: '2KB',
      category: 'technical'
    },
    {
      id: 'cursor-rules',
      title: 'Regras Automáticas Cursor',
      description: 'Regras aplicadas automaticamente para coordenação',
      icon: <Settings className="h-5 w-5" />,
      file: '.cursorrules',
      lastUpdated: '26/01/2025',
      size: '3KB',
      category: 'technical'
    },
    {
      id: 'merge-strategy',
      title: 'Estratégia de Merge Inteligente',
      description: 'Como combinar trabalhos de múltiplas IAs',
      icon: <GitBranch className="h-5 w-5" />,
      file: 'MERGE_STRATEGY_INTELIGENTE.md',
      lastUpdated: '26/01/2025',
      size: '5KB',
      category: 'coordination'
    },
    {
      id: 'upgrade-report',
      title: 'Relatório Upgrade Multi-AI',
      description: 'Documentação completa do upgrade para 3 IAs',
      icon: <CheckCircle className="h-5 w-5" />,
      file: 'RELATORIO_UPGRADE_MULTI_AI.md',
      lastUpdated: '26/01/2025',
      size: '7KB',
      category: 'technical'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'view-coordination',
      label: 'Ver Status Coordenação',
      description: 'Status atual das 3 IAs',
      icon: <Users className="h-4 w-4" />,
      action: () => window.open('/COORDENACAO_MULTI_AI.md', '_blank'),
      category: 'view'
    },
    {
      id: 'download-all',
      label: 'Download Documentação',
      description: 'Baixar todos os arquivos de coordenação',
      icon: <Download className="h-4 w-4" />,
      action: () => {
        // Implementation for downloading documentation
        logger.info('Documentation download requested');
      },
      category: 'download'
    },
    {
      id: 'view-tracker',
      label: 'Status Tracker JSON',
      description: 'Ver tracking em tempo real',
      icon: <Monitor className="h-4 w-4" />,
      action: () => window.open('/AI_STATUS_TRACKER.json', '_blank'),
      category: 'view'
    },
    {
      id: 'methodology-guide',
      label: 'Guia Metodologia',
      description: 'Triple Track System explicado',
      icon: <BookOpen className="h-4 w-4" />,
      action: () => window.open('/PROJECT_BOARD.md', '_blank'),
      category: 'view'
    }
  ];

  const filteredDocumentation = selectedCategory === 'all' 
    ? documentationSections 
    : documentationSections.filter(doc => doc.category === selectedCategory);

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      methodology: 'bg-blue-100 text-blue-800',
      coordination: 'bg-green-100 text-green-800',
      technical: 'bg-purple-100 text-purple-800',
      operations: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const categories = [
    { id: 'all', label: 'Todos', count: documentationSections.length },
    { id: 'methodology', label: 'Metodologia', count: documentationSections.filter(d => d.category === 'methodology').length },
    { id: 'coordination', label: 'Coordenação', count: documentationSections.filter(d => d.category === 'coordination').length },
    { id: 'technical', label: 'Técnico', count: documentationSections.filter(d => d.category === 'technical').length },
    { id: 'operations', label: 'Operações', count: documentationSections.filter(d => d.category === 'operations').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Documentação Administrativa</h2>
            <p className="text-gray-600">Metodologia Multi-AI e Coordenação de Projetos</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              activeTab === 'overview' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Visão Geral
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              activeTab === 'documentation' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('documentation')}
          >
            Documentação
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              activeTab === 'tools' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('tools')}
          >
            Ferramentas
          </button>
        </div>
      </Tabs>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Methodology Overview */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold">Metodologia Multi-AI</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Sistema coordenado para até 3 IAs trabalhando simultaneamente com especialização definida.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                IA A: Backend & Architecture
              </div>
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                IA B: Frontend & UX
              </div>
              <div className="flex items-center text-sm">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                IA C: DevOps & QA
              </div>
            </div>
          </Card>

          {/* Current Status */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Status Atual</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">IAs Ativas</span>
                <Badge variant="secondary">3 de 3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sistema Coordenação</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Documentação</span>
                <Badge className="bg-blue-100 text-blue-800">Atualizada</Badge>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">Estatísticas</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Arquivos Documentação</span>
                <span className="font-semibold">7</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tracks Ativos</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Última Atualização</span>
                <span className="text-sm">Hoje</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'documentation' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>

          {/* Documentation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDocumentation.map(doc => (
              <Card key={doc.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {doc.icon}
                    <div>
                      <h3 className="font-semibold">{doc.title}</h3>
                      <p className="text-sm text-gray-600">{doc.description}</p>
                    </div>
                  </div>
                  <Badge className={getCategoryBadgeColor(doc.category)}>
                    {doc.category}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Atualizado: {doc.lastUpdated}</span>
                  <span>Tamanho: {doc.size}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/${doc.file}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ver Arquivo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Copy file path to clipboard
                      navigator.clipboard.writeText(doc.file);
                    }}
                  >
                    <Code className="h-4 w-4 mr-1" />
                    Copiar Path
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {quickActions.map(action => (
            <Card key={action.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={action.action}>
              <div className="flex items-center gap-3 mb-3">
                {action.icon}
                <div>
                  <h3 className="font-semibold">{action.label}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {action.category}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDocumentation; 