import React, { useState, useCallback } from 'react';
import { Download, Upload, FileText, Share2, CheckCircle, AlertCircle } from 'lucide-react';
import { IdeaResponse } from '../types/IdeaTypes';
import { LoadingState } from './LoadingStates';

interface ExportImportProps {
  ideas: IdeaResponse[];
  onImport: (ideas: IdeaResponse[]) => Promise<void>;
  onExport?: (ideas: IdeaResponse[]) => void;
}

type ExportFormat = 'json' | 'csv' | 'txt' | 'markdown';

export const ExportImportSystem: React.FC<ExportImportProps> = ({
  ideas,
  onImport,
  onExport
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  // Export ideas to different formats
  const exportIdeas = useCallback(async (format: ExportFormat) => {
    if (ideas.length === 0) {
      alert('Nenhuma ideia para exportar');
      return;
    }

    setIsExporting(true);
    
    try {
      let content: string;
      let fileName: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(ideas, null, 2);
          fileName = `ideias_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
          
        case 'csv':
          const csvHeader = 'ID,Título,Categoria,Descrição,Status,Data de Criação\n';
          const csvRows = ideas.map(idea => 
            `"${idea.id}","${idea.title}","${idea.category}","${idea.description?.replace(/"/g, '""')}","${idea.status}","${idea.createdAt}"`
          ).join('\n');
          content = csvHeader + csvRows;
          fileName = `ideias_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
          
        case 'txt':
          content = ideas.map(idea => 
            `TÍTULO: ${idea.title}\nCATEGORIA: ${idea.category}\nDESCRIÇÃO: ${idea.description}\nSTATUS: ${idea.status}\nDATA: ${idea.createdAt}\n${'='.repeat(50)}\n`
          ).join('\n');
          fileName = `ideias_${new Date().toISOString().split('T')[0]}.txt`;
          mimeType = 'text/plain';
          break;
          
        case 'markdown':
          content = `# Banco de Ideias - Exportação\n\n_Exportado em: ${new Date().toLocaleString()}_\n\n`;
          content += ideas.map(idea => 
            `## ${idea.title}\n\n**Categoria:** ${idea.category}\n**Status:** ${idea.status}\n**Data:** ${idea.createdAt}\n\n${idea.description}\n\n---\n\n`
          ).join('');
          fileName = `ideias_${new Date().toISOString().split('T')[0]}.md`;
          mimeType = 'text/markdown';
          break;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onExport?.(ideas);
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar ideias');
    } finally {
      setIsExporting(false);
    }
  }, [ideas, onExport]);

  // Import ideas from file
  const importIdeas = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      let importedIdeas: IdeaResponse[] = [];

      if (file.name.endsWith('.json')) {
        importedIdeas = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        importedIdeas = lines.slice(1).filter(line => line.trim()).map((line, index) => {
          const values = line.split(',').map(v => v.replace(/"/g, ''));
          return {
            id: `imported_${Date.now()}_${index}`,
            title: values[1] || `Ideia Importada ${index + 1}`,
            category: values[2] || 'Geral',
            description: values[3] || '',
            status: (values[4] as any) || 'draft',
            createdAt: values[5] || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: 'Sistema',
            tags: []
          };
        });
      } else {
        throw new Error('Formato de arquivo não suportado');
      }

      // Validate and process imported ideas
      const validIdeas = importedIdeas.filter(idea => 
        idea.title && idea.category && idea.description
      );

      if (validIdeas.length === 0) {
        throw new Error('Nenhuma ideia válida encontrada no arquivo');
      }

      await onImport(validIdeas);
      
      setImportResult({
        success: true,
        message: `${validIdeas.length} ideias importadas com sucesso!`,
        count: validIdeas.length
      });

    } catch (error) {
      console.error('Erro ao importar:', error);
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao importar'
      });
    } finally {
      setIsImporting(false);
      // Reset input
      event.target.value = '';
    }
  }, [onImport]);

  // Share ideas as URL
  const shareIdeas = useCallback(async () => {
    if (ideas.length === 0) {
      alert('Nenhuma ideia para compartilhar');
      return;
    }

    try {
      const shareData = {
        ideas: ideas.slice(0, 10), // Limit to 10 ideas for sharing
        timestamp: new Date().toISOString(),
        source: 'Roteirar IA - Banco de Ideias'
      };

      const shareUrl = `${window.location.origin}/share?data=${btoa(JSON.stringify(shareData))}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Minhas Ideias - Roteirar IA',
          text: `Confira essas ${ideas.length} ideias incríveis!`,
          url: shareUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('Erro ao compartilhar ideias');
    }
  }, [ideas]);

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Exportar & Importar Ideias
      </h3>

      {/* Export Section */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Exportar Ideias</h4>
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="json">JSON (Completo)</option>
            <option value="csv">CSV (Planilha)</option>
            <option value="txt">TXT (Texto)</option>
            <option value="markdown">Markdown</option>
          </select>
          
          <button
            onClick={() => exportIdeas(exportFormat)}
            disabled={isExporting || ideas.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <LoadingState type="exporting" size="sm" />
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exportar ({ideas.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Importar Ideias</h4>
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="file"
            accept=".json,.csv"
            onChange={importIdeas}
            disabled={isImporting}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
          />
          {isImporting && (
            <LoadingState type="saving" size="sm" message="Importando ideias..." />
          )}
        </div>
        
        {importResult && (
          <div className={`p-3 rounded-md flex items-center gap-2 ${
            importResult.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {importResult.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{importResult.message}</span>
          </div>
        )}
      </div>

      {/* Share Section */}
      <div>
        <h4 className="font-medium mb-3">Compartilhar Ideias</h4>
        <button
          onClick={shareIdeas}
          disabled={ideas.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar ({Math.min(ideas.length, 10)})
        </button>
        <p className="text-sm text-neutral-600 mt-2">
          Cria um link para compartilhar suas ideias (máximo 10 ideias)
        </p>
      </div>
    </div>
  );
};

export default ExportImportSystem; 