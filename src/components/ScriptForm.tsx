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
} from '../constants';
import InputField from './form/InputField';
import TextareaField from './form/TextareaField';
import { ButtonGrid } from './form/ButtonGrid';
import PlatformSelectorEnhanced from './form/PlatformSelectorEnhanced';

interface ScriptFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  initialData?: Partial<FormData>;
}

// 🎨 VISUAL OPTIONS WITH ICONS - Based on UX Study
const VISUAL_GOAL_OPTIONS = [
  { value: 'educar', label: 'Educar', icon: '🎓', description: 'Ensinar e compartilhar conhecimento' },
  { value: 'entreter', label: 'Entreter', icon: '🎭', description: 'Divertir e engajar audiência' },
  { value: 'vender', label: 'Vender', icon: '💰', description: 'Promover produtos ou serviços' },
  { value: 'inspirar', label: 'Inspirar', icon: '✨', description: 'Motivar e inspirar pessoas' },
  { value: 'informar', label: 'Informar', icon: '📰', description: 'Compartilhar notícias e fatos' },
  { value: 'engajar', label: 'Engajar', icon: '🤝', description: 'Construir comunidade e relacionamentos' }
];

const VISUAL_AUDIENCE_OPTIONS = [
  { value: 'jovens', label: 'Jovens', icon: '🧑‍🎓', description: '16-25 anos, energia e trends' },
  { value: 'adultos', label: 'Adultos', icon: '👔', description: '26-45 anos, carreira e família' },
  { value: 'profissionais', label: 'Profissionais', icon: '💼', description: 'Ambiente corporativo e negócios' },
  { value: 'pais', label: 'Pais', icon: '👨‍👩‍👧‍👦', description: 'Famílias e cuidadores' },
  { value: 'empreendedores', label: 'Empreendedores', icon: '🚀', description: 'Donos de negócio e startups' },
  { value: 'geral', label: 'Público Geral', icon: '🌍', description: 'Audiência ampla e diversa' }
];

const VISUAL_TONE_OPTIONS = [
  { value: 'casual', label: 'Casual', icon: '😊', description: 'Descontraído e amigável' },
  { value: 'profissional', label: 'Profissional', icon: '🎯', description: 'Formal e corporativo' },
  { value: 'engraçado', label: 'Engraçado', icon: '😄', description: 'Humor e diversão' },
  { value: 'inspirador', label: 'Inspirador', icon: '🌟', description: 'Motivacional e elevado' },
  { value: 'educativo', label: 'Educativo', icon: '📚', description: 'Didático e explicativo' },
  { value: 'urgente', label: 'Urgente', icon: '⚡', description: 'Direto e impactante' }
];

const VISUAL_FORMAT_OPTIONS: { [key: string]: any[] } = {
  youtube: [
    { value: 'shorts', label: 'YouTube Shorts', icon: '📱', description: 'Vídeo vertical até 60s' },
    { value: 'longo', label: 'Vídeo Longo', icon: '🎬', description: 'Conteúdo aprofundado 10-30min' },
    { value: 'tutorial', label: 'Tutorial', icon: '🛠️', description: 'Passo a passo educativo' },
    { value: 'vlog', label: 'Vlog', icon: '📹', description: 'Vida pessoal e cotidiano' }
  ],
  instagram: [
    { value: 'reels', label: 'Instagram Reels', icon: '🎵', description: 'Vídeo curto e viral' },
    { value: 'igtv', label: 'IGTV', icon: '📺', description: 'Vídeo vertical longo' },
    { value: 'stories', label: 'Stories', icon: '⭕', description: 'Conteúdo temporário 24h' },
    { value: 'feed', label: 'Feed Post', icon: '📸', description: 'Post tradicional do feed' }
  ],
  tiktok: [
    { value: 'viral', label: 'Viral', icon: '🔥', description: 'Tendência e alcance máximo' },
    { value: 'educativo', label: 'Educativo', icon: '🧠', description: 'Ensinar de forma rápida' },
    { value: 'comedia', label: 'Comédia', icon: '🎪', description: 'Humor e entretenimento' },
    { value: 'danca', label: 'Dança', icon: '💃', description: 'Coreografia e música' }
  ]
};

const ScriptForm: React.FC<ScriptFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const [formData, setFormData] = useState<FormData>({ ...INITIAL_FORM_DATA, ...initialData });
  const [formatOptions, setFormatOptions] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // 🎯 Enhanced Form Validation
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

  // Update format options when platform changes
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
    
    // Validation
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

  return (
    <div className="space-y-6">
      {/* 🎯 Enhanced Progress Indicator */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{progress.filled}</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Formulário Visual Interativo
              </span>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {progress.filled}/{progress.total} campos preenchidos
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {progress.percentage}%
            </div>
            {progress.nextRequiredField && (
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Próximo: {progress.missingFields[0]}
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="relative w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3 overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-lg"
            style={{ width: `${progress.percentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
          </div>
          {progress.percentage > 0 && (
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent to-white/30 rounded-full animate-shimmer"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          )}
        </div>
        
        {progress.percentage < 100 && (
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            💡 Interface visual: selecione os botões para preencher: {progress.missingFields.join(', ')}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 🎨 Platform Selection - Enhanced */}
        <div className="relative">
          <label className="block text-sm font-medium text-foreground mb-4">
            📱 Plataforma de Publicação <span className="text-destructive">*</span>
          </label>
          <PlatformSelectorEnhanced
            selectedPlatform={formData.platform}
            onPlatformChange={handlePlatformChange}
            disabled={isLoading}
          />
          {formData.platform && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Plataforma configurada: {formData.platform}
            </div>
          )}
        </div>

        {/* 🎨 VISUAL Format Selection */}
        {formatOptions.length > 0 && (
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-4">
              🎬 Formato do Conteúdo <span className="text-destructive">*</span>
            </label>
            <ButtonGrid
              options={formatOptions}
              value={formData.format}
              onChange={(value) => handleVisualFieldChange('format', value)}
              disabled={isLoading}
              columns={formatOptions.length <= 2 ? 2 : 3}
              size="md"
            />
            {validationErrors.format && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <span>❌</span> {validationErrors.format}
              </div>
            )}
            {formData.format && !validationErrors.format && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Formato selecionado: {formatOptions.find(opt => opt.value === formData.format)?.label}
              </div>
            )}
          </div>
        )}

        {/* 🎨 Enhanced Topic Input */}
        <div className="relative">
          <InputField
            id="videoTopic"
            label="💡 Tópico do Vídeo"
            value={formData.videoTopic}
            onChange={handleChange}
            placeholder="Ex: Como criar conteúdo viral que realmente engaja"
            disabled={isLoading}
          />
          {validationErrors.videoTopic && (
            <div className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>❌</span> {validationErrors.videoTopic}
            </div>
          )}
          {formData.videoTopic && !validationErrors.videoTopic && (
            <div className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <span>✅</span> Tópico válido ({formData.videoTopic.length} caracteres)
            </div>
          )}
        </div>

        {/* 🎨 VISUAL Goal Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-foreground mb-4">
            🎯 Objetivo do Conteúdo <span className="text-destructive">*</span>
          </label>
          <ButtonGrid
            options={VISUAL_GOAL_OPTIONS}
            value={formData.videoGoal}
            onChange={(value) => handleVisualFieldChange('videoGoal', value)}
            disabled={isLoading}
            columns={3}
            size="md"
          />
          {validationErrors.videoGoal && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>❌</span> {validationErrors.videoGoal}
            </div>
          )}
          {formData.videoGoal && !validationErrors.videoGoal && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Objetivo: {VISUAL_GOAL_OPTIONS.find(opt => opt.value === formData.videoGoal)?.label}
            </div>
          )}
        </div>

        {/* 🎨 VISUAL Audience Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-foreground mb-4">
            👥 Público-Alvo <span className="text-destructive">*</span>
          </label>
          <ButtonGrid
            options={VISUAL_AUDIENCE_OPTIONS}
            value={formData.targetAudience}
            onChange={(value) => handleVisualFieldChange('targetAudience', value)}
            disabled={isLoading}
            columns={3}
            size="md"
          />
          {validationErrors.targetAudience && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>❌</span> {validationErrors.targetAudience}
            </div>
          )}
          {formData.targetAudience && !validationErrors.targetAudience && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Público: {VISUAL_AUDIENCE_OPTIONS.find(opt => opt.value === formData.targetAudience)?.label}
            </div>
          )}
        </div>

        {/* 🎨 VISUAL Tone Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-foreground mb-4">
            🎭 Tom de Voz <span className="text-destructive">*</span>
          </label>
          <ButtonGrid
            options={VISUAL_TONE_OPTIONS}
            value={formData.toneOfVoice}
            onChange={(value) => handleVisualFieldChange('toneOfVoice', value)}
            disabled={isLoading}
            columns={3}
            size="md"
          />
          {validationErrors.toneOfVoice && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>❌</span> {validationErrors.toneOfVoice}
            </div>
          )}
          {formData.toneOfVoice && !validationErrors.toneOfVoice && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Tom: {VISUAL_TONE_OPTIONS.find(opt => opt.value === formData.toneOfVoice)?.label}
            </div>
          )}
        </div>

        {/* 🎨 Enhanced Key Points */}
        <div className="relative">
          <TextareaField
            id="keyPoints"
            label="📝 Pontos-Chave (Opcional)"
            value={formData.keyPoints}
            onChange={handleChange}
            placeholder="Liste os principais pontos, ideias ou estrutura que o roteiro deve seguir..."
            isOptional={true}
            disabled={isLoading}
          />
          {validationErrors.keyPoints && (
            <div className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <span>❌</span> {validationErrors.keyPoints}
            </div>
          )}
          {formData.keyPoints && !validationErrors.keyPoints && (
            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              📝 {formData.keyPoints.length}/500 caracteres
            </div>
          )}
        </div>

        {/* 🎨 Enhanced Visual Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isLoading || !progress.isValid}
            className={`
              relative px-8 py-4 font-bold text-lg rounded-xl shadow-lg transition-all duration-300 transform
              focus:outline-none focus:ring-4 focus:ring-offset-2 overflow-hidden
              ${isLoading
                ? 'bg-blue-500/80 text-white cursor-not-allowed scale-95'
                : progress.isValid
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-purple-500/40 focus:ring-blue-400/50 hover:scale-105 active:scale-95 cursor-pointer border-2 border-blue-400/30'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-gray-200 dark:shadow-gray-700'
              }
            `}
          >
            {/* Background Animation */}
            {progress.isValid && !isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            )}
            
            {/* Button Content */}
            <div className="relative flex items-center gap-3">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Gerando Roteiro Visual...</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  </div>
                </>
              ) : progress.isValid ? (
                <>
                  <span className="text-2xl animate-bounce">🎨</span>
                  <span>Gerar Roteiro Visual Profissional</span>
                  <span className="text-xl animate-pulse">🚀</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🎯</span>
                  <span>Complete {progress.total - progress.filled} seleção{progress.total - progress.filled > 1 ? 'ões' : ''}</span>
                  <span className="text-sm opacity-70">({progress.percentage}%)</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* 🎯 Enhanced Visual Completion Summary */}
        {progress.isValid && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🎨</span>
              </div>
              <div>
                <div className="font-semibold text-green-700 dark:text-green-300">
                  Interface Visual Completa! 
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Pronto para gerar roteiro visual profissional para {formData.platform}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ScriptForm; 