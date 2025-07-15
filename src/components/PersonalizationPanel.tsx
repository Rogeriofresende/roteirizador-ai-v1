import React from 'react';

interface PersonalizationPanelProps {
  className?: string;
  recommendations?: any[];
  learningProgress?: any;
  uiAdaptations?: any;
  onInteraction?: (data: any) => void;
}

export const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({
  className = '',
  recommendations = [],
  learningProgress,
  uiAdaptations,
  onInteraction
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Personalização
        </h2>
        <p className="text-gray-600">
          Sistema personalizado baseado no seu uso
        </p>
      </div>
      
      {/* Recommendations Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Recomendações
        </h3>
        
        {recommendations.length > 0 ? (
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div
                key={index}
                className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100"
                onClick={() => onInteraction?.(rec)}
              >
                <p className="text-sm text-blue-800">
                  {rec.title || `Recomendação ${index + 1}`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              Nenhuma recomendação disponível
            </p>
          </div>
        )}
      </div>
      
      {/* Learning Progress */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Progresso de Aprendizado
        </h3>
        
        <div className="bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${learningProgress?.percentage || 0}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-600">
          {learningProgress?.percentage || 0}% do seu perfil personalizado concluído
        </p>
      </div>
      
      {/* UI Adaptations */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Adaptações de Interface
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-800 font-medium">
              Tema Preferido
            </p>
            <p className="text-sm text-green-600">
              {uiAdaptations?.theme || 'Claro'}
            </p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-800 font-medium">
              Layout Preferido
            </p>
            <p className="text-sm text-purple-600">
              {uiAdaptations?.layout || 'Padrão'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 