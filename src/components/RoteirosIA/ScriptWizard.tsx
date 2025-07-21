/**
 * 🧙‍♂️ SCRIPT WIZARD V9.0
 * 
 * Interface wizard de 3 passos para geração de roteiros
 * Implementa especificação "Sistema de Geração de Roteiros IA"
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification ROIA-GR-001
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Settings, Target, Download, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ScriptGeneratorEngine, ScriptConfig, GeneratedScript } from './ScriptGeneratorEngine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ScriptWizardProps {
  onComplete?: (script: GeneratedScript) => void;
  onCancel?: () => void;
  className?: string;
}

// ============================================================================
// WIZARD STEPS CONFIGURATION
// ============================================================================

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'config',
    title: 'Configuração',
    description: 'Defina o tipo, gênero e características do seu roteiro',
    icon: <Settings className="w-5 h-5" />
  },
  {
    id: 'details',
    title: 'Detalhes',
    description: 'Adicione personagens, pontos-chave e direcionamentos específicos',
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 'generate',
    title: 'Geração',
    description: 'Revise e gere seu roteiro com inteligência artificial',
    icon: <Sparkles className="w-5 h-5" />
  }
];

// ============================================================================
// SCRIPT WIZARD COMPONENT
// ============================================================================

export const ScriptWizard: React.FC<ScriptWizardProps> = ({
  onComplete,
  onCancel,
  className = ""
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [currentStep, setCurrentStep] = useState(0);
  const [scriptConfig, setScriptConfig] = useState<ScriptConfig>({
    title: '',
    genre: 'educational',
    audience: 'general',
    duration: 'medium',
    format: 'video',
    tone: 'casual',
    characters: [],
    keyPoints: []
  });
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGenerationStage, setCurrentGenerationStage] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // ============================================================================
  // VALIDATION
  // ============================================================================
  
  const validateStep = useCallback((stepIndex: number): string[] => {
    const errors: string[] = [];
    
    switch (stepIndex) {
      case 0: // Configuration step
        if (!scriptConfig.title.trim()) {
          errors.push('Título é obrigatório');
        }
        if (scriptConfig.title.length < 3) {
          errors.push('Título deve ter pelo menos 3 caracteres');
        }
        break;
        
      case 1: // Details step
        if (scriptConfig.characters && scriptConfig.characters.length > 10) {
          errors.push('Máximo de 10 personagens permitidos');
        }
        if (scriptConfig.keyPoints && scriptConfig.keyPoints.length > 8) {
          errors.push('Máximo de 8 pontos-chave permitidos');
        }
        break;
        
      case 2: // Generation step
        // No specific validation needed for generation step
        break;
    }
    
    return errors;
  }, [scriptConfig]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleNext = useCallback(() => {
    const errors = validateStep(currentStep);
    setValidationErrors(errors);
    
    if (errors.length === 0 && currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, validateStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setValidationErrors([]);
    }
  }, [currentStep]);

  const handleConfigChange = useCallback((updates: Partial<ScriptConfig>) => {
    setScriptConfig(prev => ({ ...prev, ...updates }));
    setValidationErrors([]);
  }, []);

  const handleCharacterAdd = useCallback((character: string) => {
    if (character.trim() && (!scriptConfig.characters || scriptConfig.characters.length < 10)) {
      setScriptConfig(prev => ({
        ...prev,
        characters: [...(prev.characters || []), character.trim()]
      }));
    }
  }, [scriptConfig.characters]);

  const handleCharacterRemove = useCallback((index: number) => {
    setScriptConfig(prev => ({
      ...prev,
      characters: prev.characters?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const handleKeyPointAdd = useCallback((keyPoint: string) => {
    if (keyPoint.trim() && (!scriptConfig.keyPoints || scriptConfig.keyPoints.length < 8)) {
      setScriptConfig(prev => ({
        ...prev,
        keyPoints: [...(prev.keyPoints || []), keyPoint.trim()]
      }));
    }
  }, [scriptConfig.keyPoints]);

  const handleKeyPointRemove = useCallback((index: number) => {
    setScriptConfig(prev => ({
      ...prev,
      keyPoints: prev.keyPoints?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const handleScriptGenerated = useCallback((script: GeneratedScript) => {
    setGeneratedScript(script);
    setIsGenerating(false);
    onComplete?.(script);
  }, [onComplete]);

  const handleGenerationProgress = useCallback((progress: number, stage: string) => {
    setGenerationProgress(progress);
    setCurrentGenerationStage(stage);
  }, []);

  const handleGenerationError = useCallback((error: string) => {
    setIsGenerating(false);
    setValidationErrors([error]);
  }, []);

  const handleStartGeneration = useCallback(() => {
    const errors = validateStep(2);
    if (errors.length === 0) {
      setIsGenerating(true);
      setValidationErrors([]);
    } else {
      setValidationErrors(errors);
    }
  }, [validateStep]);

  // ============================================================================
  // RENDER STEP COMPONENTS
  // ============================================================================
  
  const renderConfigurationStep = () => (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="script-title" className="block text-sm font-medium text-gray-700 mb-2">
          Título do Roteiro *
        </label>
        <input
          id="script-title"
          type="text"
          value={scriptConfig.title}
          onChange={(e) => handleConfigChange({ title: e.target.value })}
          placeholder="Ex: Tutorial de Marketing Digital"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">
          {scriptConfig.title.length}/100 caracteres
        </p>
      </div>

      {/* Genre and Audience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="script-genre" className="block text-sm font-medium text-gray-700 mb-2">
            Gênero
          </label>
          <select
            id="script-genre"
            value={scriptConfig.genre}
            onChange={(e) => handleConfigChange({ genre: e.target.value as ScriptConfig['genre'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="educational">Educativo</option>
            <option value="comedy">Comédia</option>
            <option value="drama">Drama</option>
            <option value="action">Ação</option>
            <option value="romance">Romance</option>
            <option value="documentary">Documentário</option>
          </select>
        </div>

        <div>
          <label htmlFor="script-audience" className="block text-sm font-medium text-gray-700 mb-2">
            Público-Alvo
          </label>
          <select
            id="script-audience"
            value={scriptConfig.audience}
            onChange={(e) => handleConfigChange({ audience: e.target.value as ScriptConfig['audience'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="general">Geral</option>
            <option value="children">Infantil</option>
            <option value="teens">Adolescente</option>
            <option value="adults">Adulto</option>
            <option value="seniors">Terceira Idade</option>
          </select>
        </div>
      </div>

      {/* Duration and Format */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duração
          </label>
          <select
            value={scriptConfig.duration}
            onChange={(e) => handleConfigChange({ duration: e.target.value as ScriptConfig['duration'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="short">Curto (1-3 min)</option>
            <option value="medium">Médio (5-10 min)</option>
            <option value="long">Longo (15-30 min)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Formato
          </label>
          <select
            value={scriptConfig.format}
            onChange={(e) => handleConfigChange({ format: e.target.value as ScriptConfig['format'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="video">Vídeo</option>
            <option value="podcast">Podcast</option>
            <option value="presentation">Apresentação</option>
            <option value="social-media">Redes Sociais</option>
          </select>
        </div>
      </div>

      {/* Tone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tom de Voz
        </label>
        <select
          value={scriptConfig.tone}
          onChange={(e) => handleConfigChange({ tone: e.target.value as ScriptConfig['tone'] })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="casual">Casual</option>
          <option value="formal">Formal</option>
          <option value="humorous">Humorístico</option>
          <option value="serious">Sério</option>
          <option value="inspirational">Inspiracional</option>
        </select>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      {/* Characters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Personagens (Opcional)
        </label>
        <div className="space-y-2">
          {scriptConfig.characters?.map((character, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm">
                {character}
              </span>
              <Button
                onClick={() => handleCharacterRemove(index)}
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                Remover
              </Button>
            </div>
          ))}
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nome do personagem"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  handleCharacterAdd(input.value);
                  input.value = '';
                }
              }}
            />
            <Button
              onClick={(e) => {
                const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                if (input) {
                  handleCharacterAdd(input.value);
                  input.value = '';
                }
              }}
              variant="outline"
              size="sm"
            >
              Adicionar
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {scriptConfig.characters?.length || 0}/10 personagens
        </p>
      </div>

      {/* Key Points */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pontos-Chave (Opcional)
        </label>
        <div className="space-y-2">
          {scriptConfig.keyPoints?.map((keyPoint, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm">
                {keyPoint}
              </span>
              <Button
                onClick={() => handleKeyPointRemove(index)}
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                Remover
              </Button>
            </div>
          ))}
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Explicar benefícios do produto"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  handleKeyPointAdd(input.value);
                  input.value = '';
                }
              }}
            />
            <Button
              onClick={(e) => {
                const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                if (input) {
                  handleKeyPointAdd(input.value);
                  input.value = '';
                }
              }}
              variant="outline"
              size="sm"
            >
              Adicionar
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {scriptConfig.keyPoints?.length || 0}/8 pontos-chave
        </p>
      </div>
    </div>
  );

  const renderGenerationStep = () => (
    <div className="space-y-6">
      {/* Configuration Review */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Revisão da Configuração</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><strong>Título:</strong> {scriptConfig.title}</div>
          <div><strong>Gênero:</strong> {scriptConfig.genre}</div>
          <div><strong>Público:</strong> {scriptConfig.audience}</div>
          <div><strong>Duração:</strong> {scriptConfig.duration}</div>
          <div><strong>Formato:</strong> {scriptConfig.format}</div>
          <div><strong>Tom:</strong> {scriptConfig.tone}</div>
        </div>
        
        {scriptConfig.characters && scriptConfig.characters.length > 0 && (
          <div className="mt-3">
            <strong className="text-sm">Personagens:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {scriptConfig.characters.map((char, i) => (
                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {char}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {scriptConfig.keyPoints && scriptConfig.keyPoints.length > 0 && (
          <div className="mt-3">
            <strong className="text-sm">Pontos-Chave:</strong>
            <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
              {scriptConfig.keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Generation Engine */}
      <ScriptGeneratorEngine
        config={scriptConfig}
        onScriptGenerated={handleScriptGenerated}
        onProgressUpdate={handleGenerationProgress}
        onError={handleGenerationError}
      />
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Assistente de Roteiros IA
            </h2>
            <p className="text-gray-600 mt-1">
              Crie roteiros profissionais em 3 passos simples
            </p>
          </div>
          
          {onCancel && (
            <Button onClick={onCancel} variant="outline" size="sm">
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < WIZARD_STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              <div className={`flex items-center gap-3 ${index <= currentStep ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {index < currentStep ? (
                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="hidden md:block">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs">{step.description}</div>
                </div>
              </div>
              
              {index < WIZARD_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Corrija os seguintes erros:</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Current Step Content */}
        {currentStep === 0 && renderConfigurationStep()}
        {currentStep === 1 && renderDetailsStep()}
        {currentStep === 2 && renderGenerationStep()}
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="text-sm text-gray-500">
            Passo {currentStep + 1} de {WIZARD_STEPS.length}
          </div>

          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleStartGeneration}
              disabled={isGenerating || !!generatedScript}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Gerando...' : generatedScript ? 'Concluído' : 'Gerar Roteiro'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ScriptWizard;