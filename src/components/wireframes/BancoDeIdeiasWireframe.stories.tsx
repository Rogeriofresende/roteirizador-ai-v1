import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

// 🎯 WIREFRAME V1 - Banco de Ideias
// Teste do workflow iterativo - versão inicial para feedback

const BancoDeIdeiasWireframe = () => {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [formData, setFormData] = useState({
    nicho: '',
    plataforma: '',
    descricao: ''
  });

  const handleGenerate = () => {
    setStep('loading');
    // Simula processamento IA
    setTimeout(() => setStep('results'), 2000);
  };

  const handleReset = () => {
    setStep('form');
    setFormData({ nicho: '', plataforma: '', descricao: '' });
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui'
    }}>
      
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#1976d2', margin: '0 0 8px 0' }}>
          💡 Banco de Ideias
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Gere ideias personalizadas para seu conteúdo
        </p>
      </div>

      {/* Form Step */}
      {step === 'form' && (
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '24px'
        }}>
          <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>
            📝 Conte-me sobre seu conteúdo:
          </h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500'
            }}>
              🎯 Seu nicho:
            </label>
            <input
              type="text"
              placeholder="Ex: Fitness, Culinária, Tech..."
              value={formData.nicho}
              onChange={(e) => setFormData({...formData, nicho: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500'
            }}>
              📱 Plataforma:
            </label>
            <select
              value={formData.plataforma}
              onChange={(e) => setFormData({...formData, plataforma: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Selecione uma plataforma</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500'
            }}>
              📝 Descrição adicional (opcional):
            </label>
            <textarea
              placeholder="Conte mais detalhes sobre o que você quer criar..."
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!formData.nicho || !formData.plataforma}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: formData.nicho && formData.plataforma ? '#1976d2' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: formData.nicho && formData.plataforma ? 'pointer' : 'not-allowed',
              fontWeight: '500'
            }}
          >
            ✨ Gerar Ideias com IA
          </button>
        </div>
      )}

      {/* Loading Step */}
      {step === 'loading' && (
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '16px',
            animation: 'pulse 1.5s infinite'
          }}>
            🤖
          </div>
          <h2 style={{ marginBottom: '8px', color: '#1976d2' }}>
            Gerando suas ideias...
          </h2>
          <p style={{ color: '#666' }}>
            A IA está analisando seu nicho e criando conteúdo personalizado
          </p>
          <div style={{ 
            margin: '20px auto',
            width: '200px',
            height: '4px',
            backgroundColor: '#e0e0e0',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#1976d2',
              animation: 'loading 2s infinite'
            }} />
          </div>
        </div>
      )}

      {/* Results Step */}
      {step === 'results' && (
        <div>
          <div style={{ 
            backgroundColor: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: '0 0 8px 0', color: '#2e7d32', fontSize: '18px' }}>
              ✅ Ideias geradas com sucesso!
            </h2>
            <p style={{ margin: 0, color: '#2e7d32' }}>
              Aqui estão 5 ideias personalizadas para {formData.plataforma} no nicho {formData.nicho}
            </p>
          </div>

          {/* Mock Results */}
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} style={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '12px'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
                💡 Ideia #{num}: [Título gerado pela IA]
              </h3>
              <p style={{ margin: '0 0 12px 0', color: '#666', lineHeight: '1.5' }}>
                [Descrição detalhada da ideia, adaptada para {formData.plataforma} 
                no nicho de {formData.nicho}...]
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ 
                  backgroundColor: '#f0f0f0', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  #{formData.nicho}
                </span>
                <span style={{ 
                  backgroundColor: '#f0f0f0', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  #{formData.plataforma}
                </span>
              </div>
            </div>
          ))}

          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginTop: '24px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleReset}
              style={{
                padding: '12px 20px',
                backgroundColor: 'white',
                color: '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Gerar Novas Ideias
            </button>
            <button
              style={{
                padding: '12px 20px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              💾 Salvar Ideias
            </button>
            <button
              style={{
                padding: '12px 20px',
                backgroundColor: '#f57c00',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📋 Ver Histórico
            </button>
          </div>
        </div>
      )}

      {/* Wireframe Info */}
      <div style={{
        marginTop: '40px',
        padding: '16px',
        backgroundColor: '#fff3e0',
        border: '1px solid #ff9800',
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <strong>🎨 Wireframe V1 - Feedback needed:</strong>
        <br />
        Este é o primeiro wireframe do Banco de Ideias. 
        Teste todas as interações e me diga o que precisa ser ajustado!
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

const meta: Meta<typeof BancoDeIdeiasWireframe> = {
  title: '🎨 Wireframes/Banco de Ideias V1',
  component: BancoDeIdeiasWireframe,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Wireframe inicial do Banco de Ideias para teste do workflow iterativo. Teste todas as funcionalidades e dê feedback para ajustes.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof BancoDeIdeiasWireframe>;

export const Default: Story = {};

export const FormStep: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Etapa inicial onde o usuário preenche as informações para gerar ideias'
      }
    }
  }
};

export const LoadingStep: Story = {
  play: async () => {
    // Auto-trigger loading state for demo
    const button = document.querySelector('button');
    if (button && !button.disabled) {
      button.click();
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado de loading enquanto a IA processa e gera as ideias'
      }
    }
  }
}; 