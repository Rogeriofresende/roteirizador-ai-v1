import React, { useState } from 'react';
import { socialMediaService } from '../../services/socialMediaAPI';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export const SocialMediaTest: React.FC = () => {
  const [handle, setHandle] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!handle.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🔍 Testando:', handle);
      const profileResult = await socialMediaService.analyzeProfile(handle);
      console.log('✅ Resultado:', profileResult);
      setResult(profileResult);
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center">🧪 Teste do Serviço Social Media</h2>
      
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Handle da Rede Social:
            </label>
            <Input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Ex: @professor_edu, linkedin.com/in/business-ceo"
              className="w-full"
            />
          </div>
          
          <Button
            onClick={handleTest}
            disabled={!handle.trim() || loading}
            className="w-full"
          >
            {loading ? '⏳ Analisando...' : '🔍 Testar Análise'}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="font-bold text-red-800 mb-2">❌ Erro:</h3>
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {result && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="font-bold text-green-800 mb-4">✅ Resultado da Análise:</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Existe:</span> {result.exists ? '✅ Sim' : '❌ Não'}
            </div>
            <div>
              <span className="font-medium">Plataforma:</span> {result.platform}
            </div>
            <div>
              <span className="font-medium">Handle:</span> {result.handle}
            </div>
            {result.exists && (
              <>
                <div>
                  <span className="font-medium">Tipo de Criador:</span> {result.creatorType}
                </div>
                <div>
                  <span className="font-medium">Seguidores:</span> {result.followers?.toLocaleString() || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Confiança:</span> {result.confidence}%
                </div>
                <div>
                  <span className="font-medium">Privado:</span> {result.isPrivate ? '🔒 Sim' : '🔓 Não'}
                </div>
                <div>
                  <span className="font-medium">Verificado:</span> {result.isVerified ? '✅ Sim' : '❌ Não'}
                </div>
                {result.contentPillars && result.contentPillars.length > 0 && (
                  <div>
                    <span className="font-medium">Pilares de Conteúdo:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.contentPillars.map((pillar: string, index: number) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {pillar}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.displayName && (
                  <div>
                    <span className="font-medium">Nome Extraído:</span> {result.displayName}
                  </div>
                )}
                {result.bio && (
                  <div>
                    <span className="font-medium">Bio:</span> {result.bio.substring(0, 100)}...
                  </div>
                )}
                {result.verificationData && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="font-medium text-green-800 mb-2">🔍 Dados de Verificação:</div>
                    <div className="text-xs space-y-1">
                      <div>✅ Perfil Real: {result.verificationData.realProfile ? 'Sim' : 'Não'}</div>
                      <div>✅ Dados Extraídos: {result.verificationData.extractedData ? 'Sim' : 'Não'}</div>
                      <div>✅ Verificado em: {new Date(result.verificationData.checkedAt).toLocaleString()}</div>
                      {result.verificationData.indicators && (
                        <div className="mt-2">
                          <div className="font-medium">Indicadores:</div>
                          <div className="ml-2">
                            {Object.entries(result.verificationData.indicators).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                {key}: {value ? '✅' : '❌'} {JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-blue-800 mb-2">🧪 Casos de Teste:</h3>
        <div className="space-y-2 text-sm">
          <div className="mb-4">
            <p className="font-medium text-blue-700 mb-2">🔍 Perfis Reais (Instagram):</p>
            <button 
              onClick={() => setHandle('@nasa')}
              className="block w-full text-left p-2 hover:bg-blue-100 rounded"
            >
              <span className="font-medium">NASA:</span> @nasa
            </button>
            <button 
              onClick={() => setHandle('@natgeo')}
              className="block w-full text-left p-2 hover:bg-blue-100 rounded"
            >
              <span className="font-medium">National Geographic:</span> @natgeo
            </button>
            <button 
              onClick={() => setHandle('@google')}
              className="block w-full text-left p-2 hover:bg-blue-100 rounded"
            >
              <span className="font-medium">Google:</span> @google
            </button>
          </div>
          
          <div className="mb-4">
            <p className="font-medium text-blue-700 mb-2">👔 Perfis Reais (LinkedIn):</p>
            <button 
              onClick={() => setHandle('linkedin.com/in/satyanadella')}
              className="block w-full text-left p-2 hover:bg-blue-100 rounded"
            >
              <span className="font-medium">Satya Nadella:</span> linkedin.com/in/satyanadella
            </button>
            <button 
              onClick={() => setHandle('linkedin.com/in/williamhgates')}
              className="block w-full text-left p-2 hover:bg-blue-100 rounded"
            >
              <span className="font-medium">Bill Gates:</span> linkedin.com/in/williamhgates
            </button>
          </div>
          
          <div>
            <p className="font-medium text-red-700 mb-2">❌ Perfis Falsos:</p>
            <button 
              onClick={() => setHandle('@profile_fake_test_123')}
              className="block w-full text-left p-2 hover:bg-blue-100 rounded"
            >
              <span className="font-medium">Não existe:</span> @profile_fake_test_123
            </button>
            <button 
              onClick={() => setHandle('@abcdefghijklmnop')}
              className="block w-full text-left p-2 hover:bg-blue-100 rounded"
            >
              <span className="font-medium">Username único:</span> @abcdefghijklmnop
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};