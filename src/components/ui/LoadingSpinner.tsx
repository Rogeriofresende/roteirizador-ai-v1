import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 my-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      <p className="mt-4 text-lg text-gray-600">Gerando seu roteiro, por favor aguarde...</p>
    </div>
  );
};

export { LoadingSpinner };
export default LoadingSpinner; 