import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Loader2, Brain, Eye, MessageCircle, TrendingUp } from 'lucide-react';

interface AIAnalysisLoadingProps {
  profiles: Array<{ platform: string; username: string }>;
  onComplete?: (analysis: AnalysisResult) => void;
  estimatedTime?: number; // em segundos
}

interface AnalysisStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'completed';
  insight?: string;
  duration: number; // em ms
}

interface AnalysisResult {
  profile: {
    niche: string;
    tone: string;
    audience: string;
    topics: string[];
  };
  insights: string[];
  confidence: number;
}

export const AIAnalysisLoading: React.FC<AIAnalysisLoadingProps> = ({
  profiles,
  onComplete,
  estimatedTime = 45
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [realTimeInsights, setRealTimeInsights] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);

  const analysisSteps: AnalysisStep[] = [
    {
      id: 'profile-detection',
      label: 'Detectando Perfis',
      description: 'Validando e acessando suas redes sociais',
      icon: <Eye className="w-5 h-5" />,
      status: 'pending',
      duration: 3000
    },
    {
      id: 'content-analysis',
      label: 'Analisando Conteúdo',
      description: 'Examinando seus últimos posts e bio',
      icon: <MessageCircle className="w-5 h-5" />,
      status: 'pending',
      insight: 'Encontrei 15 posts sobre direito empresarial...',
      duration: 8000
    },
    {
      id: 'niche-identification',
      label: 'Identificando Nicho',
      description: 'Determinando sua área de especialização',
      icon: <Brain className="w-5 h-5" />,
      status: 'pending',
      insight: 'Seu nicho principal é consultoria jurídica para empresas...',
      duration: 6000
    },
    {
      id: 'audience-analysis',
      label: 'Analisando Audiência',
      description: 'Entendendo quem interage com seu conteúdo',
      icon: <TrendingUp className="w-5 h-5" />,
      status: 'pending',
      insight: 'Sua audiência é 65% empresários e 35% outros profissionais...',
      duration: 7000
    },
    {
      id: 'strategy-generation',
      label: 'Gerando Estratégia',
      description: 'Criando recomendações personalizadas',
      icon: <Brain className="w-5 h-5" />,
      status: 'pending',
      insight: 'Identificadas 3 oportunidades de melhoria...',
      duration: 6000
    }
  ];

  const [steps, setSteps] = useState(analysisSteps);

  useEffect(() => {
    if (currentStep >= steps.length) {
      // Análise completa - simular resultado
      setTimeout(() => {
        const mockResult: AnalysisResult = {
          profile: {
            niche: 'Direito Empresarial',
            tone: 'Formal e Educativo',
            audience: 'Empresários e Empreendedores',
            topics: ['Sociedades', 'Contratos', 'Compliance']
          },
          insights: [
            'Posts educativos geram 40% mais engagement',
            'Sua audiência prefere conteúdo prático',
            'Oportunidade em direito digital'
          ],
          confidence: 87
        };
        onComplete?.(mockResult);
      }, 2000);
      return;
    }

    const currentStepData = steps[currentStep];
    
    // Atualizar status para processing
    setSteps(prev => prev.map((step, index) => 
      index === currentStep 
        ? { ...step, status: 'processing' }
        : step
    ));

    // Adicionar insight em tempo real após um delay
    setTimeout(() => {
      if (currentStepData.insight) {
        setRealTimeInsights(prev => [...prev, currentStepData.insight!]);
      }
    }, currentStepData.duration * 0.3);

    // Completar step após duration
    setTimeout(() => {
      setSteps(prev => prev.map((step, index) => 
        index === currentStep 
          ? { ...step, status: 'completed' }
          : step
      ));
      setCurrentStep(prev => prev + 1);
    }, currentStepData.duration);

  }, [currentStep, steps, onComplete]);

  // Atualizar progress e tempo
  useEffect(() => {
    const interval = setInterval(() => {
      const completedSteps = steps.filter(s => s.status === 'completed').length;
      const newProgress = (completedSteps / steps.length) * 100;
      setProgress(newProgress);
      
      if (timeRemaining > 0) {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [steps, timeRemaining]);

  const getStepStatusIcon = (step: AnalysisStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Etapa 1 de 5</span>
          <span>Analisando Perfil - {timeRemaining}s restantes</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Main Analysis Card */}
      <Card className="border-2 border-blue-100">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white animate-pulse">
            🧠
          </div>
          <div>
            <CardTitle className="text-2xl mb-2">
              IA Analisando Seus Perfis
            </CardTitle>
            <div className="flex flex-wrap justify-center gap-2">
              {profiles.map((profile, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {profile.platform}: {profile.username}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Analysis Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  step.status === 'processing' 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : step.status === 'completed'
                    ? 'bg-green-50 border-l-4 border-green-500'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getStepStatusIcon(step)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {step.icon}
                    <h3 className={`font-medium ${
                      step.status === 'processing' ? 'text-blue-700' : 
                      step.status === 'completed' ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      {step.label}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Insights */}
          {realTimeInsights.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-purple-700 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Insights em Tempo Real
              </h3>
              <div className="space-y-3">
                {realTimeInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm animate-fade-in"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What's Happening */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-blue-700 text-sm">O que está acontecendo:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Analisando bio e descrição
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Examinando últimos 20 posts
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Identificando padrões de conteúdo
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3" />
                Analisando engagement patterns
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-blue-600">
          {Math.round(progress)}%
        </div>
        <p className="text-sm text-gray-600">
          Nossa IA está criando uma estratégia personalizada baseada no seu perfil atual
        </p>
      </div>
    </div>
  );
}; 