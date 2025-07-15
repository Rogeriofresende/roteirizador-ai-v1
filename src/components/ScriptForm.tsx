/**
 * 📝 SCRIPT FORM - V7.5 Enhanced Professional Form Interface
 * Sistema completo de formulário de script seguindo metodologia V7.5 Enhanced
 * Maintaining all existing functionality with professional interface
 * 
 * Features: Progress Tracking + Validation + Platform Integration + Visual Options
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FormData, SelectOption } from '../types';
import {
  INITIAL_FORM_DATA,
  FORMAT_OPTIONS,
  GOAL_OPTIONS,
  AUDIENCE_OPTIONS,
  TONE_OPTIONS,
  OTHER_KEY,
  getPlatformValue,
  getPlatformLabel,
  PLATFORM_OPTIONS,
} from '../constants';

// V7.5 Enhanced Design System Imports
import { Layout } from '../design-system/components/Layout';
import { Button } from '../design-system/components/Button';

// V7.5 Enhanced Icons
import { 
  GraduationCap,
  Drama,
  DollarSign,
  Sparkles as SparklesIcon,
  Newspaper,
  HandHeart,
  User,
  Briefcase,
  Users,
  Rocket,
  Globe,
  Smile,
  Target,
  Laugh,
  Star,
  BookOpen,
  Zap,
  Smartphone,
  Film,
  Wrench,
  Video,
  Music,
  Tv,
  Camera,
  Instagram,
  Flame,
  Brain,
  Gamepad2,
  Music as DanceIcon,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  Settings
} from 'lucide-react';

// Legacy Form Components (maintaining compatibility)
import InputField from './form/InputField';
import TextareaField from './form/TextareaField';
import { ButtonGrid } from './form/ButtonGrid';
import PlatformSelectorEnhanced from './form/PlatformSelectorEnhanced';
import { getPlatformColor } from '../utils/platformStyles';
import { SelectField } from './form/SelectField';
import HybridSelectField from './form/HybridSelectField';
import { PlatformSelector } from './form/PlatformSelector';

interface ScriptFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  initialData?: Partial<FormData>;
}

// ============================================================================
// V7.5 ENHANCED VISUAL OPTIONS WITH LUCIDE ICONS
// ============================================================================

const VISUAL_GOAL_OPTIONS = [
  { value: 'educar', label: 'Educar', icon: GraduationCap, description: 'Ensinar e compartilhar conhecimento' },
  { value: 'entreter', label: 'Entreter', icon: Drama, description: 'Divertir e engajar audiência' },
  { value: 'vender', label: 'Vender', icon: DollarSign, description: 'Promover produtos ou serviços' },
  { value: 'inspirar', label: 'Inspirar', icon: SparklesIcon, description: 'Motivar e inspirar pessoas' },
  { value: 'informar', label: 'Informar', icon: Newspaper, description: 'Compartilhar notícias e fatos' },
  { value: 'engajar', label: 'Engajar', icon: HandHeart, description: 'Construir comunidade e relacionamentos' }
];

const VISUAL_AUDIENCE_OPTIONS = [
  { value: 'jovens', label: 'Jovens', icon: User, description: '16-25 anos, energia e trends' },
  { value: 'adultos', label: 'Adultos', icon: Briefcase, description: '26-45 anos, carreira e família' },
  { value: 'profissionais', label: 'Profissionais', icon: Briefcase, description: 'Ambiente corporativo e negócios' },
  { value: 'pais', label: 'Pais', icon: Users, description: 'Famílias e cuidadores' },
  { value: 'empreendedores', label: 'Empreendedores', icon: Rocket, description: 'Donos de negócio e startups' },
  { value: 'geral', label: 'Público Geral', icon: Globe, description: 'Audiência ampla e diversa' }
];

const VISUAL_TONE_OPTIONS = [
  { value: 'casual', label: 'Casual', icon: Smile, description: 'Descontraído e amigável' },
  { value: 'profissional', label: 'Profissional', icon: Target, description: 'Formal e corporativo' },
  { value: 'engraçado', label: 'Engraçado', icon: Laugh, description: 'Humor e diversão' },
  { value: 'inspirador', label: 'Inspirador', icon: Star, description: 'Motivacional e elevado' },
  { value: 'educativo', label: 'Educativo', icon: BookOpen, description: 'Didático e explicativo' },
  { value: 'urgente', label: 'Urgente', icon: Zap, description: 'Direto e impactante' }
];

const VISUAL_FORMAT_OPTIONS: { [key: string]: unknown[] } = {
  youtube: [
    { value: 'shorts', label: 'YouTube Shorts', icon: Smartphone, description: 'Vídeo vertical até 60s' },
    { value: 'longo', label: 'Vídeo Longo', icon: Film, description: 'Conteúdo aprofundado 10-30min' },
    { value: 'tutorial', label: 'Tutorial', icon: Wrench, description: 'Passo a passo educativo' },
    { value: 'vlog', label: 'Vlog', icon: Video, description: 'Vida pessoal e cotidiano' }
  ],
  instagram: [
    { value: 'reels', label: 'Instagram Reels', icon: Music, description: 'Vídeo curto e viral' },
    { value: 'igtv', label: 'IGTV', icon: Tv, description: 'Vídeo vertical longo' },
    { value: 'stories', label: 'Stories', icon: Camera, description: 'Conteúdo temporário 24h' },
    { value: 'feed', label: 'Feed Post', icon: Instagram, description: 'Post tradicional do feed' }
  ],
  tiktok: [
    { value: 'viral', label: 'Viral', icon: Flame, description: 'Tendência e alcance máximo' },
    { value: 'educativo', label: 'Educativo', icon: Brain, description: 'Ensinar de forma rápida' },
    { value: 'comedia', label: 'Comédia', icon: Gamepad2, description: 'Humor e entretenimento' },
    { value: 'danca', label: 'Dança', icon: DanceIcon, description: 'Coreografia e música' }
  ]
};

// ============================================================================
// MAIN COMPONENT - V7.5 ENHANCED
// ============================================================================

const ScriptForm: React.FC<ScriptFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const [formData, setFormData] = useState<FormData>({ ...INITIAL_FORM_DATA, ...initialData });
  const [formatOptions, setFormatOptions] = useState<unknown[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Enhanced Form Validation (maintained functionality)
  const getFormProgress = useCallback(() => {
    const requiredFields = [
      { field: 'platform', value: formData.platform, label: 'Plataforma' },
      { field: 'videoTopic', value: formData.videoTopic?.trim(), label: 'Tópico' },
      { field: 'videoGoal', value: formData.videoGoal, label: 'Objetivo' },
      { field: 'targetAudience', value: formData.targetAudience, label: 'Público-Alvo' },
      { field: 'toneOfVoice', value: formData.toneOfVoice, label: 'Tom de Voz' }
    ];
    
    // Add format if required by platform
    const platformValue = getPlatformValue(formData.platform);
    if (platformValue && formatOptions.length > 0) {
      requiredFields.push({ field: 'format', value: formData.format, label: 'Formato' });
    }
    
    const filledFields = requiredFields.filter(({ value }) => value).length;
    const totalFields = requiredFields.length;
    const missingFields = requiredFields.filter(({ value }) => !value);
    
    return {
      filled: filledFields,
      total: totalFields,
      isValid: filledFields === totalFields,
      percentage: Math.round((filledFields / totalFields) * 100),
      missingFields: missingFields.map(f => f.label),
      nextRequiredField: missingFields[0]?.field
    };
  }, [formData, formatOptions]);

  const progress = getFormProgress();

  // Update format options when platform changes (maintained functionality)
  useEffect(() => {
    if (formData.platform) {
      const platformValue = getPlatformValue(formData.platform);
      if (platformValue && VISUAL_FORMAT_OPTIONS[platformValue]) {
        setFormatOptions(VISUAL_FORMAT_OPTIONS[platformValue]);
        // Reset format when platform changes
        if (formData.format && !VISUAL_FORMAT_OPTIONS[platformValue].find(opt => opt.value === formData.format)) {
          setFormData(prev => ({ ...prev, format: '' }));
        }
      } else {
        setFormatOptions([]);
        setFormData(prev => ({ ...prev, format: '' }));
      }
    } else {
      setFormatOptions([]);
      setFormData(prev => ({ ...prev, format: '' }));
    }
  }, [formData.platform]);

  // Event handlers (maintained functionality)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePlatformChange = (platform: string) => {
    setFormData(prev => ({ ...prev, platform, format: '' })); // Reset format when platform changes
  };

  const handleVisualFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation (maintained functionality)
    const errors: { [key: string]: string } = {};
    
    if (!formData.videoTopic?.trim()) {
      errors.videoTopic = 'Tópico é obrigatório';
    } else if (formData.videoTopic.trim().length < 5) {
      errors.videoTopic = 'Tópico deve ter pelo menos 5 caracteres';
    }

    if (!formData.platform) errors.platform = 'Plataforma é obrigatória';
    if (!formData.videoGoal) errors.videoGoal = 'Objetivo é obrigatório';
    if (!formData.targetAudience) errors.targetAudience = 'Público-alvo é obrigatório';
    if (!formData.toneOfVoice) errors.toneOfVoice = 'Tom de voz é obrigatório';
    
    // Format validation if options are available
    if (formatOptions.length > 0 && !formData.format) {
      errors.format = 'Formato é obrigatório para esta plataforma';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    onSubmit(formData);
  };

  // V7.5 Enhanced Visual Option Component
  const VisualOptionGrid: React.FC<{
    options: any[];
    selectedValue: string;
    onSelect: (value: string) => void;
    cols?: number;
  }> = ({ options, selectedValue, onSelect, cols = 2 }) => (
    <Layout.Grid cols={cols} gap="md" className="w-full">
      {options.map((option) => {
        const IconComponent = option.icon;
        const isSelected = selectedValue === option.value;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              isSelected
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSelected ? 'bg-primary-500' : 'bg-neutral-100'
              }`}>
                <IconComponent className={`w-4 h-4 ${
                  isSelected ? 'text-white' : 'text-neutral-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <Layout.Text variant="body" className={`font-medium ${
                  isSelected ? 'text-primary-700' : 'text-neutral-900'
                }`}>
                  {option.label}
                </Layout.Text>
                <Layout.Text variant="bodySmall" color="muted" className="mt-1">
                  {option.description}
                </Layout.Text>
              </div>
            </div>
          </button>
        );
      })}
    </Layout.Grid>
  );

  // ============================================================================
  // RENDER - V7.5 ENHANCED
  // ============================================================================

  return (
    <Layout.Section spacing="comfortable" maxWidth="container">
      
      {/* V7.5 Enhanced Progress Indicator */}
      <Layout.Card variant="outlined" padding="lg" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">{progress.filled}</span>
            </div>
            <div>
              <Layout.Heading level={4} className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                Formulário de Script
              </Layout.Heading>
              <Layout.Text variant="bodySmall" color="muted">
                {progress.filled}/{progress.total} campos preenchidos
              </Layout.Text>
            </div>
          </div>
          
          <div className="text-right">
            <Layout.Text variant="heading" className="text-2xl font-bold text-primary-700">
              {progress.percentage}%
            </Layout.Text>
            {progress.nextRequiredField && (
              <Layout.Text variant="bodySmall" color="muted">
                Próximo: {progress.missingFields[0]}
              </Layout.Text>
            )}
          </div>
        </div>
        
        {/* V7.5 Enhanced Progress Bar */}
        <div className="w-full bg-neutral-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        
        {progress.isValid && (
          <div className="mt-3 flex items-center gap-2 text-success-600">
            <CheckCircle2 className="w-4 h-4" />
            <Layout.Text variant="bodySmall" color="success">
              Formulário completo! Pronto para gerar script.
            </Layout.Text>
          </div>
        )}
      </Layout.Card>

      {/* V7.5 Enhanced Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Platform Selection - V7.5 Enhanced */}
        <Layout.Card variant="elevated" padding="lg">
          <Layout.Heading level={4} className="mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary-600" />
            Plataforma de Publicação
            <span className="text-error-500">*</span>
          </Layout.Heading>
          
          <PlatformSelectorEnhanced
            selectedPlatform={formData.platform}
            onPlatformChange={handlePlatformChange}
            disabled={isLoading}
          />
          
          {formData.platform && (
            <div className="mt-3 flex items-center gap-2 text-success-600">
              <CheckCircle2 className="w-4 h-4" />
              <Layout.Text variant="bodySmall" color="success">
                Plataforma configurada: {formData.platform}
              </Layout.Text>
            </div>
          )}
          
          {validationErrors.platform && (
            <div className="mt-2 flex items-center gap-2 text-error-600">
              <AlertCircle className="w-4 h-4" />
              <Layout.Text variant="bodySmall" color="error">
                {validationErrors.platform}
              </Layout.Text>
            </div>
          )}
        </Layout.Card>

        {/* Topic Input - V7.5 Enhanced */}
        <Layout.Card variant="elevated" padding="lg">
          <Layout.Heading level={4} className="mb-4">
            Tópico do Roteiro
            <span className="text-error-500 ml-1">*</span>
          </Layout.Heading>
          
          <InputField
            label=""
            name="videoTopic"
            type="text"
            placeholder="Ex: Como fazer pão caseiro, Dicas de marketing digital..."
            value={formData.videoTopic || ''}
            onChange={handleChange}
            error={validationErrors.videoTopic}
            required
          />
        </Layout.Card>

        {/* Goal Selection - V7.5 Enhanced */}
        <Layout.Card variant="elevated" padding="lg">
          <Layout.Heading level={4} className="mb-4">
            Objetivo do Vídeo
            <span className="text-error-500 ml-1">*</span>
          </Layout.Heading>
          
          <VisualOptionGrid
            options={VISUAL_GOAL_OPTIONS}
            selectedValue={formData.videoGoal || ''}
            onSelect={(value) => handleVisualFieldChange('videoGoal', value)}
            cols={2}
          />
          
          {validationErrors.videoGoal && (
            <div className="mt-3 flex items-center gap-2 text-error-600">
              <AlertCircle className="w-4 h-4" />
              <Layout.Text variant="bodySmall" color="error">
                {validationErrors.videoGoal}
              </Layout.Text>
            </div>
          )}
        </Layout.Card>

        {/* Audience Selection - V7.5 Enhanced */}
        <Layout.Card variant="elevated" padding="lg">
          <Layout.Heading level={4} className="mb-4">
            Público-Alvo
            <span className="text-error-500 ml-1">*</span>
          </Layout.Heading>
          
          <VisualOptionGrid
            options={VISUAL_AUDIENCE_OPTIONS}
            selectedValue={formData.targetAudience || ''}
            onSelect={(value) => handleVisualFieldChange('targetAudience', value)}
            cols={2}
          />
          
          {validationErrors.targetAudience && (
            <div className="mt-3 flex items-center gap-2 text-error-600">
              <AlertCircle className="w-4 h-4" />
              <Layout.Text variant="bodySmall" color="error">
                {validationErrors.targetAudience}
              </Layout.Text>
            </div>
          )}
        </Layout.Card>

        {/* Tone Selection - V7.5 Enhanced */}
        <Layout.Card variant="elevated" padding="lg">
          <Layout.Heading level={4} className="mb-4">
            Tom de Voz
            <span className="text-error-500 ml-1">*</span>
          </Layout.Heading>
          
          <VisualOptionGrid
            options={VISUAL_TONE_OPTIONS}
            selectedValue={formData.toneOfVoice || ''}
            onSelect={(value) => handleVisualFieldChange('toneOfVoice', value)}
            cols={2}
          />
          
          {validationErrors.toneOfVoice && (
            <div className="mt-3 flex items-center gap-2 text-error-600">
              <AlertCircle className="w-4 h-4" />
              <Layout.Text variant="bodySmall" color="error">
                {validationErrors.toneOfVoice}
              </Layout.Text>
            </div>
          )}
        </Layout.Card>

        {/* Format Selection - V7.5 Enhanced (conditional) */}
        {formatOptions.length > 0 && (
          <Layout.Card variant="elevated" padding="lg">
            <Layout.Heading level={4} className="mb-4">
              Formato do Vídeo
              <span className="text-error-500 ml-1">*</span>
            </Layout.Heading>
            
            <VisualOptionGrid
              options={formatOptions}
              selectedValue={formData.format || ''}
              onSelect={(value) => handleVisualFieldChange('format', value)}
              cols={2}
            />
            
            {validationErrors.format && (
              <div className="mt-3 flex items-center gap-2 text-error-600">
                <AlertCircle className="w-4 h-4" />
                <Layout.Text variant="bodySmall" color="error">
                  {validationErrors.format}
                </Layout.Text>
              </div>
            )}
          </Layout.Card>
        )}

        {/* Additional Context - V7.5 Enhanced */}
        <Layout.Card variant="outlined" padding="lg">
          <Layout.Heading level={4} className="mb-4">
            Contexto Adicional (Opcional)
          </Layout.Heading>
          
          <TextareaField
            label=""
            name="additionalContext"
            placeholder="Adicione qualquer informação extra que pode ajudar na criação do roteiro..."
            value={formData.additionalContext || ''}
            onChange={handleChange}
            rows={4}
          />
        </Layout.Card>

        {/* V7.5 Enhanced Submit Button */}
        <Layout.Card variant="elevated" padding="lg">
          <Button
            type="submit"
            disabled={isLoading || !progress.isValid}
            className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Gerando Script...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Gerar Roteiro Profissional</span>
              </>
            )}
          </Button>
          
          {!progress.isValid && (
            <Layout.Text variant="bodySmall" color="muted" className="text-center mt-3">
              Complete todos os campos obrigatórios para gerar o script
            </Layout.Text>
          )}
        </Layout.Card>

      </form>
    </Layout.Section>
  );
};

export default ScriptForm; 