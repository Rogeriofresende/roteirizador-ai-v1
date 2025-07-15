/**
 * 🎨 CONTENT ANALYZER - V7.5 Enhanced Professional Interface
 * Componente de análise profissional de conteúdo seguindo metodologia V7.5 Enhanced
 * 
 * Features:
 * - AI-powered content analysis with sentiment, readability, engagement scores
 * - Professional data visualization with charts and insights
 * - Platform-specific analysis (YouTube, Instagram, TikTok)
 * - Keyword density analysis and SEO recommendations
 * - Improvement suggestions with actionable insights
 * - Export functionality for reports
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService } from '../services/analyticsService';

// V7.5 Enhanced Design System Imports
import { Layout } from '../design-system/components/Layout';
import { Button } from '../design-system/components/Button';
import { Card } from '../design-system/components/Card';

// Chart Components for Data Visualization
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// V7.5 Enhanced Icons
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Brain,
  Target,
  Eye,
  Hash,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Download,
  RefreshCw,
  Lightbulb,
  Star,
  ThumbsUp,
  MessageCircle,
  Share2,
  Clock,
  Users,
  Tag,
  FileText,
  Sparkles
} from 'lucide-react';

// Types for Content Analysis
interface ContentAnalysisRequest {
  content: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'general';
  targetAudience: string;
  tone: string;
  objective: string;
}

interface ContentAnalysisResult {
  sentiment: {
    score: number; // -1 to 1
    label: 'negative' | 'neutral' | 'positive';
    confidence: number;
  };
  readability: {
    score: number; // 0 to 100
    level: 'very-easy' | 'easy' | 'medium' | 'hard' | 'very-hard';
    gradeLevel: number;
  };
  engagement: {
    score: number; // 0 to 100
    factors: string[];
    predictions: {
      likes: number;
      comments: number;
      shares: number;
    };
  };
  seo: {
    score: number; // 0 to 100
    keywords: Array<{ word: string; density: number; importance: number }>;
    recommendations: string[];
  };
  platform: {
    score: number; // 0 to 100
    compliance: boolean;
    optimizations: string[];
  };
  suggestions: Array<{
    type: 'improvement' | 'warning' | 'optimization';
    category: string;
    message: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  statistics: {
    wordCount: number;
    characterCount: number;
    readingTime: number;
    sentences: number;
    paragraphs: number;
  };
}

interface ContentAnalyzerProps {
  className?: string;
}

const ContentAnalyzer: React.FC<ContentAnalyzerProps> = ({ className }) => {
  const { currentUser } = useAuth();
  
  // Core State - V7.5 Enhanced
  const [content, setContent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ContentAnalysisResult | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<ContentAnalysisRequest['platform']>('general');
  const [targetAudience, setTargetAudience] = useState<string>('jovens');
  const [tone, setTone] = useState<string>('casual');
  const [objective, setObjective] = useState<string>('engajar');
  const [error, setError] = useState<string | null>(null);

  // V7.5 Enhanced Analysis Function
  const analyzeContent = useCallback(async () => {
    if (!content.trim()) {
      setError('Por favor, insira o conteúdo para análise');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      analyticsService.trackEvent('content_analysis_started', {
        platform: selectedPlatform,
        contentLength: content.length,
        targetAudience,
        tone,
        objective
      });

      // Simulate AI-powered analysis (replace with actual AI service call)
      const analysisRequest: ContentAnalysisRequest = {
        content,
        platform: selectedPlatform,
        targetAudience,
        tone,
        objective
      };

      // Mock analysis results with realistic data
      const mockAnalysis: ContentAnalysisResult = await simulateContentAnalysis(analysisRequest);
      
      setAnalysisResult(mockAnalysis);
      
      analyticsService.trackEvent('content_analysis_completed', {
        platform: selectedPlatform,
        sentimentScore: mockAnalysis.sentiment.score,
        readabilityScore: mockAnalysis.readability.score,
        engagementScore: mockAnalysis.engagement.score,
        seoScore: mockAnalysis.seo.score
      });

    } catch (error: unknown) {
      console.error('Erro na análise de conteúdo:', error);
      setError(`Falha na análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, selectedPlatform, targetAudience, tone, objective]);

  // Mock analysis function (replace with actual AI service)
  const simulateContentAnalysis = async (request: ContentAnalysisRequest): Promise<ContentAnalysisResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const wordCount = request.content.split(' ').length;
    const characterCount = request.content.length;
    const sentences = request.content.split(/[.!?]+/).length - 1;
    const paragraphs = request.content.split('\n\n').length;

    // Calculate basic sentiment (simplified)
    const positiveWords = ['bom', 'ótimo', 'excelente', 'incrível', 'fantástico', 'amor'].filter(word => 
      request.content.toLowerCase().includes(word)
    ).length;
    const negativeWords = ['ruim', 'péssimo', 'terrível', 'ódio', 'problema'].filter(word => 
      request.content.toLowerCase().includes(word)
    ).length;
    const sentimentScore = Math.max(-1, Math.min(1, (positiveWords - negativeWords) / 10));

    // Calculate readability (simplified Flesch formula)
    const avgSentenceLength = wordCount / Math.max(1, sentences);
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - (1.015 * avgSentenceLength) - (84.6 * 4.7)));

    // Calculate engagement score based on content features
    let engagementScore = 50;
    if (request.content.includes('?')) engagementScore += 10; // Questions
    if (request.content.includes('!')) engagementScore += 5;  // Exclamations
    if (wordCount >= 100 && wordCount <= 300) engagementScore += 15; // Optimal length
    if (request.content.toLowerCase().includes('você')) engagementScore += 10; // Direct address

    // Platform-specific optimizations
    let platformScore = 70;
    if (request.platform === 'tiktok' && wordCount <= 150) platformScore += 20;
    if (request.platform === 'youtube' && wordCount >= 200) platformScore += 15;
    if (request.platform === 'linkedin' && wordCount >= 300) platformScore += 10;

    return {
      sentiment: {
        score: sentimentScore,
        label: sentimentScore > 0.2 ? 'positive' : sentimentScore < -0.2 ? 'negative' : 'neutral',
        confidence: Math.random() * 0.3 + 0.7
      },
      readability: {
        score: readabilityScore,
        level: readabilityScore > 90 ? 'very-easy' : readabilityScore > 80 ? 'easy' : readabilityScore > 50 ? 'medium' : 'hard',
        gradeLevel: Math.max(1, Math.min(12, 12 - (readabilityScore / 10)))
      },
      engagement: {
        score: Math.min(100, engagementScore),
        factors: ['Direct questions', 'Call to action', 'Emotional language'],
        predictions: {
          likes: Math.floor(wordCount * 2.5),
          comments: Math.floor(wordCount * 0.8),
          shares: Math.floor(wordCount * 0.3)
        }
      },
      seo: {
        score: Math.floor(Math.random() * 30) + 60,
        keywords: [
          { word: 'conteúdo', density: 2.5, importance: 8 },
          { word: 'criar', density: 1.8, importance: 7 },
          { word: 'dicas', density: 1.2, importance: 6 }
        ],
        recommendations: [
          'Adicionar mais palavras-chave relevantes',
          'Melhorar densidade de keywords principais',
          'Incluir sinônimos para ampliar alcance'
        ]
      },
      platform: {
        score: platformScore,
        compliance: platformScore > 60,
        optimizations: [
          `Otimizar para ${request.platform}`,
          'Ajustar tom para audiência',
          'Melhorar call-to-action'
        ]
      },
      suggestions: [
        {
          type: 'improvement',
          category: 'Engajamento',
          message: 'Adicionar mais perguntas para aumentar interação',
          impact: 'high'
        },
        {
          type: 'optimization',
          category: 'SEO',
          message: 'Incluir mais palavras-chave relevantes no início',
          impact: 'medium'
        },
        {
          type: 'warning',
          category: 'Legibilidade',
          message: 'Algumas frases são muito longas, considere dividi-las',
          impact: 'medium'
        }
      ],
      statistics: {
        wordCount,
        characterCount,
        readingTime: Math.ceil(wordCount / 200),
        sentences,
        paragraphs
      }
    };
  };

  // Export analysis report
  const exportReport = useCallback(() => {
    if (!analysisResult) return;

    const report = {
      timestamp: new Date().toISOString(),
      platform: selectedPlatform,
      content: content.substring(0, 100) + '...',
      analysis: analysisResult
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    analyticsService.trackEvent('content_analysis_exported', {
      platform: selectedPlatform,
      reportSize: blob.size
    });
  }, [analysisResult, selectedPlatform, content]);

  // Chart colors for professional data visualization
  const chartColors = {
    primary: '#2563eb',
    secondary: '#7c3aed',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    neutral: '#6b7280'
  };

  return (
    <Layout.Page variant="analyzer" padding="responsive" className={className}>
      <Layout.Section spacing="comfortable" maxWidth="container">
        
        {/* V7.5 Enhanced Header */}
        <div className="text-center mb-8">
          <Layout.Heading level={1} className="mb-4 flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-primary-600" />
            <span>Analisador de Conteúdo IA</span>
            <Sparkles className="w-6 h-6 text-warm-500" />
          </Layout.Heading>
          <Layout.Text variant="subtitle" color="muted" className="max-w-2xl mx-auto">
            Análise profissional de conteúdo com insights de IA para otimização e engajamento
          </Layout.Text>
        </div>

        {/* V7.5 Enhanced Main Content */}
        <Layout.Grid cols={1} gap="xl" className="max-w-6xl mx-auto">
          
          {/* Input Section - V7.5 Enhanced */}
          <Layout.Card variant="elevated" padding="lg">
            <Layout.Heading level={3} className="mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Configuração da Análise
            </Layout.Heading>
            
            {/* Platform and Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Plataforma
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as ContentAnalysisRequest['platform'])}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="general">Geral</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Público-Alvo
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="jovens">Jovens</option>
                  <option value="adultos">Adultos</option>
                  <option value="profissionais">Profissionais</option>
                  <option value="empreendedores">Empreendedores</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tom
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="casual">Casual</option>
                  <option value="profissional">Profissional</option>
                  <option value="inspirador">Inspirador</option>
                  <option value="educativo">Educativo</option>
                </select>
              </div>
            </div>

            {/* Content Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Conteúdo para Análise
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Cole ou digite o conteúdo que deseja analisar..."
                className="w-full h-40 p-4 border border-neutral-300 rounded-lg resize-y focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex justify-between items-center mt-2 text-sm text-neutral-500">
                <span>{content.length} caracteres, {content.split(' ').filter(w => w.length > 0).length} palavras</span>
                <span>Tempo de leitura: ~{Math.ceil(content.split(' ').filter(w => w.length > 0).length / 200)} min</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={analyzeContent}
                disabled={!content.trim() || isAnalyzing}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analisando...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Analisar Conteúdo</span>
                  </>
                )}
              </Button>
              
              {analysisResult && (
                <Button
                  onClick={exportReport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Relatório</span>
                </Button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg">
                <Layout.Text variant="body" color="error" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </Layout.Text>
              </div>
            )}
          </Layout.Card>

          {/* Analysis Results - V7.5 Enhanced */}
          {analysisResult && (
            <>
              {/* Key Metrics Overview */}
              <Layout.Card variant="elevated" padding="lg">
                <Layout.Heading level={3} className="mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                  Métricas Principais
                </Layout.Heading>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Sentiment Score */}
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                      analysisResult.sentiment.label === 'positive' ? 'bg-success-100' :
                      analysisResult.sentiment.label === 'negative' ? 'bg-error-100' : 'bg-neutral-100'
                    }`}>
                      {analysisResult.sentiment.label === 'positive' ? (
                        <ThumbsUp className="w-8 h-8 text-success-600" />
                      ) : analysisResult.sentiment.label === 'negative' ? (
                        <AlertCircle className="w-8 h-8 text-error-600" />
                      ) : (
                        <Star className="w-8 h-8 text-neutral-600" />
                      )}
                    </div>
                    <Layout.Text variant="bodyLarge" className="font-semibold">
                      {Math.round((analysisResult.sentiment.score + 1) * 50)}%
                    </Layout.Text>
                    <Layout.Text variant="bodySmall" color="muted">
                      Sentimento
                    </Layout.Text>
                  </div>

                  {/* Readability Score */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 bg-primary-100">
                      <Eye className="w-8 h-8 text-primary-600" />
                    </div>
                    <Layout.Text variant="bodyLarge" className="font-semibold">
                      {Math.round(analysisResult.readability.score)}%
                    </Layout.Text>
                    <Layout.Text variant="bodySmall" color="muted">
                      Legibilidade
                    </Layout.Text>
                  </div>

                  {/* Engagement Score */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 bg-warm-100">
                      <Target className="w-8 h-8 text-warm-600" />
                    </div>
                    <Layout.Text variant="bodyLarge" className="font-semibold">
                      {analysisResult.engagement.score}%
                    </Layout.Text>
                    <Layout.Text variant="bodySmall" color="muted">
                      Engajamento
                    </Layout.Text>
                  </div>

                  {/* SEO Score */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 bg-secondary-100">
                      <Hash className="w-8 h-8 text-secondary-600" />
                    </div>
                    <Layout.Text variant="bodyLarge" className="font-semibold">
                      {analysisResult.seo.score}%
                    </Layout.Text>
                    <Layout.Text variant="bodySmall" color="muted">
                      SEO
                    </Layout.Text>
                  </div>
                </div>
              </Layout.Card>

              {/* Detailed Charts */}
              <Layout.Grid cols={2} gap="lg">
                
                {/* Performance Radar Chart */}
                <Layout.Card variant="outlined" padding="md">
                  <Layout.Heading level={4} className="mb-4">
                    Performance Geral
                  </Layout.Heading>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { subject: 'Sentimento', score: (analysisResult.sentiment.score + 1) * 50 },
                        { subject: 'Legibilidade', score: analysisResult.readability.score },
                        { subject: 'Engajamento', score: analysisResult.engagement.score },
                        { subject: 'SEO', score: analysisResult.seo.score },
                        { subject: 'Plataforma', score: analysisResult.platform.score }
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Scores"
                          dataKey="score"
                          stroke={chartColors.primary}
                          fill={chartColors.primary}
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Layout.Card>

                {/* Engagement Predictions */}
                <Layout.Card variant="outlined" padding="md">
                  <Layout.Heading level={4} className="mb-4">
                    Predições de Engajamento
                  </Layout.Heading>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Likes', value: analysisResult.engagement.predictions.likes },
                        { name: 'Comentários', value: analysisResult.engagement.predictions.comments },
                        { name: 'Compartilhamentos', value: analysisResult.engagement.predictions.shares }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill={chartColors.secondary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Layout.Card>

              </Layout.Grid>

              {/* Keywords and Suggestions */}
              <Layout.Grid cols={2} gap="lg">
                
                {/* SEO Keywords */}
                <Layout.Card variant="outlined" padding="md">
                  <Layout.Heading level={4} className="mb-4 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-secondary-600" />
                    Palavras-Chave
                  </Layout.Heading>
                  <div className="space-y-3">
                    {analysisResult.seo.keywords.map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div>
                          <Layout.Text variant="body" className="font-medium">
                            {keyword.word}
                          </Layout.Text>
                          <Layout.Text variant="bodySmall" color="muted">
                            Densidade: {keyword.density}%
                          </Layout.Text>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                          <Layout.Text variant="bodySmall" color="muted">
                            Importância: {keyword.importance}/10
                          </Layout.Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </Layout.Card>

                {/* Improvement Suggestions */}
                <Layout.Card variant="outlined" padding="md">
                  <Layout.Heading level={4} className="mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-warm-600" />
                    Sugestões de Melhoria
                  </Layout.Heading>
                  <div className="space-y-3">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        suggestion.type === 'improvement' ? 'bg-success-50 border-success-500' :
                        suggestion.type === 'warning' ? 'bg-warning-50 border-warning-500' :
                        'bg-primary-50 border-primary-500'
                      }`}>
                        <div className="flex items-start gap-3">
                          {suggestion.type === 'improvement' ? (
                            <CheckCircle2 className="w-5 h-5 text-success-600 mt-0.5" />
                          ) : suggestion.type === 'warning' ? (
                            <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5" />
                          ) : (
                            <Lightbulb className="w-5 h-5 text-primary-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <Layout.Text variant="body" className="font-medium">
                              {suggestion.category}
                            </Layout.Text>
                            <Layout.Text variant="bodySmall" color="muted">
                              {suggestion.message}
                            </Layout.Text>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                suggestion.impact === 'high' ? 'bg-error-100 text-error-800' :
                                suggestion.impact === 'medium' ? 'bg-warning-100 text-warning-800' :
                                'bg-neutral-100 text-neutral-800'
                              }`}>
                                Impacto: {suggestion.impact}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Layout.Card>

              </Layout.Grid>

              {/* Statistics Summary */}
              <Layout.Card variant="outlined" padding="md">
                <Layout.Heading level={4} className="mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-neutral-600" />
                  Estatísticas do Conteúdo
                </Layout.Heading>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <Layout.Text variant="bodyLarge" className="font-semibold block">
                      {analysisResult.statistics.wordCount}
                    </Layout.Text>
                    <Layout.Text variant="bodySmall" color="muted">
                      Palavras
                    </Layout.Text>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <Layout.Text variant="bodyLarge" className="font-semibold block">
                      {analysisResult.statistics.characterCount}
                    </Layout.Text>
                    <Layout.Text variant="bodySmall" color="muted">
                      Caracteres
                    </Layout.Text>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <Layout.Text variant="bodyLarge" className="font-semibold block">
                      {analysisResult.statistics.sentences}
                    </Layout.Text>
                    <Layout.Text variant="bodySmall" color="muted">
                      Frases
                    </Layout.Text>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <Layout.Text variant="bodyLarge" className="font-semibold block">
                      {analysisResult.statistics.paragraphs}
                    </Layout.Text>
                    <Layout.Text variant="bodySmall" color="muted">
                      Parágrafos
                    </Layout.Text>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-lg">
                    <Layout.Text variant="bodyLarge" className="font-semibold block">
                      {analysisResult.statistics.readingTime} min
                    </Layout.Text>
                    <Layout.Text variant="bodySmall" color="muted">
                      Leitura
                    </Layout.Text>
                  </div>
                </div>
              </Layout.Card>

            </>
          )}

          {/* Empty State - V7.5 Enhanced */}
          {!analysisResult && !isAnalyzing && (
            <Layout.Card variant="outlined" padding="lg" className="text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-neutral-600" />
              </div>
              <Layout.Heading level={4} className="mb-2">
                Pronto para Analisar
              </Layout.Heading>
              <Layout.Text variant="body" color="muted" className="mb-4">
                Insira seu conteúdo acima e configure as opções para receber uma análise completa com insights de IA
              </Layout.Text>
              <Layout.Text variant="bodySmall" color="muted">
                Análise inclui: sentimento, legibilidade, engajamento, SEO e otimizações específicas por plataforma
              </Layout.Text>
            </Layout.Card>
          )}

        </Layout.Grid>
      </Layout.Section>
    </Layout.Page>
  );
};

export default ContentAnalyzer; 