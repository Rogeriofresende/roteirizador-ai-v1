import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { 
  CheckCircle, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Brain,
  Target,
  Lightbulb,
  BarChart3,
  ArrowRight,
  Edit3
} from 'lucide-react';

interface AIInsightsDisplayProps {
  analysis: AnalysisResult;
  onProceed?: () => void;
  onRefineAnalysis?: () => void;
  loading?: boolean;
}

interface AnalysisResult {
  profile: {
    niche: string;
    tone: string;
    audience: string;
    topics: string[];
    postFrequency: string;
    bestPerformingContent: string;
  };
  insights: Array<{
    type: 'opportunity' | 'strength' | 'improvement';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  confidence: number;
  stats: {
    postsAnalyzed: number;
    engagementAverage: string;
    topHashtags: string[];
    peakTimes: string[];
  };
}

export const AIInsightsDisplay: React.FC<AIInsightsDisplayProps> = ({
  analysis,
  onProceed,
  onRefineAnalysis,
  loading = false
}) => {
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case 'strength':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'improvement':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default:
        return <Brain className="w-5 h-5 text-purple-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const confidenceColor = analysis.confidence >= 80 ? 'text-green-600' : 
                         analysis.confidence >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Etapa 1 de 5</span>
          <span>Análise Completa</span>
        </div>
        <Progress value={40} className="h-2" />
      </div>

      {/* Main Results Card */}
      <Card className="border-2 border-green-100">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-3xl text-white">
            ✨
          </div>
          <div>
            <CardTitle className="text-2xl mb-2">
              Análise do Seu Perfil Completa!
            </CardTitle>
            <CardDescription className="text-lg">
              Nossa IA analisou seu conteúdo e identificou padrões importantes. 
              Veja o que descobrimos sobre seu perfil profissional.
            </CardDescription>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">Confiança da análise:</span>
            <span className={`font-bold text-lg ${confidenceColor}`}>
              {analysis.confidence}%
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Perfil Identificado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Nicho Principal:</span>
                <p className="text-lg font-semibold text-blue-700">{analysis.profile.niche}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Tom de Voz:</span>
                <p className="text-base">{analysis.profile.tone}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Audiência:</span>
                <p className="text-base">{analysis.profile.audience}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Frequência:</span>
                <p className="text-base">{analysis.profile.postFrequency}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.stats.postsAnalyzed}
                </div>
                <div className="text-xs text-blue-600">Posts Analisados</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analysis.stats.engagementAverage}
                </div>
                <div className="text-xs text-green-600">Engagement Médio</div>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Melhor Performance:</span>
              <p className="text-sm">{analysis.profile.bestPerformingContent}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Top Hashtags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.stats.topHashtags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics Covered */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Temas Principais Identificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.profile.topics.map((topic, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="px-4 py-2 text-sm border-green-200 text-green-700"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Insights & Oportunidades
          </CardTitle>
          <CardDescription>
            Baseado na análise do seu conteúdo, identificamos estas oportunidades:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedInsight === index 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedInsight(selectedInsight === index ? null : index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge 
                        className={`text-xs ${getImpactColor(insight.impact)}`}
                        variant="outline"
                      >
                        {insight.impact === 'high' ? 'Alto Impacto' : 
                         insight.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Accuracy Notice */}
      <Alert className="border-purple-200 bg-purple-50">
        <Brain className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>Como chegamos a esses insights:</strong> Analisamos {analysis.stats.postsAnalyzed} posts, 
          padrões de engagement, tom de voz e temas recorrentes. Essa análise nos dá {analysis.confidence}% 
          de confiança nos resultados.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={onProceed}
          disabled={loading}
          className="flex-1 h-12 text-lg"
          size="lg"
        >
          {loading ? (
            'Processando...'
          ) : (
            <>
              ✅ Está Correto - Vamos Conversar
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onRefineAnalysis}
          disabled={loading}
          className="flex-1 sm:flex-none px-6"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Ajustar Análise
        </Button>
      </div>

      {/* Next Steps Preview */}
      <div className="text-center bg-gray-50 rounded-lg p-6 space-y-3">
        <h3 className="font-medium text-gray-700">Próximo Passo:</h3>
        <p className="text-sm text-gray-600">
          Vamos fazer algumas perguntas específicas baseadas nessa análise para criar 
          sua estratégia de conteúdo personalizada.
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            ICP Detalhado
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            Objetivos
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Estratégia
          </span>
        </div>
      </div>
    </div>
  );
}; 