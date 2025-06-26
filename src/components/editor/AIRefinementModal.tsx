import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Icons } from '../ui/Icons';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Tabs } from '../ui/Tabs';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { TextSelection, AIRefinementRequest } from '../../types';

interface AIRefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selection: TextSelection;
  onRefine: (type: AIRefinementRequest['refinementType'], instructions: string) => void;
}

export const AIRefinementModal: React.FC<AIRefinementModalProps> = ({
  isOpen,
  onClose,
  selection,
  onRefine
}) => {
  // **ESTADOS**
  const [selectedType, setSelectedType] = useState<AIRefinementRequest['refinementType']>('improve');
  const [instructions, setInstructions] = useState('');
  const [context, setContext] = useState({
    platform: 'YouTube',
    audience: 'geral',
    tone: 'casual',
    duration: 300
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTab, setCurrentTab] = useState('quick');

  // **TIPOS DE REFINAMENTO**
  const refinementTypes = [
    {
      type: 'improve' as const,
      label: 'Melhorar Geral',
      description: 'Aprimora o texto de forma geral, mantendo o sentido original',
      icon: Icons.Sparkles,
      color: 'blue'
    },
    {
      type: 'clarity' as const,
      label: 'Clareza',
      description: 'Torna o texto mais claro e fácil de entender',
      icon: Icons.Eye,
      color: 'green'
    },
    {
      type: 'engagement' as const,
      label: 'Engajamento',
      description: 'Aumenta o potencial de engajamento e interesse',
      icon: Icons.Heart,
      color: 'red'
    },
    {
      type: 'tone' as const,
      label: 'Tom',
      description: 'Ajusta o tom para o público e contexto',
      icon: Icons.Volume2,
      color: 'purple'
    },
    {
      type: 'grammar' as const,
      label: 'Gramática',
      description: 'Corrige gramática e melhora a fluência',
      icon: Icons.CheckCircle,
      color: 'emerald'
    },
    {
      type: 'style' as const,
      label: 'Estilo',
      description: 'Melhora o estilo de escrita',
      icon: Icons.PenTool,
      color: 'orange'
    },
    {
      type: 'rewrite' as const,
      label: 'Reescrever',
      description: 'Reescreve completamente mantendo a ideia principal',
      icon: Icons.RefreshCw,
      color: 'indigo'
    }
  ];

  // **PROMPTS PRÉ-DEFINIDOS**
  const quickPrompts = {
    improve: [
      'Torne mais profissional',
      'Simplifique a linguagem',
      'Adicione mais detalhes',
      'Torne mais conciso',
      'Melhore o fluxo'
    ],
    clarity: [
      'Remova ambiguidades',
      'Use palavras mais simples',
      'Organize melhor as ideias',
      'Adicione exemplos',
      'Conecte melhor as frases'
    ],
    engagement: [
      'Adicione perguntas retóricas',
      'Use linguagem mais envolvente',
      'Inclua call-to-action',
      'Torne mais emocional',
      'Adicione curiosidade'
    ],
    tone: [
      'Mais formal',
      'Mais casual',
      'Mais entusiasmado',
      'Mais autoridade',
      'Mais amigável'
    ],
    grammar: [
      'Corrigir erros',
      'Melhorar pontuação',
      'Ajustar concordância',
      'Simplificar frases',
      'Corrigir estrutura'
    ],
    style: [
      'Mais moderno',
      'Mais elegante',
      'Mais direto',
      'Mais criativo',
      'Mais técnico'
    ],
    rewrite: [
      'Abordagem diferente',
      'Mais criativo',
      'Invertir ordem',
      'Novo ângulo',
      'Surpreender'
    ]
  };

  // **PLATAFORMAS**
  const platforms = [
    { value: 'YouTube', label: 'YouTube', description: 'Vídeos longos e informativos' },
    { value: 'Instagram', label: 'Instagram', description: 'Conteúdo visual e stories' },
    { value: 'TikTok', label: 'TikTok', description: 'Vídeos curtos e virais' },
    { value: 'LinkedIn', label: 'LinkedIn', description: 'Conteúdo profissional' },
    { value: 'Podcast', label: 'Podcast', description: 'Áudio conversacional' },
    { value: 'Blog', label: 'Blog', description: 'Artigos escritos' }
  ];

  // **AUDIÊNCIA**
  const audiences = [
    { value: 'geral', label: 'Público Geral' },
    { value: 'jovem', label: 'Jovens (16-25)' },
    { value: 'adulto', label: 'Adultos (26-45)' },
    { value: 'profissional', label: 'Profissionais' },
    { value: 'especialista', label: 'Especialistas' },
    { value: 'iniciante', label: 'Iniciantes' }
  ];

  // **TONS**
  const tones = [
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'amigavel', label: 'Amigável' },
    { value: 'autoritativo', label: 'Autoritativo' },
    { value: 'entusiasmado', label: 'Entusiasmado' },
    { value: 'educativo', label: 'Educativo' },
    { value: 'inspirador', label: 'Inspirador' }
  ];

  // **HANDLERS**
  const handleQuickRefine = (type: AIRefinementRequest['refinementType']) => {
    setSelectedType(type);
    setIsProcessing(true);
    onRefine(type, instructions);
  };

  const handleAdvancedRefine = () => {
    if (!instructions.trim()) {
      return;
    }
    setIsProcessing(true);
    onRefine(selectedType, instructions);
  };

  const applyQuickPrompt = (prompt: string) => {
    setInstructions(prev => prev ? `${prev}. ${prompt}` : prompt);
  };

  const resetForm = () => {
    setSelectedType('improve');
    setInstructions('');
    setCurrentTab('quick');
  };

  // **RESET AO ABRIR**
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setIsProcessing(false);
    }
  }, [isOpen]);

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-4xl"
      title="Refinamento com IA"
    >
      <div className="space-y-6">
        {/* **TEXTO SELECIONADO** */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Texto Selecionado ({selection.selectedText.length} caracteres)
          </h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 border-l-4 border-blue-400 pl-3 italic">
            "{selection.selectedText}"
          </div>
        </div>

        {/* **TABS DE REFINAMENTO** */}
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          tabs={[
            { id: 'quick', label: 'Refinamento Rápido', icon: Icons.Zap },
            { id: 'advanced', label: 'Refinamento Avançado', icon: Icons.Settings },
            { id: 'context', label: 'Contexto', icon: Icons.Target }
          ]}
        >
          {/* **TAB REFINAMENTO RÁPIDO** */}
          <div id="quick" className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Escolha o tipo de melhoria que deseja aplicar ao texto selecionado:
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {refinementTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Button
                    key={type.type}
                    variant={selectedType === type.type ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-center text-center space-y-2"
                    onClick={() => handleQuickRefine(type.type)}
                    disabled={isProcessing}
                  >
                    <IconComponent className="w-6 h-6" />
                    <div>
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {type.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* **PROMPTS RÁPIDOS** */}
            {selectedType && quickPrompts[selectedType] && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Sugestões Rápidas para {refinementTypes.find(t => t.type === selectedType)?.label}:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts[selectedType].map((prompt, index) => (
                    <Button
                      key={`${selectedType}-${prompt}-${index}`}
                      size="sm"
                      variant="outline"
                      onClick={() => applyQuickPrompt(prompt)}
                      className="text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* **TAB REFINAMENTO AVANÇADO** */}
          <div id="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Refinamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Refinamento
                </label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as AIRefinementRequest['refinementType'])}
                  options={refinementTypes.map(type => ({
                    value: type.type,
                    label: type.label
                  }))}
                />
              </div>

              {/* Instruções Personalizadas */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instruções Específicas
                </label>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Descreva exatamente como você quer que o texto seja melhorado..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Instruções Detalhadas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instruções Detalhadas (Opcional)
              </label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Exemplo: 'Torne mais técnico para um público de desenvolvedores, inclua termos específicos da área, mantenha tom profissional mas acessível...'"
                rows={4}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Seja específico sobre o que você quer. Quanto mais detalhes, melhor será o resultado.
              </p>
            </div>

            {/* Botão de Refinar Avançado */}
            <div className="flex justify-end">
              <Button
                onClick={handleAdvancedRefine}
                disabled={isProcessing || !instructions.trim()}
                className="min-w-32"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Icons.Sparkles className="w-4 h-4 mr-2" />
                    Refinar Texto
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* **TAB CONTEXTO** */}
          <div id="context" className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure o contexto para obter sugestões mais precisas:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plataforma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plataforma
                </label>
                <Select
                  value={context.platform}
                  onValueChange={(value) => setContext(prev => ({ ...prev, platform: value }))}
                  options={platforms.map(p => ({
                    value: p.value,
                    label: p.label,
                    description: p.description
                  }))}
                />
              </div>

              {/* Público-Alvo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Público-Alvo
                </label>
                <Select
                  value={context.audience}
                  onValueChange={(value) => setContext(prev => ({ ...prev, audience: value }))}
                  options={audiences}
                />
              </div>

              {/* Tom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tom
                </label>
                <Select
                  value={context.tone}
                  onValueChange={(value) => setContext(prev => ({ ...prev, tone: value }))}
                  options={tones}
                />
              </div>

              {/* Duração */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duração (segundos)
                </label>
                <Input
                  type="number"
                  value={context.duration}
                  onChange={(e) => setContext(prev => ({ ...prev, duration: parseInt(e.target.value) || 300 }))}
                  min={30}
                  max={3600}
                  step={30}
                />
              </div>
            </div>

            {/* Preview do Contexto */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Contexto Configurado
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <div><strong>Plataforma:</strong> {platforms.find(p => p.value === context.platform)?.label}</div>
                <div><strong>Público:</strong> {audiences.find(a => a.value === context.audience)?.label}</div>
                <div><strong>Tom:</strong> {tones.find(t => t.value === context.tone)?.label}</div>
                <div><strong>Duração:</strong> {Math.floor(context.duration / 60)}:{String(context.duration % 60).padStart(2, '0')}</div>
              </div>
            </div>
          </div>
        </Tabs>

        {/* **RODAPÉ** */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <Icons.Zap className="w-3 h-3 mr-1" />
              IA Gemini
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Resultado em ~10-15 segundos
            </span>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={() => handleQuickRefine(selectedType)} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Icons.Sparkles className="w-4 h-4 mr-2" />
                  Refinar Agora
                </>
              )}
            </Button>
          </div>
        </div>

        {/* **DICAS** */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Icons.Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Dica:</strong> Para melhores resultados, seja específico nas instruções. 
              Por exemplo: "Torne mais técnico para desenvolvedores" em vez de apenas "Melhore".
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}; 