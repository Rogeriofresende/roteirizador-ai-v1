import React from 'react';

interface AnalyticsDashboardProps {
  className?: string;
  data?: any;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  data
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600">
          Acompanhe suas métricas e performance em tempo real
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric Cards */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            Total de Ideias
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {data?.totalIdeas || 0}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 mb-1">
            Ideias Este Mês
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {data?.monthlyIdeas || 0}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800 mb-1">
            Tempo Médio
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {data?.averageTime || '0s'}
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          Dashboard de analytics em desenvolvimento
        </p>
      </div>
    </div>
  );
}; 