import React, { useState } from 'react';

interface ImplementationModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea?: any;
  onImplement?: (implementation: any) => void;
}

export const ImplementationModal: React.FC<ImplementationModalProps> = ({
  isOpen,
  onClose,
  idea,
  onImplement
}) => {
  const [implementationData, setImplementationData] = useState({
    platform: '',
    timeline: '',
    resources: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    onImplement?.(implementationData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Plano de Implementação
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>
        
        {idea && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Ideia Selecionada:</h3>
            <p className="text-blue-700">{idea.title || idea.content}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plataforma de Implementação
            </label>
            <select
              value={implementationData.platform}
              onChange={(e) => setImplementationData(prev => ({ ...prev, platform: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma plataforma</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="linkedin">LinkedIn</option>
              <option value="blog">Blog</option>
              <option value="podcast">Podcast</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cronograma
            </label>
            <select
              value={implementationData.timeline}
              onChange={(e) => setImplementationData(prev => ({ ...prev, timeline: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um prazo</option>
              <option value="today">Hoje</option>
              <option value="this-week">Esta semana</option>
              <option value="next-week">Próxima semana</option>
              <option value="this-month">Este mês</option>
              <option value="next-month">Próximo mês</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recursos Necessários
            </label>
            <textarea
              value={implementationData.resources}
              onChange={(e) => setImplementationData(prev => ({ ...prev, resources: e.target.value }))}
              placeholder="Liste os recursos, ferramentas ou materiais necessários..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionais
            </label>
            <textarea
              value={implementationData.notes}
              onChange={(e) => setImplementationData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Adicione notas, observações ou ideias complementares..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Salvar Plano
          </button>
        </div>
      </div>
    </div>
  );
}; 