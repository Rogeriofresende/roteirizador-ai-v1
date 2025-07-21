/**
 * 🎬 ROTEIROS IA MODULE V9.0
 * 
 * Módulo principal do sistema de geração de roteiros com IA
 * Integra wizard, engine e exportação
 * 
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 * @specification ROIA-GR-001
 * @author IA Beta - Solution Architect + Frontend
 */

import React, { useState, useCallback } from 'react';
import { FileText, Download, RotateCcw, Share2, BookOpen } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import ScriptWizard from './ScriptWizard';
import ScriptExporter from './ScriptExporter';
import { GeneratedScript } from './ScriptGeneratorEngine';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface RoteirosIAProps {
  className?: string;
}

type ViewMode = 'welcome' | 'wizard' | 'preview' | 'library' | 'export';

// ============================================================================
// ROTEIROS IA MAIN COMPONENT
// ============================================================================

export const RoteirosIA: React.FC<RoteirosIAProps> = ({
  className = ""
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [currentView, setCurrentView] = useState<ViewMode>('welcome');
  const [generatedScripts, setGeneratedScripts] = useState<GeneratedScript[]>([]);
  const [activeScript, setActiveScript] = useState<GeneratedScript | null>(null);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleStartWizard = useCallback(() => {
    setCurrentView('wizard');
  }, []);

  const handleWizardComplete = useCallback((script: GeneratedScript) => {
    setGeneratedScripts(prev => [script, ...prev]);
    setActiveScript(script);
    setCurrentView('preview');
  }, []);

  const handleWizardCancel = useCallback(() => {
    setCurrentView('welcome');
  }, []);

  const handleBackToWelcome = useCallback(() => {
    setCurrentView('welcome');
    setActiveScript(null);
  }, []);

  const handleViewLibrary = useCallback(() => {
    setCurrentView('library');
  }, []);

  const handleSelectScript = useCallback((script: GeneratedScript) => {
    setActiveScript(script);
    setCurrentView('preview');
  }, []);

  const handleExportScript = useCallback((script: GeneratedScript) => {
    setActiveScript(script);
    setCurrentView('export');
  }, []);

  const handleShareScript = useCallback((script: GeneratedScript) => {
    // Share functionality
    console.log(`Sharing script "${script.title}"`);
  }, []);

  // ============================================================================
  // RENDER METHODS
  // ============================================================================
  
  const renderWelcomeView = () => (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Roteiros IA
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Crie roteiros profissionais para vídeos, podcasts e apresentações usando 
          inteligência artificial avançada. Simples, rápido e eficiente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Múltiplos Formatos</h3>
          <p className="text-sm text-gray-600">
            Vídeos, podcasts, apresentações e redes sociais
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">IA Inteligente</h3>
          <p className="text-sm text-gray-600">
            Powered by Gemini AI para resultados profissionais
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Export Flexível</h3>
          <p className="text-sm text-gray-600">
            PDF, DOCX, TXT e formato Fountain
          </p>
        </Card>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          onClick={handleStartWizard}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <FileText className="w-5 h-5 mr-2" />
          Criar Novo Roteiro
        </Button>
        
        {generatedScripts.length > 0 && (
          <Button
            onClick={handleViewLibrary}
            variant="outline"
            size="lg"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Biblioteca ({generatedScripts.length})
          </Button>
        )}
      </div>
    </div>
  );

  const renderLibraryView = () => (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Biblioteca de Roteiros</h2>
          <p className="text-gray-600">{generatedScripts.length} roteiro(s) gerado(s)</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleStartWizard} className="bg-gradient-to-r from-purple-500 to-blue-500">
            <FileText className="w-4 h-4 mr-2" />
            Novo Roteiro
          </Button>
          <Button onClick={handleBackToWelcome} variant="outline">
            Voltar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedScripts.map((script) => (
          <Card key={script.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                  {script.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="px-2 py-1 bg-gray-100 rounded">{script.config.genre}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">{script.config.duration}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Palavras:</span>
                <span>{script.metadata.wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Duração:</span>
                <span>{script.metadata.estimatedDuration}</span>
              </div>
              <div className="flex justify-between">
                <span>Confiança:</span>
                <span>{Math.round(script.metadata.confidence * 100)}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSelectScript(script)}
                size="sm"
                className="flex-1"
              >
                Visualizar
              </Button>
              <Button
                onClick={() => handleShareScript(script)}
                variant="outline"
                size="sm"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Criado em {script.metadata.generatedAt.toLocaleDateString('pt-BR')}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPreviewView = () => {
    if (!activeScript) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{activeScript.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded">
                {activeScript.config.genre}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                {activeScript.config.audience}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
                {activeScript.metadata.estimatedDuration}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => handleExportScript(activeScript)}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleBackToWelcome} variant="outline">
              Voltar
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Script Structure */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Estrutura</h3>
              <div className="space-y-2">
                {activeScript.content.structure.acts.map((act) => (
                  <div key={act.actNumber} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-800">
                      Ato {act.actNumber}: {act.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {act.description} ({act.duration})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Cenas</h3>
              <div className="space-y-4">
                {activeScript.content.scenes.map((scene) => (
                  <div key={scene.sceneNumber} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-800">
                        Cena {scene.sceneNumber}
                      </span>
                      <span className="text-sm text-gray-500">
                        {scene.location} - {scene.timeOfDay}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{scene.description}</p>
                    
                    {scene.characters.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Personagens:</span>
                        {scene.characters.map((char, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {char}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dialogue Preview */}
            {activeScript.content.dialogue.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Diálogos</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activeScript.content.dialogue.slice(0, 10).map((dialogue, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-purple-700 mb-1">
                        {dialogue.character}
                        {dialogue.emotion && (
                          <span className="text-xs text-gray-500 ml-2">({dialogue.emotion})</span>
                        )}
                      </div>
                      <p className="text-gray-800">{dialogue.line}</p>
                      {dialogue.direction && (
                        <p className="text-xs text-gray-500 italic mt-1">{dialogue.direction}</p>
                      )}
                    </div>
                  ))}
                  
                  {activeScript.content.dialogue.length > 10 && (
                    <div className="text-center py-3 text-gray-500 text-sm">
                      ... e mais {activeScript.content.dialogue.length - 10} diálogos
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Informações</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Palavras:</span>
                  <div className="font-medium">{activeScript.metadata.wordCount}</div>
                </div>
                <div>
                  <span className="text-gray-600">Duração:</span>
                  <div className="font-medium">{activeScript.metadata.estimatedDuration}</div>
                </div>
                <div>
                  <span className="text-gray-600">Confiança:</span>
                  <div className="font-medium">{Math.round(activeScript.metadata.confidence * 100)}%</div>
                </div>
                <div>
                  <span className="text-gray-600">Gerado:</span>
                  <div className="font-medium">
                    {activeScript.metadata.generatedAt.toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderExportView = () => {
    if (!activeScript) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Exportar Roteiro</h2>
            <p className="text-gray-600">"{activeScript.title}"</p>
          </div>
          <Button onClick={() => setCurrentView('preview')} variant="outline">
            Voltar ao Preview
          </Button>
        </div>

        <ScriptExporter
          script={activeScript}
          onExportComplete={(format, success) => {
            if (success) {
              console.log(`Export ${format} completed successfully`);
            } else {
              console.error(`Export ${format} failed`);
            }
          }}
        />
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className={`min-h-screen bg-gray-50 py-8 px-4 ${className}`}>
      {currentView === 'welcome' && renderWelcomeView()}
      {currentView === 'wizard' && (
        <ScriptWizard
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}
      {currentView === 'preview' && renderPreviewView()}
      {currentView === 'library' && renderLibraryView()}
      {currentView === 'export' && renderExportView()}
    </div>
  );
};

export default RoteirosIA;