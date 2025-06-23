import React, { useState, useEffect } from 'react';
import { FormData } from '../types';
import {
  INITIAL_FORM_DATA,
  FORMAT_OPTIONS,
  GOAL_OPTIONS,
  AUDIENCE_OPTIONS,
  TONE_OPTIONS,
  OTHER_KEY,
} from '../constants';
import InputField from './form/InputField';
import SelectField from './form/SelectField';
import TextareaField from './form/TextareaField';
import HybridSelectField from './form/HybridSelectField';
import PlatformSelector from './form/PlatformSelector';

interface ScriptFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  initialData?: Partial<FormData>;
}

const ScriptForm: React.FC<ScriptFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const [formData, setFormData] = useState<FormData>({ ...INITIAL_FORM_DATA, ...initialData });
  const [formatOptions, setFormatOptions] = useState<string[]>([]);

  useEffect(() => {
    if (formData.platform && FORMAT_OPTIONS[formData.platform]) {
      setFormatOptions(FORMAT_OPTIONS[formData.platform]);
    } else {
      setFormatOptions([]);
    }
  }, [formData.platform]);

  const handlePlatformChange = (platform: 'YouTube' | 'Instagram' | 'TikTok' | '') => {
    setFormData((prev) => ({
      ...prev,
      platform,
      format: '', // Reset format when platform changes
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleHybridChange = (
    field: 'targetAudience' | 'toneOfVoice',
    selectValue: string,
    textValue?: string
  ) => {
    const customField = field === 'targetAudience' ? 'customAudience' : 'customTone';
    setFormData((prev) => ({
      ...prev,
      [field]: selectValue,
      [customField]: textValue !== undefined ? textValue : prev[customField],
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PlatformSelector
        selectedPlatform={formData.platform}
        onPlatformChange={handlePlatformChange}
        disabled={isLoading}
      />

      <SelectField
        id="format"
        label="Formato"
        value={formData.format}
        onChange={handleChange}
        options={formatOptions}
        disabled={!formData.platform || isLoading}
      />

      <InputField
        id="videoTopic"
        label="Tópico do Vídeo"
        value={formData.videoTopic}
        onChange={handleChange}
        placeholder="Ex: Como criar um roteiro de vídeo viral"
        disabled={isLoading}
      />

      <SelectField
        id="videoGoal"
        label="Objetivo do Vídeo"
        value={formData.videoGoal}
        onChange={handleChange}
        options={GOAL_OPTIONS}
        disabled={isLoading}
      />

      <HybridSelectField
        id="targetAudience"
        label="Público-Alvo"
        selectValue={formData.targetAudience}
        onSelectChange={(e) => handleHybridChange('targetAudience', e.target.value)}
        textValue={formData.customAudience}
        onTextChange={(e) => handleHybridChange('targetAudience', formData.targetAudience, e.target.value)}
        options={AUDIENCE_OPTIONS}
        disabled={isLoading}
      />

      <HybridSelectField
        id="toneOfVoice"
        label="Tom de Voz"
        selectValue={formData.toneOfVoice}
        onSelectChange={(e) => handleHybridChange('toneOfVoice', e.target.value)}
        textValue={formData.customTone}
        onTextChange={(e) => handleHybridChange('toneOfVoice', formData.toneOfVoice, e.target.value)}
        options={TONE_OPTIONS}
        disabled={isLoading}
      />

      <TextareaField
        id="keyPoints"
        label="Pontos-Chave"
        value={formData.keyPoints}
        onChange={handleChange}
        placeholder="Opcional: Liste os principais pontos, ideias ou estrutura que o roteiro deve seguir."
        isOptional={true}
        disabled={isLoading}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Gerando Roteiro...' : 'Gerar Roteiro'}
        </button>
      </div>
    </form>
  );
};

export default ScriptForm; 