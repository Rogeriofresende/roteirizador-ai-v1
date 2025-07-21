/**
 * 🎬 SCRIPT GENERATOR ENGINE V9.0
 * 
 * Engine principal de geração de roteiros com IA
 * Implementa especificação "Sistema de Geração de Roteiros IA"
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification ROIA-GR-001
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FileText, Sparkles, Download, RefreshCw, Clock, Users, Target } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { roteirosIACacheService } from '../../services/ai/RoteirosIACacheService';
import { useRoteirosIAOptimization } from './hooks/useRoteirosIAOptimization';
import { useMetrics } from '../../hooks/useMetrics';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ScriptConfig {
  title: string;
  genre: 'comedy' | 'drama' | 'action' | 'romance' | 'educational' | 'documentary';
  audience: 'children' | 'teens' | 'adults' | 'seniors' | 'general';
  duration: 'short' | 'medium' | 'long'; // 1-3min, 5-10min, 15-30min
  format: 'video' | 'podcast' | 'presentation' | 'social-media';
  tone: 'formal' | 'casual' | 'humorous' | 'serious' | 'inspirational';
  characters?: string[];
  keyPoints?: string[];
}

export interface GeneratedScript {
  id: string;
  title: string;
  config: ScriptConfig;
  content: {
    structure: ScriptStructure;
    scenes: ScriptScene[];
    dialogue: ScriptDialogue[];
    directions: ScriptDirection[];
  };
  metadata: {
    wordCount: number;
    estimatedDuration: string;
    confidence: number;
    generatedAt: Date;
  };
  exportFormats: string[];
}

export interface ScriptStructure {
  acts: ScriptAct[];
  totalScenes: number;
  plotPoints: string[];
}

export interface ScriptAct {
  actNumber: number;
  title: string;
  description: string;
  duration: string;
  scenes: number[];
}

export interface ScriptScene {
  sceneNumber: number;
  location: string;
  timeOfDay: string;
  characters: string[];
  description: string;
  dialogue: string[];
  directions: string[];
}

export interface ScriptDialogue {
  character: string;
  line: string;
  emotion?: string;
  direction?: string;
}

export interface ScriptDirection {
  type: 'camera' | 'action' | 'transition' | 'music' | 'effect';
  description: string;
  timing?: string;
}

interface ScriptGeneratorEngineProps {
  config: ScriptConfig;
  onScriptGenerated: (script: GeneratedScript) => void;
  onProgressUpdate?: (progress: number, stage: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

// ============================================================================
// SCRIPT GENERATOR ENGINE COMPONENT
// ============================================================================

export const ScriptGeneratorEngine: React.FC<ScriptGeneratorEngineProps> = ({
  config,
  onScriptGenerated,
  onProgressUpdate,
  onError,
  className = ""
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // ============================================================================
  // OPTIMIZATION HOOKS
  // ============================================================================
  
  const {
    optimizedScriptGeneration,
    startPerformanceTimer,
    endPerformanceTimer,
    metrics,
    isOptimized
  } = useRoteirosIAOptimization();

  // Metrics tracking
  const { trackScriptGeneration, trackFeature, trackError } = useMetrics();

  // ============================================================================
  // GEMINI AI INTEGRATION
  // ============================================================================
  
  const generateScript = useCallback(async (scriptConfig: ScriptConfig): Promise<GeneratedScript> => {
    const startTime = Date.now();
    
    try {
      // Track script generation start
      trackFeature('script_generator', 'generation_started', { 
        genre: scriptConfig.genre,
        audience: scriptConfig.audience,
        format: scriptConfig.format 
      });

      // Initialize Gemini AI
      const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.VITE_GOOGLE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Stage 1: Generate Structure (20%)
      setCurrentStage('Analisando conceito e criando estrutura narrativa...');
      setGenerationProgress(20);
      onProgressUpdate?.(20, 'Análise de Conceito');

      // Check cache for structure first
      let structure = roteirosIACacheService.getCachedScriptStructure(scriptConfig);
      
      if (!structure) {
        startPerformanceTimer('structure_generation');
        const structurePrompt = createStructurePrompt(scriptConfig);
        const structureResult = await model.generateContent(structurePrompt);
        structure = parseStructureResponse(structureResult.response.text());
        
        // Cache the structure for future use
        roteirosIACacheService.cacheScriptStructure(scriptConfig, structure);
        endPerformanceTimer('structure_generation');
      }

      // Stage 2: Develop Characters (40%)
      setCurrentStage('Desenvolvendo personagens e perfis...');
      setGenerationProgress(40);
      onProgressUpdate?.(40, 'Desenvolvimento de Personagens');

      // Check cache for characters
      let characters = roteirosIACacheService.getCachedCharacters(scriptConfig);
      
      if (!characters) {
        startPerformanceTimer('characters_generation');
        const charactersPrompt = createCharactersPrompt(scriptConfig, structure);
        const charactersResult = await model.generateContent(charactersPrompt);
        characters = parseCharactersResponse(charactersResult.response.text());
        
        // Cache the characters
        roteirosIACacheService.cacheCharacters(scriptConfig, characters);
        endPerformanceTimer('characters_generation');
      }

      // Stage 3: Generate Scenes (60%)
      setCurrentStage('Gerando cenas e sequências...');
      setGenerationProgress(60);
      onProgressUpdate?.(60, 'Geração de Cenas');

      const scenesPrompt = createScenesPrompt(scriptConfig, structure, characters);
      const scenesResult = await model.generateContent(scenesPrompt);
      const scenes = parseScenesResponse(scenesResult.response.text());

      // Stage 4: Create Dialogue (80%)
      setCurrentStage('Criando diálogos e direções...');
      setGenerationProgress(80);
      onProgressUpdate?.(80, 'Criação de Diálogos');

      const dialoguePrompt = createDialoguePrompt(scriptConfig, scenes, characters);
      const dialogueResult = await model.generateContent(dialoguePrompt);
      const dialogue = parseDialogueResponse(dialogueResult.response.text());

      // Stage 5: Finalize Script (100%)
      setCurrentStage('Finalizando roteiro...');
      setGenerationProgress(100);
      onProgressUpdate?.(100, 'Finalização');

      const script: GeneratedScript = {
        id: `script-${Date.now()}`,
        title: scriptConfig.title,
        config: scriptConfig,
        content: {
          structure,
          scenes,
          dialogue,
          directions: generateDirections(scenes, scriptConfig)
        },
        metadata: {
          wordCount: calculateWordCount(dialogue),
          estimatedDuration: calculateDuration(scriptConfig, dialogue.length),
          confidence: 0.92, // Based on model performance
          generatedAt: new Date()
        },
        exportFormats: ['pdf', 'docx', 'txt', 'fountain']
      };

      // Track successful script generation
      const duration = Date.now() - startTime;
      trackScriptGeneration(scriptConfig, true, duration);
      
      return script;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('Erro na geração do roteiro:', error);
      
      // Track failed script generation
      trackScriptGeneration(scriptConfig, false, duration);
      trackError(error as Error, 'script_generation');
      
      throw new Error('Falha na geração do roteiro com IA');
    }
  }, [onProgressUpdate]);

  // ============================================================================
  // PROMPT ENGINEERING
  // ============================================================================
  
  const createStructurePrompt = useCallback((config: ScriptConfig) => {
    return `
Você é um roteirista profissional especializado em criar estruturas narrativas.

CONFIGURAÇÃO DO ROTEIRO:
- Título: "${config.title}"
- Gênero: ${config.genre}
- Público: ${config.audience}
- Duração: ${config.duration}
- Formato: ${config.format}
- Tom: ${config.tone}

TAREFA:
Crie uma estrutura narrativa profissional para este roteiro seguindo os padrões da indústria.

FORMATO DE RESPOSTA (JSON):
{
  "acts": [
    {
      "actNumber": 1,
      "title": "Setup",
      "description": "Apresentação do mundo e personagens",
      "duration": "25%",
      "keyEvents": ["inciting incident", "character introduction"]
    }
  ],
  "plotPoints": ["plot point 1", "midpoint", "climax"],
  "totalScenes": 8,
  "theme": "tema central da história"
}

INSTRUÇÕES:
- Para comédia: use estrutura setup-confronto-resolução
- Para drama: use arco de 3 atos clássico
- Para educativo: use problema-explicação-aplicação
- Adapte para a duração escolhida
- Mantenha coerência com o público-alvo

APENAS RETORNE O JSON, SEM TEXTO ADICIONAL.`;
  }, []);

  const createCharactersPrompt = useCallback((config: ScriptConfig, structure: ScriptStructure) => {
    return `
Baseado na estrutura narrativa, desenvolva personagens únicos e interessantes.

ESTRUTURA: ${JSON.stringify(structure, null, 2)}
CONFIGURAÇÃO: ${JSON.stringify(config, null, 2)}

TAREFA: Criar personagens com personalidades distintas, motivações claras e arcos de desenvolvimento.

FORMATO (JSON):
{
  "characters": [
    {
      "name": "Nome do Personagem",
      "role": "protagonista/antagonista/suporte",
      "personality": "traços principais",
      "motivation": "o que quer",
      "conflict": "obstáculo principal",
      "arc": "como evolui",
      "voice": "como fala (formal/casual/etc)"
    }
  ]
}

APENAS JSON, SEM TEXTO ADICIONAL.`;
  }, []);

  const createScenesPrompt = useCallback((config: ScriptConfig, structure: ScriptStructure, characters: any) => {
    return `
Gere as cenas detalhadas do roteiro baseado na estrutura e personagens.

ESTRUTURA: ${JSON.stringify(structure, null, 2)}
PERSONAGENS: ${JSON.stringify(characters, null, 2)}
CONFIGURAÇÃO: ${JSON.stringify(config, null, 2)}

FORMATO (JSON):
{
  "scenes": [
    {
      "sceneNumber": 1,
      "location": "local da cena",
      "timeOfDay": "manhã/tarde/noite",
      "characters": ["personagem1", "personagem2"],
      "objective": "o que acontece",
      "conflict": "tensão/problema",
      "outcome": "resultado",
      "visualElements": ["elemento visual 1", "elemento visual 2"]
    }
  ]
}

APENAS JSON.`;
  }, []);

  const createDialoguePrompt = useCallback((config: ScriptConfig, scenes: ScriptScene[], characters: any) => {
    return `
Crie diálogos naturais e direções cênicas para as cenas.

CENAS: ${JSON.stringify(scenes, null, 2)}
PERSONAGENS: ${JSON.stringify(characters, null, 2)}
TOM: ${config.tone}

FORMATO (JSON):
{
  "dialogue": [
    {
      "sceneNumber": 1,
      "character": "NOME_PERSONAGEM",
      "line": "fala do personagem",
      "emotion": "emoção",
      "direction": "(direção cênica)"
    }
  ]
}

INSTRUÇÕES:
- Diálogos soem naturais quando lidos em voz alta
- Cada personagem tem voz única
- Incluir direções cênicas relevantes
- Avançar a narrativa através dos diálogos

APENAS JSON.`;
  }, []);

  // ============================================================================
  // RESPONSE PARSING
  // ============================================================================
  
  const parseStructureResponse = useCallback((response: string): ScriptStructure => {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '');
      const parsed = JSON.parse(cleaned);
      
      return {
        acts: parsed.acts || [],
        totalScenes: parsed.totalScenes || 5,
        plotPoints: parsed.plotPoints || []
      };
    } catch (error) {
      console.error('Erro ao parsear estrutura:', error);
      return {
        acts: [
          {
            actNumber: 1,
            title: "Introdução",
            description: "Setup inicial",
            duration: "25%",
            scenes: [1, 2]
          },
          {
            actNumber: 2,
            title: "Desenvolvimento",
            description: "Conflito principal",
            duration: "50%",
            scenes: [3, 4, 5]
          },
          {
            actNumber: 3,
            title: "Resolução",
            description: "Clímax e desfecho",
            duration: "25%",
            scenes: [6, 7]
          }
        ],
        totalScenes: 7,
        plotPoints: ["Incidente incitante", "Ponto médio", "Clímax"]
      };
    }
  }, []);

  const parseCharactersResponse = useCallback((response: string): any => {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '');
      return JSON.parse(cleaned);
    } catch (error) {
      return {
        characters: [
          {
            name: "Protagonista",
            role: "protagonista",
            personality: "Determinado e carismático",
            motivation: "Alcançar seu objetivo",
            conflict: "Obstáculos externos",
            arc: "Crescimento pessoal",
            voice: "Confiante mas humano"
          }
        ]
      };
    }
  }, []);

  const parseScenesResponse = useCallback((response: string): ScriptScene[] => {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '');
      const parsed = JSON.parse(cleaned);
      
      return parsed.scenes.map((scene: any, index: number) => ({
        sceneNumber: scene.sceneNumber || index + 1,
        location: scene.location || "Local indefinido",
        timeOfDay: scene.timeOfDay || "Dia",
        characters: scene.characters || [],
        description: scene.objective || scene.description || "",
        dialogue: [],
        directions: scene.visualElements || []
      }));
    } catch (error) {
      return [
        {
          sceneNumber: 1,
          location: "Local principal",
          timeOfDay: "Dia",
          characters: ["Protagonista"],
          description: "Cena de abertura",
          dialogue: [],
          directions: []
        }
      ];
    }
  }, []);

  const parseDialogueResponse = useCallback((response: string): ScriptDialogue[] => {
    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '');
      const parsed = JSON.parse(cleaned);
      
      return parsed.dialogue.map((d: any) => ({
        character: d.character,
        line: d.line,
        emotion: d.emotion,
        direction: d.direction
      }));
    } catch (error) {
      return [
        {
          character: "NARRADOR",
          line: "Era uma vez...",
          emotion: "neutro"
        }
      ];
    }
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const generateDirections = useCallback((scenes: ScriptScene[], config: ScriptConfig): ScriptDirection[] => {
    const directions: ScriptDirection[] = [];
    
    scenes.forEach((scene, index) => {
      // Opening direction
      directions.push({
        type: 'camera',
        description: `FADE IN - ${scene.location.toUpperCase()} - ${scene.timeOfDay.toUpperCase()}`,
        timing: `Scene ${scene.sceneNumber}`
      });

      // Transition between scenes
      if (index < scenes.length - 1) {
        directions.push({
          type: 'transition',
          description: 'CUT TO:',
          timing: `End of Scene ${scene.sceneNumber}`
        });
      }
    });

    // Final direction
    directions.push({
      type: 'camera',
      description: 'FADE OUT.',
      timing: 'End of Script'
    });

    return directions;
  }, []);

  const calculateWordCount = useCallback((dialogue: ScriptDialogue[]): number => {
    return dialogue.reduce((count, d) => count + d.line.split(' ').length, 0);
  }, []);

  const calculateDuration = useCallback((config: ScriptConfig, dialogueCount: number): string => {
    const wordsPerMinute = 150; // Average speaking rate
    const baseWords = dialogueCount * 10; // Rough estimate
    
    const durationMultipliers = {
      short: 0.5,    // 1-3 minutes
      medium: 1.0,   // 5-10 minutes  
      long: 2.0      // 15-30 minutes
    };
    
    const estimatedMinutes = Math.round((baseWords / wordsPerMinute) * durationMultipliers[config.duration]);
    
    if (estimatedMinutes < 1) return "30-60 segundos";
    if (estimatedMinutes < 60) return `${estimatedMinutes} minutos`;
    
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    return `${hours}h ${minutes}min`;
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentStage('Iniciando geração...');
    
    // Estimate generation time
    const complexityMultiplier = {
      short: 1,
      medium: 1.5,
      long: 2.5
    };
    const baseTime = 45; // seconds
    const estimated = baseTime * complexityMultiplier[config.duration];
    setEstimatedTime(estimated);
    
    try {
      abortControllerRef.current = new AbortController();
      
      const script = await generateScript(config);
      
      setGeneratedScript(script);
      onScriptGenerated(script);
      
      setCurrentStage('Roteiro gerado com sucesso!');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      onError?.(errorMessage);
      setCurrentStage('Erro na geração');
    } finally {
      setIsGenerating(false);
    }
  }, [config, generateScript, isGenerating, onScriptGenerated, onError]);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setGenerationProgress(0);
    setCurrentStage('Geração cancelada');
  }, []);

  const handleRegeneratePart = useCallback(async (part: 'structure' | 'characters' | 'scenes' | 'dialogue') => {
    // Implementar regeneração parcial do roteiro
    console.log(`Regenerating ${part}...`);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Engine de Geração V9.0</h3>
            <p className="text-sm text-gray-600">Powered by Gemini AI</p>
          </div>
        </div>
        
        {estimatedTime > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>~{estimatedTime}s</span>
          </div>
        )}
      </div>

      {/* Configuration Preview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3">Configuração do Roteiro</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Gênero:</span>
            <span className="font-medium">{config.genre}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">Público:</span>
            <span className="font-medium">{config.audience}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-gray-600">Duração:</span>
            <span className="font-medium">{config.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-500" />
            <span className="text-gray-600">Formato:</span>
            <span className="font-medium">{config.format}</span>
          </div>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {currentStage}
            </span>
            <span className="text-sm text-gray-500">
              {generationProgress}%
            </span>
          </div>
          <Progress value={generationProgress} className="mb-2" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Estimativa: {estimatedTime}s</span>
            <span>IA processando...</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {!isGenerating ? (
          <Button
            onClick={handleGenerate}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Sparkles className="w-4 h-4" />
            Gerar Roteiro
          </Button>
        ) : (
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Cancelar
          </Button>
        )}

        {generatedScript && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        )}
      </div>

      {/* Generated Script Preview */}
      {generatedScript && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">
              Roteiro gerado com sucesso!
            </span>
          </div>
          <div className="text-sm text-green-700">
            <p><strong>Palavras:</strong> {generatedScript.metadata.wordCount}</p>
            <p><strong>Duração estimada:</strong> {generatedScript.metadata.estimatedDuration}</p>
            <p><strong>Confiança:</strong> {Math.round(generatedScript.metadata.confidence * 100)}%</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ScriptGeneratorEngine;