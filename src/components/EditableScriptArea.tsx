import React, { useState, useEffect } from 'react';

interface EditableScriptAreaProps {
  initialScript: string;
  onSave: (editedScript: string) => void;
  isLoading: boolean;
}

const EditableScriptArea: React.FC<EditableScriptAreaProps> = ({ initialScript, onSave, isLoading }) => {
  const [script, setScript] = useState(initialScript);

  useEffect(() => {
    setScript(initialScript);
  }, [initialScript]);

  const handleSave = () => {
    onSave(script);
    alert('Roteiro salvo! (Em um app real, isso seria salvo no banco de dados)');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Roteiro Gerado</h2>
      <div className="bg-gray-50 p-4 rounded-md">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="w-full h-96 p-4 border border-gray-200 rounded-md resize-y focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          placeholder="Seu roteiro aparecerá aqui..."
          disabled={isLoading}
        />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};

export default EditableScriptArea; 