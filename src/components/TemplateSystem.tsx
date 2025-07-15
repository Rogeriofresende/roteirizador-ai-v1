import React, { useState, useCallback } from 'react';
import { FileText, Plus, Edit3, Trash2, Copy, Sparkles } from 'lucide-react';
import { IdeaFormData } from '../types/IdeaTypes';

interface IdeaTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  formData: Partial<IdeaFormData>;
  isDefault: boolean;
  createdAt: string;
  usageCount: number;
}

interface TemplateSystemProps {
  onApplyTemplate: (template: IdeaTemplate) => void;
  currentFormData?: Partial<IdeaFormData>;
}

const DEFAULT_TEMPLATES: IdeaTemplate[] = [
  {
    id: 'marketing-video',
    name: 'Vídeo Marketing',
    description: 'Template para ideias de vídeos promocionais',
    category: 'Marketing & Growth',
    formData: {
      category: 'Marketing & Growth',
      contentType: 'Videos',
      targetAudience: 'Startups',
      style: 'Educativo',
      difficulty: 'intermediate',
      keywords: ['marketing', 'promocional', 'engajamento']
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0
  },
  {
    id: 'educational-post',
    name: 'Conteúdo Educativo',
    description: 'Template para posts educativos',
    category: 'Educação & Tutoriais',
    formData: {
      category: 'Educação & Tutoriais',
      contentType: 'Posts',
      targetAudience: 'Criadores de conteúdo',
      style: 'Educativo',
      difficulty: 'beginner',
      keywords: ['educação', 'tutorial', 'aprendizado']
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0
  },
  {
    id: 'viral-trend',
    name: 'Tendência Viral',
    description: 'Template para conteúdo viral',
    category: 'Entretenimento & Viral',
    formData: {
      category: 'Entretenimento & Viral',
      contentType: 'Short Videos',
      targetAudience: 'Público geral',
      style: 'Viral',
      difficulty: 'intermediate',
      keywords: ['viral', 'tendência', 'engajamento']
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0
  },
  {
    id: 'business-strategy',
    name: 'Estratégia de Negócios',
    description: 'Template para ideias de negócios',
    category: 'Negócios & Estratégia',
    formData: {
      category: 'Negócios & Estratégia',
      contentType: 'Artigos',
      targetAudience: 'Empreendedores',
      style: 'Profissional',
      difficulty: 'advanced',
      keywords: ['negócios', 'estratégia', 'empreendedorismo']
    },
    isDefault: true,
    createdAt: new Date().toISOString(),
    usageCount: 0
  }
];

export const TemplateSystem: React.FC<TemplateSystemProps> = ({
  onApplyTemplate,
  currentFormData
}) => {
  const [templates, setTemplates] = useState<IdeaTemplate[]>(() => {
    // Load templates from localStorage
    const saved = localStorage.getItem('idea_templates');
    return saved ? [...DEFAULT_TEMPLATES, ...JSON.parse(saved)] : DEFAULT_TEMPLATES;
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<IdeaTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<IdeaTemplate>>({
    name: '',
    description: '',
    category: 'Marketing & Growth'
  });

  // Save templates to localStorage
  const saveTemplates = useCallback((updatedTemplates: IdeaTemplate[]) => {
    const customTemplates = updatedTemplates.filter(t => !t.isDefault);
    localStorage.setItem('idea_templates', JSON.stringify(customTemplates));
    setTemplates(updatedTemplates);
  }, []);

  // Apply template to form
  const handleApplyTemplate = useCallback((template: IdeaTemplate) => {
    // Update usage count
    const updatedTemplates = templates.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    );
    saveTemplates(updatedTemplates);
    
    onApplyTemplate(template);
  }, [templates, saveTemplates, onApplyTemplate]);

  // Create new template
  const handleCreateTemplate = useCallback(() => {
    if (!newTemplate.name || !newTemplate.description) return;

    const template: IdeaTemplate = {
      id: `custom_${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category || 'Marketing & Growth',
      formData: currentFormData || {},
      isDefault: false,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    const updatedTemplates = [...templates, template];
    saveTemplates(updatedTemplates);
    
    setNewTemplate({ name: '', description: '', category: 'Marketing & Growth' });
    setShowCreateModal(false);
  }, [newTemplate, currentFormData, templates, saveTemplates]);

  // Edit template
  const handleEditTemplate = useCallback((template: IdeaTemplate) => {
    if (template.isDefault) return;
    
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      description: template.description,
      category: template.category
    });
    setShowCreateModal(true);
  }, []);

  // Update template
  const handleUpdateTemplate = useCallback(() => {
    if (!editingTemplate || !newTemplate.name || !newTemplate.description) return;

    const updatedTemplates = templates.map(t => 
      t.id === editingTemplate.id 
        ? { 
            ...t, 
            name: newTemplate.name,
            description: newTemplate.description,
            category: newTemplate.category || t.category
          }
        : t
    );
    
    saveTemplates(updatedTemplates);
    setEditingTemplate(null);
    setNewTemplate({ name: '', description: '', category: 'Marketing & Growth' });
    setShowCreateModal(false);
  }, [editingTemplate, newTemplate, templates, saveTemplates]);

  // Delete template
  const handleDeleteTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) return;

    if (confirm('Tem certeza que deseja excluir este template?')) {
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      saveTemplates(updatedTemplates);
    }
  }, [templates, saveTemplates]);

  // Duplicate template
  const handleDuplicateTemplate = useCallback((template: IdeaTemplate) => {
    const newTemplate: IdeaTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
      name: `${template.name} (Cópia)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);
  }, [templates, saveTemplates]);

  // Sort templates by usage
  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return b.usageCount - a.usageCount;
  });

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Templates de Ideias
        </h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          Criar Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {sortedTemplates.map((template) => (
          <div
            key={template.id}
            className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900 mb-1">
                  {template.name}
                  {template.isDefault && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Padrão
                    </span>
                  )}
                </h4>
                <p className="text-sm text-neutral-600 mb-2">{template.description}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="bg-neutral-100 px-2 py-1 rounded">{template.category}</span>
                  <span>Usado {template.usageCount}x</span>
                </div>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleApplyTemplate(template)}
                  className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                  title="Aplicar Template"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDuplicateTemplate(template)}
                  className="p-1 text-neutral-600 hover:bg-neutral-50 rounded"
                  title="Duplicar Template"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {!template.isDefault && (
                  <>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-1 text-neutral-600 hover:bg-neutral-50 rounded"
                      title="Editar Template"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Excluir Template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingTemplate ? 'Editar Template' : 'Criar Novo Template'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nome do Template
                </label>
                <input
                  type="text"
                  value={newTemplate.name || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Vídeo Marketing"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={newTemplate.description || ''}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Descreva o propósito deste template..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Categoria
                </label>
                <select
                  value={newTemplate.category || 'Marketing & Growth'}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Marketing & Growth">Marketing & Growth</option>
                  <option value="Educação & Tutoriais">Educação & Tutoriais</option>
                  <option value="Entretenimento & Viral">Entretenimento & Viral</option>
                  <option value="Negócios & Estratégia">Negócios & Estratégia</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                  setNewTemplate({ name: '', description: '', category: 'Marketing & Growth' });
                }}
                className="flex-1 px-4 py-2 text-neutral-600 border border-neutral-300 rounded-md hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {editingTemplate ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSystem; 