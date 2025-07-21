/**
 * 📄 SCRIPT EXPORTER V9.0
 * 
 * Sistema de exportação múltipla para roteiros
 * Suporta PDF, DOCX, TXT e formato Fountain
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification ROIA-GR-001
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useCallback } from 'react';
import { Download, FileText, File, FileCode, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GeneratedScript } from './ScriptGeneratorEngine';
import { useMetrics } from '../../hooks/useMetrics';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'fountain';

interface ExportOption {
  format: ExportFormat;
  name: string;
  description: string;
  icon: React.ReactNode;
  mimeType: string;
  extension: string;
}

interface ScriptExporterProps {
  script: GeneratedScript;
  onExportComplete?: (format: ExportFormat, success: boolean) => void;
  className?: string;
}

// ============================================================================
// EXPORT OPTIONS CONFIGURATION
// ============================================================================

const EXPORT_OPTIONS: ExportOption[] = [
  {
    format: 'pdf',
    name: 'PDF',
    description: 'Documento portátil, ideal para impressão e compartilhamento',
    icon: <File className="w-5 h-5 text-red-500" />,
    mimeType: 'application/pdf',
    extension: 'pdf'
  },
  {
    format: 'docx',
    name: 'Word (DOCX)',
    description: 'Microsoft Word, editável e colaborativo',
    icon: <FileText className="w-5 h-5 text-blue-500" />,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: 'docx'
  },
  {
    format: 'txt',
    name: 'Texto Simples',
    description: 'Formato universal, compatível com qualquer editor',
    icon: <FileText className="w-5 h-5 text-gray-500" />,
    mimeType: 'text/plain',
    extension: 'txt'
  },
  {
    format: 'fountain',
    name: 'Fountain',
    description: 'Padrão da indústria cinematográfica',
    icon: <FileCode className="w-5 h-5 text-purple-500" />,
    mimeType: 'text/plain',
    extension: 'fountain'
  }
];

// ============================================================================
// SCRIPT EXPORTER COMPONENT
// ============================================================================

export const ScriptExporter: React.FC<ScriptExporterProps> = ({
  script,
  onExportComplete,
  className = ""
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [exportingFormats, setExportingFormats] = useState<Set<ExportFormat>>(new Set());
  const [exportStatus, setExportStatus] = useState<Map<ExportFormat, 'success' | 'error'>>(new Map());

  // Metrics tracking
  const { trackScriptExport, trackFeature, trackError } = useMetrics();

  // ============================================================================
  // EXPORT FORMATTERS
  // ============================================================================
  
  const formatToPDF = useCallback((script: GeneratedScript): string => {
    // PDF formatting - simplified text version for now
    // In production, would use libraries like jsPDF with proper formatting
    let content = `${script.title}\n`;
    content += `${'='.repeat(script.title.length)}\n\n`;
    
    content += `Gênero: ${script.config.genre}\n`;
    content += `Público: ${script.config.audience}\n`;
    content += `Duração: ${script.metadata.estimatedDuration}\n`;
    content += `Palavras: ${script.metadata.wordCount}\n\n`;

    // Structure
    content += `ESTRUTURA\n`;
    content += `${'='.repeat(9)}\n\n`;
    script.content.structure.acts.forEach(act => {
      content += `${act.title} (${act.duration})\n`;
      content += `${act.description}\n\n`;
    });

    // Scenes and Dialogue
    content += `ROTEIRO\n`;
    content += `${'='.repeat(7)}\n\n`;
    
    script.content.scenes.forEach((scene, index) => {
      content += `CENA ${scene.sceneNumber} - ${scene.location.toUpperCase()} - ${scene.timeOfDay.toUpperCase()}\n\n`;
      content += `${scene.description}\n\n`;
      
      // Add dialogue for this scene
      const sceneDialogue = script.content.dialogue.filter(d => d.character);
      sceneDialogue.slice(index * 3, (index + 1) * 3).forEach(dialogue => {
        content += `${dialogue.character}\n`;
        content += `${dialogue.line}\n`;
        if (dialogue.direction) {
          content += `(${dialogue.direction})\n`;
        }
        content += `\n`;
      });
      
      content += `\n`;
    });

    return content;
  }, []);

  const formatToDocx = useCallback((script: GeneratedScript): string => {
    // DOCX formatting - would use libraries like docx in production
    return formatToPDF(script); // Simplified for now
  }, [formatToPDF]);

  const formatToTxt = useCallback((script: GeneratedScript): string => {
    let content = `${script.title}\n`;
    content += `${'-'.repeat(script.title.length)}\n\n`;
    
    content += `Configuração:\n`;
    content += `- Gênero: ${script.config.genre}\n`;
    content += `- Público: ${script.config.audience}\n`;
    content += `- Tom: ${script.config.tone}\n`;
    content += `- Formato: ${script.config.format}\n`;
    content += `- Duração estimada: ${script.metadata.estimatedDuration}\n`;
    content += `- Palavras: ${script.metadata.wordCount}\n\n`;

    if (script.config.characters && script.config.characters.length > 0) {
      content += `Personagens:\n`;
      script.config.characters.forEach(char => {
        content += `- ${char}\n`;
      });
      content += `\n`;
    }

    if (script.config.keyPoints && script.config.keyPoints.length > 0) {
      content += `Pontos-chave:\n`;
      script.config.keyPoints.forEach(point => {
        content += `- ${point}\n`;
      });
      content += `\n`;
    }

    content += `ESTRUTURA NARRATIVA\n`;
    content += `${'='.repeat(18)}\n\n`;
    script.content.structure.acts.forEach(act => {
      content += `${act.actNumber}. ${act.title}\n`;
      content += `   ${act.description}\n`;
      content += `   Duração: ${act.duration}\n\n`;
    });

    content += `CENAS\n`;
    content += `${'='.repeat(5)}\n\n`;
    script.content.scenes.forEach(scene => {
      content += `Cena ${scene.sceneNumber}: ${scene.location} - ${scene.timeOfDay}\n`;
      content += `${scene.description}\n`;
      if (scene.characters.length > 0) {
        content += `Personagens: ${scene.characters.join(', ')}\n`;
      }
      content += `\n`;
    });

    content += `DIÁLOGOS\n`;
    content += `${'='.repeat(8)}\n\n`;
    script.content.dialogue.forEach(dialogue => {
      content += `${dialogue.character}:\n`;
      content += `"${dialogue.line}"\n`;
      if (dialogue.emotion) {
        content += `(Emoção: ${dialogue.emotion})\n`;
      }
      if (dialogue.direction) {
        content += `(${dialogue.direction})\n`;
      }
      content += `\n`;
    });

    return content;
  }, []);

  const formatToFountain = useCallback((script: GeneratedScript): string => {
    let content = `Title: ${script.title}\n`;
    content += `Credit: Gerado por Roteirar IA\n`;
    content += `Author: Sistema V9.0\n`;
    content += `Source: ${script.config.genre} - ${script.config.audience}\n`;
    content += `Draft date: ${script.metadata.generatedAt.toLocaleDateString('pt-BR')}\n\n`;

    content += `FADE IN:\n\n`;

    script.content.scenes.forEach((scene, sceneIndex) => {
      // Scene header
      content += `${scene.location.toUpperCase()} - ${scene.timeOfDay.toUpperCase()}\n\n`;
      
      // Scene description
      content += `${scene.description}\n\n`;

      // Characters introduction
      if (scene.characters.length > 0) {
        scene.characters.forEach(char => {
          content += `${char.toUpperCase()} está presente.\n`;
        });
        content += `\n`;
      }

      // Dialogue for this scene
      const sceneDialogue = script.content.dialogue.slice(sceneIndex * 2, (sceneIndex + 1) * 2);
      sceneDialogue.forEach(dialogue => {
        content += `${dialogue.character.toUpperCase()}\n`;
        if (dialogue.direction) {
          content += `(${dialogue.direction})\n`;
        }
        content += `${dialogue.line}\n\n`;
      });

      // Transition
      if (sceneIndex < script.content.scenes.length - 1) {
        content += `CUT TO:\n\n`;
      }
    });

    content += `FADE OUT.\n\n`;
    content += `THE END\n`;

    return content;
  }, []);

  // ============================================================================
  // EXPORT HANDLERS
  // ============================================================================
  
  const handleExport = useCallback(async (format: ExportFormat) => {
    setExportingFormats(prev => new Set(prev).add(format));
    
    // Track export start
    trackFeature('script_exporter', 'export_started', { format, scriptTitle: script.title });
    
    try {
      let content: string;
      const option = EXPORT_OPTIONS.find(opt => opt.format === format)!;
      const fileName = `${script.title.replace(/[^a-zA-Z0-9]/g, '_')}.${option.extension}`;
      const mimeType = option.mimeType;

      switch (format) {
        case 'pdf':
          content = formatToPDF(script);
          break;
        case 'docx':
          content = formatToDocx(script);
          break;
        case 'txt':
          content = formatToTxt(script);
          break;
        case 'fountain':
          content = formatToFountain(script);
          break;
        default:
          throw new Error(`Formato não suportado: ${format}`);
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      setExportStatus(prev => new Map(prev).set(format, 'success'));
      
      // Track successful export
      trackScriptExport(format, script.title, true);
      onExportComplete?.(format, true);
      
    } catch (error) {
      console.error(`Erro ao exportar como ${format}:`, error);
      
      // Track failed export
      trackScriptExport(format, script.title, false);
      trackError(error as Error, 'script_export');
      
      setExportStatus(prev => new Map(prev).set(format, 'error'));
      onExportComplete?.(format, false);
    } finally {
      setExportingFormats(prev => {
        const newSet = new Set(prev);
        newSet.delete(format);
        return newSet;
      });
    }
  }, [script, formatToPDF, formatToDocx, formatToTxt, formatToFountain, onExportComplete]);

  const handleExportAll = useCallback(async () => {
    for (const option of EXPORT_OPTIONS) {
      await handleExport(option.format);
      // Add small delay between exports
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }, [handleExport]);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Exportar Roteiro</h3>
          <p className="text-sm text-gray-600">
            Escolha o formato desejado para download
          </p>
        </div>
        
        <Button
          onClick={handleExportAll}
          variant="outline"
          className="flex items-center gap-2"
          disabled={exportingFormats.size > 0}
        >
          <Download className="w-4 h-4" />
          Exportar Todos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPORT_OPTIONS.map((option) => {
          const isExporting = exportingFormats.has(option.format);
          const status = exportStatus.get(option.format);
          
          return (
            <div
              key={option.format}
              className={`p-4 border rounded-lg transition-colors ${
                status === 'success' ? 'border-green-200 bg-green-50' :
                status === 'error' ? 'border-red-200 bg-red-50' :
                'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {option.icon}
                  <div>
                    <h4 className="font-medium text-gray-800">{option.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
                
                {status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              <Button
                onClick={() => handleExport(option.format)}
                disabled={isExporting}
                size="sm"
                className="w-full"
                variant={status === 'success' ? 'outline' : 'default'}
              >
                {isExporting ? (
                  <>Exportando...</>
                ) : status === 'success' ? (
                  <>Exportar Novamente</>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar {option.name}
                  </>
                )}
              </Button>

              {status === 'error' && (
                <p className="text-xs text-red-600 mt-2">
                  Erro ao exportar. Tente novamente.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Sobre os Formatos</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li><strong>PDF:</strong> Ideal para compartilhamento e impressão profissional</li>
              <li><strong>DOCX:</strong> Editável no Microsoft Word para colaboração</li>
              <li><strong>TXT:</strong> Compatível com qualquer editor de texto</li>
              <li><strong>Fountain:</strong> Padrão da indústria para roteiros cinematográficos</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ScriptExporter;