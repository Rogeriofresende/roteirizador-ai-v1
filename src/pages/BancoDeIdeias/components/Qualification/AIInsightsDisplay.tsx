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
  Edit3,
  Clock,
  Award,
  Hash
} from 'lucide-react';

// V8.0: Importar interface unificada
import { 
  UnifiedAnalysisResult,
  AIInsightsDisplayProps,
  AnalysisInsight,
  getConfidenceLevel,
  createEmptyAnalysisResult
} from '../../../../types/QualificationTypes';

export const AIInsightsDisplay: React.FC<AIInsightsDisplayProps> = ({
  analysis,
  onProceed,
  onRefineAnalysis,
  loading = false
}) => {
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  // V8.0: Usar dados da interface unificada com defensive programming
  const safeAnalysis = analysis || createEmptyAnalysisResult();
  const { profile, insights, stats, confidence, metadata, contentRecommendations } = safeAnalysis;

  // V8.0: Verificação adicional de segurança com interface unificada
  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>
            Dados de análise não disponíveis. Por favor, tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case 'strength':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'improvement':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <Alert className="w-5 h-5 text-red-600" />;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Etapa 1 de 5</span>
          <span>Análise Completa</span>
        </div>
        <Progress value={20} className="h-2" />
      </div>

      {/* Main Header with Confidence */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-3xl">✨</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Análise do Seu Perfil Completa!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nossa IA analisou seu conteúdo e identificou padrões importantes. Veja o que descobrimos sobre seu perfil profissional.
          </p>
        </div>
        
        {/* V8.0: Enhanced Confidence Display */}
        <div className="flex justify-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
            getConfidenceLevel(confidence) === 'very-high' ? 'bg-green-100 text-green-800' :
            getConfidenceLevel(confidence) === 'high' ? 'bg-blue-100 text-blue-800' :
            getConfidenceLevel(confidence) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <Award className="w-5 h-5 mr-2" />
            Confiança da análise: {confidence}%
          </div>
        </div>
      </div>

      {/* Profile Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <CardTitle>Perfil Identificado</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Nicho Principal:</h4>
              <p className="text-blue-600 font-medium">{profile?.niche || 'Não identificado'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Tom de Voz:</h4>
              <p className="text-gray-900">{profile?.tone || 'Não identificado'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Audiência:</h4>
              <p className="text-gray-900">{profile?.audience || 'Não identificado'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Frequência:</h4>
              <p className="text-gray-900">{profile?.postFrequency || 'Não identificado'}</p>
            </div>
          </div>
          
          {/* V8.0: Enhanced Demographics */}
          {profile?.targetDemographics && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-700 mb-2">Demografia do Público:</h4>
              <div className="grid md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Idade:</span>
                  <span className="ml-1 font-medium">{profile?.targetDemographics?.ageRange}</span>
                </div>
                {profile?.targetDemographics?.profession && (
                  <div>
                    <span className="text-gray-500">Profissão:</span>
                    <span className="ml-1 font-medium">{profile?.targetDemographics?.profession}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* V8.0: Enhanced Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <CardTitle>Estatísticas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats?.postsAnalyzed || 0}</div>
              <div className="text-sm text-blue-800">Posts Analisados</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats?.engagementAverage || 'N/A'}</div>
              <div className="text-sm text-green-800">Engagement Médio</div>
            </div>
            {stats?.avgLikesPerPost && (
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats?.avgLikesPerPost}</div>
                <div className="text-sm text-purple-800">Curtidas/Post</div>
              </div>
            )}
            {stats?.followerGrowthRate && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats?.followerGrowthRate}</div>
                <div className="text-sm text-yellow-800">Crescimento</div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Melhor Performance:</h4>
              <p className="text-gray-600">{profile?.bestPerformingContent || 'Não identificado'}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Top Hashtags:</h4>
              <div className="flex flex-wrap gap-2">
                {stats?.topHashtags?.map((hashtag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Hash className="w-3 h-3 mr-1" />
                    {hashtag}
                  </Badge>
                ))}
              </div>
            </div>

            {stats?.peakTimes?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Melhores Horários:</h4>
                <div className="flex flex-wrap gap-2">
                  {stats?.peakTimes?.map((time, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* V8.0: Enhanced Topics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <CardTitle>Temas Principais Identificados</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile?.topics?.map((topic, index) => (
              <Badge key={index} className="text-sm">
                {topic}
              </Badge>
            ))}
          </div>
          
          {/* V8.0: Content Categories */}
          {profile?.contentCategories && profile?.contentCategories?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Categorias de Conteúdo:</h4>
              <div className="flex flex-wrap gap-2">
                {profile?.contentCategories?.map((category, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights & Opportunities */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <CardTitle>Insights & Oportunidades</CardTitle>
          </div>
          <CardDescription>
            Baseado na análise do seu conteúdo, identificamos estas oportunidades:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
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
                      {insight.priority && (
                        <Badge variant="secondary" className="text-xs">
                          P{insight.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                    
                    {/* V8.0: Enhanced Insight Details */}
                    {selectedInsight === index && insight.estimatedTimeToImplement && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Tempo estimado: {insight.estimatedTimeToImplement}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* V8.0: Content Recommendations */}
      {contentRecommendations && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <CardTitle>Recomendações de Conteúdo</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {contentRecommendations.suggestedTopics.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Tópicos Sugeridos:</h4>
                <div className="flex flex-wrap gap-2">
                  {contentRecommendations.suggestedTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {contentRecommendations.contentFormats.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Formatos Recomendados:</h4>
                <div className="flex flex-wrap gap-2">
                  {contentRecommendations.contentFormats.map((format, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Accuracy Notice */}
      <Alert className="border-purple-200 bg-purple-50">
        <Brain className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800">
          <strong>Como chegamos a esses insights:</strong> Analisamos {stats?.postsAnalyzed || 0} posts, 
          padrões de engagement, tom de voz e temas recorrentes. Essa análise nos dá {confidence}% 
          de confiança nos resultados.
          {metadata?.modelUsed && (
            <span className="block mt-1 text-sm">
              Modelo utilizado: {metadata.modelUsed} • Versão: {metadata.analysisVersion}
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Action Buttons - V8.0: Enhanced with better layout */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onProceed}
          disabled={loading}
          className="w-full sm:flex-1 h-12 text-lg"
          size="lg"
        >
          {loading ? (
            <>Processando...</>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Está Correto - Vamos Conversar
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onRefineAnalysis}
          disabled={loading}
          className="w-full sm:w-auto h-12 px-8"
          size="lg"
        >
          <Edit3 className="w-5 h-5 mr-2" />
          Ajustar Análise
        </Button>
      </div>
    </div>
  );
}; 