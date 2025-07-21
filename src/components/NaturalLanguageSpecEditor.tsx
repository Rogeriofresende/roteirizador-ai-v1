/**
 * 🎯 NATURAL LANGUAGE SPEC EDITOR
 * 
 * Editor visual para criar e editar especificações em linguagem natural
 * Implementa V9.0 Natural Language First - Sistema Revolucionário
 * 
 * @author IA Beta - Solution Architect + Frontend
 * @created 2025-07-18T15:05:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NaturalLanguageSpecification, 
  ValidationResult, 
  ProcessingContext,
  Priority,
  Complexity
} from '../types/naturalLanguageTypes';
import { naturalLanguageSpecService } from '../services/naturalLanguageSpecService';

// 🎯 PROPS INTERFACE
interface NaturalLanguageSpecEditorProps {
  specId?: string;
  template?: Partial<NaturalLanguageSpecification>;
  context: ProcessingContext;
  onSave?: (spec: NaturalLanguageSpecification) => void;
  onValidate?: (validation: ValidationResult) => void;
  onGenerateTechnicalPlan?: (specId: string) => void;
  readonly?: boolean;
}

// 🎨 COMPONENT PRINCIPAL
export const NaturalLanguageSpecEditor: React.FC<NaturalLanguageSpecEditorProps> = ({
  specId,
  template,
  context,
  onSave,
  onValidate,
  onGenerateTechnicalPlan,
  readonly = false
}) => {
  // 📊 STATE MANAGEMENT
  const [spec, setSpec] = useState<NaturalLanguageSpecification | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // 🔄 EFFECTS
  useEffect(() => {
    if (specId) {
      loadSpecification();
    } else if (template) {
      createNewSpecification();
    }
  }, [specId, template]);

  useEffect(() => {
    if (spec && onValidate) {
      onValidate(validation!);
    }
  }, [validation, onValidate]);

  // 📖 LOAD SPECIFICATION
  const loadSpecification = useCallback(async () => {
    if (!specId) return;
    
    setIsLoading(true);
    try {
      const loadedSpec = await naturalLanguageSpecService.getSpecification(specId);
      if (loadedSpec) {
        setSpec(loadedSpec);
        setValidation(loadedSpec.validation);
      }
    } catch (error) {
      console.error('Erro ao carregar especificação:', error);
    } finally {
      setIsLoading(false);
    }
  }, [specId]);

  // 🆕 CREATE NEW SPECIFICATION
  const createNewSpecification = useCallback(async () => {
    setIsLoading(true);
    try {
      const newSpec = await naturalLanguageSpecService.createSpecification(
        template || {},
        context
      );
      setSpec(newSpec);
      setValidation(newSpec.validation);
      setIsDirty(true);
    } catch (error) {
      console.error('Erro ao criar especificação:', error);
    } finally {
      setIsLoading(false);
    }
  }, [template, context]);

  // 💾 SAVE SPECIFICATION
  const handleSave = useCallback(async () => {
    if (!spec || readonly) return;
    
    setIsSaving(true);
    try {
      const updatedSpec = await naturalLanguageSpecService.updateSpecification(
        spec.id,
        spec
      );
      if (updatedSpec) {
        setSpec(updatedSpec);
        setValidation(updatedSpec.validation);
        setIsDirty(false);
        if (onSave) onSave(updatedSpec);
      }
    } catch (error) {
      console.error('Erro ao salvar especificação:', error);
    } finally {
      setIsSaving(false);
    }
  }, [spec, readonly, onSave]);

  // ✅ VALIDATE SPECIFICATION
  const handleValidate = useCallback(async () => {
    if (!spec) return;
    
    setIsValidating(true);
    try {
      const validationResult = await naturalLanguageSpecService.validateSpecification(spec.id);
      setValidation(validationResult);
      
      // Update spec with validation result
      setSpec(prev => prev ? { ...prev, validation: validationResult } : null);
    } catch (error) {
      console.error('Erro ao validar especificação:', error);
    } finally {
      setIsValidating(false);
    }
  }, [spec]);

  // 🔄 GENERATE TECHNICAL PLAN
  const handleGenerateTechnicalPlan = useCallback(async () => {
    if (!spec || !onGenerateTechnicalPlan) return;
    
    if (!validation?.isValid) {
      alert('Especificação deve ser válida antes de gerar plano técnico');
      return;
    }
    
    onGenerateTechnicalPlan(spec.id);
  }, [spec, validation, onGenerateTechnicalPlan]);

  // 📝 UPDATE SPECIFICATION
  const updateSpec = useCallback((updates: Partial<NaturalLanguageSpecification>) => {
    if (readonly) return;
    
    setSpec(prev => prev ? { ...prev, ...updates, lastModified: new Date() } : null);
    setIsDirty(true);
  }, [readonly]);

  // 🎨 RENDER LOADING STATE
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando especificação...</p>
        </div>
      </div>
    );
  }

  // 🎨 RENDER EMPTY STATE
  if (!spec) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Nenhuma especificação encontrada</p>
          <button
            onClick={createNewSpecification}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Criar Nova Especificação
          </button>
        </div>
      </div>
    );
  }

  // 🎯 NAVIGATION SECTIONS
  const sections = [
    { id: 'overview', label: 'Visão Geral', icon: '🎯' },
    { id: 'userExperience', label: 'Experiência do Usuário', icon: '🎨' },
    { id: 'technicalBehavior', label: 'Comportamento Técnico', icon: '🔧' },
    { id: 'successCriteria', label: 'Critérios de Sucesso', icon: '📊' },
    { id: 'constraints', label: 'Restrições e Premissas', icon: '🚨' },
    { id: 'metadata', label: 'Metadados', icon: '📋' }
  ];

  // 🎨 RENDER MAIN COMPONENT
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {spec.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Versão {spec.version}</span>
              <span>•</span>
              <span>Criado em {spec.created.toLocaleDateString()}</span>
              <span>•</span>
              <span>Autor: {spec.author}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                spec.status === 'approved' ? 'bg-green-100 text-green-800' :
                spec.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {spec.status}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Validation Badge */}
            {validation && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                validation.isValid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {validation.isValid ? '✅ Válida' : '❌ Inválida'} 
                ({Math.round(validation.score * 100)}%)
              </div>
            )}
            
            {/* Dirty indicator */}
            {isDirty && (
              <div className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                • Não salvo
              </div>
            )}
            
            {/* Action buttons */}
            {!readonly && (
              <div className="flex space-x-2">
                <button
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isValidating ? 'Validando...' : 'Validar'}
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
                
                {validation?.isValid && (
                  <button
                    onClick={handleGenerateTechnicalPlan}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    Gerar Plano Técnico
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Issues */}
      {validation && validation.issues.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🚨 Problemas de Validação
          </h3>
          <div className="space-y-3">
            {validation.issues.map((issue, index) => (
              <div key={index} className={`p-3 rounded-md border-l-4 ${
                issue.type === 'error' ? 'bg-red-50 border-red-400' :
                issue.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start">
                  <div className="mr-3">
                    {issue.type === 'error' ? '❌' : 
                     issue.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{issue.section}</p>
                    <p className="text-gray-700">{issue.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-6">
            <nav className="space-y-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'overview' && (
                  <OverviewSection 
                    spec={spec} 
                    onUpdate={updateSpec} 
                    readonly={readonly}
                  />
                )}
                {activeSection === 'userExperience' && (
                  <UserExperienceSection 
                    spec={spec} 
                    onUpdate={updateSpec} 
                    readonly={readonly}
                  />
                )}
                {activeSection === 'technicalBehavior' && (
                  <TechnicalBehaviorSection 
                    spec={spec} 
                    onUpdate={updateSpec} 
                    readonly={readonly}
                  />
                )}
                {activeSection === 'successCriteria' && (
                  <SuccessCriteriaSection 
                    spec={spec} 
                    onUpdate={updateSpec} 
                    readonly={readonly}
                  />
                )}
                {activeSection === 'constraints' && (
                  <ConstraintsSection 
                    spec={spec} 
                    onUpdate={updateSpec} 
                    readonly={readonly}
                  />
                )}
                {activeSection === 'metadata' && (
                  <MetadataSection 
                    spec={spec} 
                    onUpdate={updateSpec} 
                    readonly={readonly}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 OVERVIEW SECTION
const OverviewSection: React.FC<{
  spec: NaturalLanguageSpecification;
  onUpdate: (updates: Partial<NaturalLanguageSpecification>) => void;
  readonly: boolean;
}> = ({ spec, onUpdate, readonly }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        🎯 Visão Geral da Feature
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O que será construído:
            </label>
            <textarea
              value={spec.overview.what}
              onChange={(e) => onUpdate({
                overview: { ...spec.overview, what: e.target.value }
              })}
              disabled={readonly}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              placeholder="Descreva em 1-2 frases claras o que será desenvolvido..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Por que é importante:
            </label>
            <textarea
              value={spec.overview.why}
              onChange={(e) => onUpdate({
                overview: { ...spec.overview, why: e.target.value }
              })}
              disabled={readonly}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              placeholder="Explique o valor de negócio ou valor para o usuário..."
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade:
            </label>
            <select
              value={spec.overview.priority}
              onChange={(e) => onUpdate({
                overview: { ...spec.overview, priority: e.target.value as Priority }
              })}
              disabled={readonly}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            >
              <option value="low">🟢 Baixa</option>
              <option value="medium">🟡 Média</option>
              <option value="high">🔴 Alta</option>
              <option value="critical">⚫ Crítica</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complexidade:
            </label>
            <select
              value={spec.overview.complexity}
              onChange={(e) => onUpdate({
                overview: { ...spec.overview, complexity: e.target.value as Complexity }
              })}
              disabled={readonly}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
            >
              <option value="simple">🟢 Simples (1-3 dias)</option>
              <option value="medium">🟡 Média (1-2 semanas)</option>
              <option value="complex">🔴 Complexa (2-4 semanas)</option>
              <option value="enterprise">⚫ Empresarial (1+ mês)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quando precisa estar pronto:
            </label>
            <input
              type="text"
              value={spec.overview.when}
              onChange={(e) => onUpdate({
                overview: { ...spec.overview, when: e.target.value }
              })}
              disabled={readonly}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
              placeholder="Timeline e dependências..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎨 USER EXPERIENCE SECTION (Simplified for brevity)
const UserExperienceSection: React.FC<{
  spec: NaturalLanguageSpecification;
  onUpdate: (updates: Partial<NaturalLanguageSpecification>) => void;
  readonly: boolean;
}> = ({ spec, onUpdate, readonly }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        🎨 Experiência do Usuário
      </h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Objetivo principal do usuário:
        </label>
        <textarea
          value={spec.userExperience.happyPath.goal}
          onChange={(e) => onUpdate({
            userExperience: {
              ...spec.userExperience,
              happyPath: {
                ...spec.userExperience.happyPath,
                goal: e.target.value
              }
            }
          })}
          disabled={readonly}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          placeholder="O que o usuário quer alcançar..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resultado esperado:
        </label>
        <textarea
          value={spec.userExperience.happyPath.expectedOutcome}
          onChange={(e) => onUpdate({
            userExperience: {
              ...spec.userExperience,
              happyPath: {
                ...spec.userExperience.happyPath,
                expectedOutcome: e.target.value
              }
            }
          })}
          disabled={readonly}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          placeholder="O que o sistema deve entregar..."
        />
      </div>
      
      <p className="text-sm text-gray-500 italic">
        💡 Seções adicionais de UX seriam implementadas aqui (User Journey, Edge Cases, Personas)
      </p>
    </div>
  );
};

// 🔧 TECHNICAL BEHAVIOR SECTION (Simplified)
const TechnicalBehaviorSection: React.FC<{
  spec: NaturalLanguageSpecification;
  onUpdate: (updates: Partial<NaturalLanguageSpecification>) => void;
  readonly: boolean;
}> = ({ spec, onUpdate, readonly }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        🔧 Comportamento Técnico
      </h2>
      
      <p className="text-sm text-gray-500 italic">
        💡 Seções de comportamentos técnicos seriam implementadas aqui (Should/Should Not behaviors, Performance requirements, Integration points)
      </p>
    </div>
  );
};

// 📊 SUCCESS CRITERIA SECTION (Simplified)
const SuccessCriteriaSection: React.FC<{
  spec: NaturalLanguageSpecification;
  onUpdate: (updates: Partial<NaturalLanguageSpecification>) => void;
  readonly: boolean;
}> = ({ spec, onUpdate, readonly }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        📊 Critérios de Sucesso
      </h2>
      
      <p className="text-sm text-gray-500 italic">
        💡 Seções de critérios de sucesso seriam implementadas aqui (Functional/Non-functional criteria, Business metrics, User satisfaction)
      </p>
    </div>
  );
};

// 🚨 CONSTRAINTS SECTION (Simplified)
const ConstraintsSection: React.FC<{
  spec: NaturalLanguageSpecification;
  onUpdate: (updates: Partial<NaturalLanguageSpecification>) => void;
  readonly: boolean;
}> = ({ spec, onUpdate, readonly }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        🚨 Restrições e Premissas
      </h2>
      
      <p className="text-sm text-gray-500 italic">
        💡 Seções de restrições seriam implementadas aqui (Technical/Business constraints, Assumptions, Dependencies)
      </p>
    </div>
  );
};

// 📋 METADATA SECTION (Simplified)
const MetadataSection: React.FC<{
  spec: NaturalLanguageSpecification;
  onUpdate: (updates: Partial<NaturalLanguageSpecification>) => void;
  readonly: boolean;
}> = ({ spec, onUpdate, readonly }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        📋 Metadados
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Projeto:
          </label>
          <input
            type="text"
            value={spec.metadata.project}
            onChange={(e) => onUpdate({
              metadata: { ...spec.metadata, project: e.target.value }
            })}
            disabled={readonly}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Epic:
          </label>
          <input
            type="text"
            value={spec.metadata.epic}
            onChange={(e) => onUpdate({
              metadata: { ...spec.metadata, epic: e.target.value }
            })}
            disabled={readonly}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>
      </div>
    </div>
  );
};

export default NaturalLanguageSpecEditor;