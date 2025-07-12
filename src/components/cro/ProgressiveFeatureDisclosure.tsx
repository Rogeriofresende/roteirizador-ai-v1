import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Mic, 
  BarChart3, 
  Users, 
  BookOpen, 
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'basic' | 'intermediate' | 'advanced' | 'premium';
  unlockTrigger: 'immediate' | 'after_first_script' | 'after_3_scripts' | 'manual';
  component?: React.ReactNode;
  learnMoreUrl?: string;
  isNew?: boolean;
  estimatedValue?: string;
}

interface ProgressiveFeatureDisclosureProps {
  userScriptCount: number;
  onFeatureToggle: (featureId: string, isVisible: boolean) => void;
  visibleFeatures: string[];
  variant?: 'sidebar' | 'cards' | 'compact';
}

const FEATURES: Feature[] = [
  {
    id: 'voice-synthesis',
    title: 'Síntese de Voz',
    description: 'Transforme seus roteiros em áudio com 25+ vozes profissionais',
    icon: <Mic className="h-5 w-5" />,
    category: 'intermediate',
    unlockTrigger: 'after_first_script',
    estimatedValue: '+300% engajamento',
    isNew: true
  },
  {
    id: 'analytics',
    title: 'Analytics Avançado',
    description: 'Insights sobre performance e recomendações personalizadas',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'intermediate',
    unlockTrigger: 'after_first_script',
    estimatedValue: 'Melhore resultados'
  },
  {
    id: 'collaboration',
    title: 'Colaboração em Tempo Real',
    description: 'Edite roteiros em equipe com sincronização instantânea',
    icon: <Users className="h-5 w-5" />,
    category: 'advanced',
    unlockTrigger: 'after_3_scripts',
    estimatedValue: '+50% produtividade'
  },
  {
    id: 'templates',
    title: 'Biblioteca de Templates',
    description: '50+ templates profissionais para diferentes nichos',
    icon: <BookOpen className="h-5 w-5" />,
    category: 'basic',
    unlockTrigger: 'immediate',
    estimatedValue: '5x mais rápido'
  },
  {
    id: 'multi-ai',
    title: 'Multi-AI Selection',
    description: 'Escolha entre Gemini e ChatGPT para diferentes estilos',
    icon: <Sparkles className="h-5 w-5" />,
    category: 'advanced',
    unlockTrigger: 'after_3_scripts',
    estimatedValue: 'Máxima qualidade'
  }
];

export const ProgressiveFeatureDisclosure: React.FC<ProgressiveFeatureDisclosureProps> = ({
  userScriptCount,
  onFeatureToggle,
  visibleFeatures,
  variant = 'cards'
}) => {
  const [expandedFeatures, setExpandedFeatures] = useState<string[]>([]);
  const [justUnlocked, setJustUnlocked] = useState<string[]>([]);

  // Determine which features should be available
  const getAvailableFeatures = () => {
    return FEATURES.filter(feature => {
      switch (feature.unlockTrigger) {
        case 'immediate':
          return true;
        case 'after_first_script':
          return userScriptCount >= 1;
        case 'after_3_scripts':
          return userScriptCount >= 3;
        case 'manual':
          return visibleFeatures.includes(feature.id);
        default:
          return false;
      }
    });
  };

  const availableFeatures = getAvailableFeatures();
  
  // Track newly unlocked features
  useEffect(() => {
    const previouslyAvailable = localStorage.getItem('available_features');
    const currentAvailable = availableFeatures.map(f => f.id);
    
    if (previouslyAvailable) {
      const previous = JSON.parse(previouslyAvailable);
      const newlyUnlocked = currentAvailable.filter(id => !previous.includes(id));
      
      if (newlyUnlocked.length > 0) {
        setJustUnlocked(newlyUnlocked);
        // Clear the notification after 5 seconds
        setTimeout(() => setJustUnlocked([]), 5000);
      }
    }
    
    localStorage.setItem('available_features', JSON.stringify(currentAvailable));
  }, [availableFeatures]);

  const toggleFeatureExpansion = (featureId: string) => {
    setExpandedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const toggleFeatureVisibility = (featureId: string) => {
    const isCurrentlyVisible = visibleFeatures.includes(featureId);
    onFeatureToggle(featureId, !isCurrentlyVisible);
  };

  const getCategoryColor = (category: Feature['category']) => {
    switch (category) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: Feature['category']) => {
    switch (category) {
      case 'basic': return 'Essencial';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      case 'premium': return 'Premium';
      default: return 'Outro';
    }
  };

  if (availableFeatures.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Recursos Desbloqueáveis
        </h3>
        <p className="text-gray-600">
          Crie seu primeiro roteiro para desbloquear features incríveis!
        </p>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {availableFeatures.map((feature) => {
          const isVisible = visibleFeatures.includes(feature.id);
          const isJustUnlocked = justUnlocked.includes(feature.id);
          
          return (
            <div
              key={feature.id}
              className={cn(
                "flex items-center justify-between p-3 border rounded-lg transition-all",
                isJustUnlocked && "border-yellow-400 bg-yellow-50 animate-pulse",
                isVisible ? "bg-blue-50 border-blue-200" : "border-gray-200"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="text-gray-600">{feature.icon}</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{feature.title}</span>
                    {isJustUnlocked && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        🎉 Novo!
                      </Badge>
                    )}
                  </div>
                  {feature.estimatedValue && (
                    <span className="text-xs text-gray-500">{feature.estimatedValue}</span>
                  )}
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleFeatureVisibility(feature.id)}
                className="p-1"
              >
                {isVisible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Recursos Disponíveis</h3>
          <Badge variant="secondary" className="text-xs">
            {availableFeatures.length} disponíveis
          </Badge>
        </div>
        
        {availableFeatures.map((feature) => {
          const isVisible = visibleFeatures.includes(feature.id);
          const isExpanded = expandedFeatures.includes(feature.id);
          const isJustUnlocked = justUnlocked.includes(feature.id);
          
          return (
            <Card
              key={feature.id}
              className={cn(
                "p-4 transition-all cursor-pointer",
                isJustUnlocked && "border-yellow-400 bg-yellow-50 animate-pulse",
                isVisible && "border-blue-300 bg-blue-50"
              )}
            >
              <div 
                className="flex items-start justify-between"
                onClick={() => toggleFeatureExpansion(feature.id)}
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-gray-600 mt-1">{feature.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      {isJustUnlocked && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          🎉 Novo!
                        </Badge>
                      )}
                      {feature.isNew && !isJustUnlocked && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Novo
                        </Badge>
                      )}
                    </div>
                    <Badge className={cn("text-xs", getCategoryColor(feature.category))}>
                      {getCategoryLabel(feature.category)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={isVisible ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFeatureVisibility(feature.id);
                    }}
                    className="text-xs px-2 py-1"
                  >
                    {isVisible ? 'Ocultar' : 'Mostrar'}
                  </Button>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                  {feature.estimatedValue && (
                    <div className="flex items-center space-x-2 mb-3">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-700">
                        {feature.estimatedValue}
                      </span>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFeatureVisibility(feature.id)}
                      className="text-xs"
                    >
                      {isVisible ? '👁️ Ocultar Feature' : '👁️ Mostrar Feature'}
                    </Button>
                    {feature.learnMoreUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-blue-600"
                        onClick={() => window.open(feature.learnMoreUrl, '_blank')}
                      >
                        Saiba Mais →
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  // Default: cards variant
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Recursos Disponíveis</h3>
        <Badge variant="secondary">
          {availableFeatures.length} de {FEATURES.length} desbloqueados
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableFeatures.map((feature) => {
          const isVisible = visibleFeatures.includes(feature.id);
          const isJustUnlocked = justUnlocked.includes(feature.id);
          
          return (
            <Card
              key={feature.id}
              className={cn(
                "p-6 transition-all",
                isJustUnlocked && "border-yellow-400 bg-yellow-50 animate-pulse",
                isVisible && "border-blue-300 bg-blue-50"
              )}
            >
              <div className="flex items-start space-x-4">
                <div className="text-gray-600 mt-1">{feature.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium">{feature.title}</h4>
                    {isJustUnlocked && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        🎉 Desbloqueado!
                      </Badge>
                    )}
                    {feature.isNew && !isJustUnlocked && (
                      <Badge className="bg-green-100 text-green-800">
                        Novo
                      </Badge>
                    )}
                  </div>
                  
                  <Badge className={cn("mb-3", getCategoryColor(feature.category))}>
                    {getCategoryLabel(feature.category)}
                  </Badge>
                  
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  
                  {feature.estimatedValue && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-yellow-700">
                        {feature.estimatedValue}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={isVisible ? "default" : "outline"}
                      onClick={() => toggleFeatureVisibility(feature.id)}
                    >
                      {isVisible ? 'Ocultar' : 'Ativar'}
                    </Button>
                    {feature.learnMoreUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600"
                        onClick={() => window.open(feature.learnMoreUrl, '_blank')}
                      >
                        Saiba Mais →
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}; 