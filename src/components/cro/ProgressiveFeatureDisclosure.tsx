import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Sparkles, 
  Mic, 
  Users, 
  BarChart3, 
  Zap, 
  Crown, 
  Star,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowRight,
  Gift
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { analyticsService } from '../../services/analyticsService';
import { TouchGestureHandler } from '../mobile/TouchGestureHandler';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'basic' | 'intermediate' | 'advanced' | 'premium';
  unlockTrigger: 'immediate' | 'after_first_script' | 'after_3_scripts' | 'after_5_scripts';
  estimatedValue?: string;
  comingSoon?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}

interface ProgressiveFeatureDisclosureProps {
  userScriptCount: number;
  onFeatureToggle: (featureId: string, isVisible: boolean) => void;
  visibleFeatures: string[];
  variant?: 'sidebar' | 'cards' | 'compact';
  className?: string;
}

// FEATURE CONFIGURATION: Strategic unlock progression
const FEATURES: Feature[] = [
  // BASIC - Always visible
  {
    id: 'templates',
    title: 'Templates Inteligentes',
    description: '50+ templates otimizados para cada plataforma',
    icon: <Sparkles className="w-5 h-5" />,
    category: 'basic',
    unlockTrigger: 'immediate',
    estimatedValue: '5x mais rápido'
  },
  
  // INTERMEDIATE - After 1st script
  {
    id: 'voice-synthesis',
    title: 'Síntese de Voz',
    description: '25+ vozes profissionais para seus roteiros',
    icon: <Mic className="w-5 h-5" />,
    category: 'intermediate',
    unlockTrigger: 'after_first_script',
    estimatedValue: '+300% engajamento'
  },
  {
    id: 'analytics',
    title: 'Analytics Avançado',
    description: 'Métricas detalhadas de performance',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'intermediate',
    unlockTrigger: 'after_first_script',
    estimatedValue: 'Melhore resultados'
  },
  
  // ADVANCED - After 3 scripts
  {
    id: 'collaboration',
    title: 'Colaboração em Tempo Real',
    description: 'Edite roteiros com sua equipe simultaneamente',
    icon: <Users className="w-5 h-5" />,
    category: 'advanced',
    unlockTrigger: 'after_3_scripts',
    estimatedValue: '+50% produtividade'
  },
  {
    id: 'multi-ai',
    title: 'Multi-AI Engine',
    description: 'Gemini + ChatGPT para máxima qualidade',
    icon: <Zap className="w-5 h-5" />,
    category: 'advanced',
    unlockTrigger: 'after_3_scripts',
    estimatedValue: 'Máxima qualidade'
  },
  
  // PREMIUM - After 5 scripts
  {
    id: 'premium-features',
    title: 'Features Premium',
    description: 'Automações, API access e prioridade',
    icon: <Crown className="w-5 h-5" />,
    category: 'premium',
    unlockTrigger: 'after_5_scripts',
    estimatedValue: 'Sem limites'
  }
];

export const ProgressiveFeatureDisclosure: React.FC<ProgressiveFeatureDisclosureProps> = ({
  userScriptCount,
  onFeatureToggle,
  visibleFeatures,
  variant = 'cards',
  className
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['basic']);
  const [justUnlockedFeatures, setJustUnlockedFeatures] = useState<string[]>([]);

  // Determine which features should be unlocked based on user progress
  const getUnlockedFeatures = useCallback(() => {
    return FEATURES.filter(feature => {
      switch (feature.unlockTrigger) {
        case 'immediate':
          return true;
        case 'after_first_script':
          return userScriptCount >= 1;
        case 'after_3_scripts':
          return userScriptCount >= 3;
        case 'after_5_scripts':
          return userScriptCount >= 5;
        default:
          return false;
      }
    }).map(f => f.id);
  }, [userScriptCount]);

  // Check for newly unlocked features
  useEffect(() => {
    const unlockedFeatures = getUnlockedFeatures();
    const newlyUnlocked = unlockedFeatures.filter(
      featureId => !visibleFeatures.includes(featureId)
    );

    if (newlyUnlocked.length > 0) {
      // Track feature unlock
      newlyUnlocked.forEach(featureId => {
        const feature = FEATURES.find(f => f.id === featureId);
        if (feature) {
          analyticsService.trackEvent('feature_unlocked', {
            featureId,
            featureName: feature.title,
            userScriptCount,
            unlockTrigger: feature.unlockTrigger,
            category: feature.category,
            timestamp: Date.now()
          });
          
          onFeatureToggle(featureId, true);
        }
      });

      // Show unlock animation
      setJustUnlockedFeatures(newlyUnlocked);
      
      // Remove animation after 3 seconds
      setTimeout(() => {
        setJustUnlockedFeatures([]);
      }, 3000);
    }
  }, [userScriptCount, getUnlockedFeatures, visibleFeatures, onFeatureToggle]);

  const handleFeatureClick = (feature: Feature) => {
    if (feature.onClick) {
      feature.onClick();
    }
    
    analyticsService.trackEvent('feature_clicked', {
      featureId: feature.id,
      featureName: feature.title,
      userScriptCount,
      category: feature.category,
      isUnlocked: visibleFeatures.includes(feature.id)
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getFeaturesByCategory = (category: string) => {
    return FEATURES.filter(f => f.category === category);
  };

  const isFeatureUnlocked = (feature: Feature) => {
    return getUnlockedFeatures().includes(feature.id);
  };

  const getCategoryProgress = (category: string) => {
    const categoryFeatures = getFeaturesByCategory(category);
    const unlockedCount = categoryFeatures.filter(f => isFeatureUnlocked(f)).length;
    return { unlocked: unlockedCount, total: categoryFeatures.length };
  };

  const renderFeature = (feature: Feature) => {
    const isUnlocked = isFeatureUnlocked(feature);
    const isJustUnlocked = justUnlockedFeatures.includes(feature.id);
    const isVisible = visibleFeatures.includes(feature.id);

    return (
      <TouchGestureHandler key={feature.id} onGesture={() => handleFeatureClick(feature)}>
        <Card 
          className={cn(
            "p-4 transition-all duration-300 cursor-pointer border",
            isUnlocked ? "hover:shadow-md" : "opacity-60",
            isJustUnlocked && "animate-pulse border-green-300 bg-green-50",
            isVisible && isUnlocked && "border-blue-200 bg-blue-50",
            variant === 'compact' && "p-3"
          )}
          onClick={() => isUnlocked && handleFeatureClick(feature)}
        >
          <div className="flex items-start space-x-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              isUnlocked ? "bg-white" : "bg-gray-100"
            )}>
              {isUnlocked ? feature.icon : <Lock className="w-5 h-5 text-gray-400" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={cn(
                  "font-medium truncate",
                  isUnlocked ? "text-gray-900" : "text-gray-500"
                )}>
                  {feature.title}
                </h4>
                
                {isJustUnlocked && (
                  <Badge className="bg-green-100 text-green-800 animate-bounce text-xs">
                    🎉 Novo!
                  </Badge>
                )}
                
                {feature.estimatedValue && isUnlocked && (
                  <Badge variant="outline" className="text-xs">
                    {feature.estimatedValue}
                  </Badge>
                )}
              </div>
              
              <p className={cn(
                "text-sm",
                isUnlocked ? "text-gray-600" : "text-gray-400",
                variant === 'compact' && "text-xs"
              )}>
                {feature.description}
              </p>
              
              {!isUnlocked && (
                <p className="text-xs text-amber-600 mt-2 flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>
                    {feature.unlockTrigger === 'after_first_script' && 'Desbloqueado após 1º roteiro'}
                    {feature.unlockTrigger === 'after_3_scripts' && 'Desbloqueado após 3 roteiros'}
                    {feature.unlockTrigger === 'after_5_scripts' && 'Desbloqueado após 5 roteiros'}
                  </span>
                </p>
              )}
            </div>
            
            {isUnlocked && (
              <ArrowRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </Card>
      </TouchGestureHandler>
    );
  };

  const renderByCategory = () => {
    const categories = [
      { id: 'basic', name: '🎯 Essencial', color: 'blue' },
      { id: 'intermediate', name: '⚡ Avançado', color: 'green' },
      { id: 'advanced', name: '🚀 Pro', color: 'purple' },
      { id: 'premium', name: '👑 Premium', color: 'amber' }
    ];

    return (
      <div className="space-y-4">
        {categories.map(category => {
          const features = getFeaturesByCategory(category.id);
          const progress = getCategoryProgress(category.id);
          const isExpanded = expandedCategories.includes(category.id);
          
          if (features.length === 0) return null;

          return (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{category.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {progress.unlocked}/{progress.total}
                  </Badge>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {isExpanded && (
                <div className={cn(
                  "mt-3 space-y-3",
                  variant === 'cards' && "grid grid-cols-1 md:grid-cols-2 gap-3"
                )}>
                  {features.map(renderFeature)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
          <Gift className="w-4 h-4" />
          <span>Features Disponíveis</span>
        </h3>
        {FEATURES.filter(f => isFeatureUnlocked(f)).map(renderFeature)}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn("w-80 space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Suas Features</h3>
          <Badge variant="outline">
            {getUnlockedFeatures().length}/{FEATURES.length}
          </Badge>
        </div>
        {renderByCategory()}
      </div>
    );
  }

  // Cards variant (default)
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Desbloqueie Mais Features
        </h2>
        <p className="text-gray-600 mb-4">
          Continue criando roteiros para desbloquear novas funcionalidades
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge className="bg-blue-100 text-blue-800">
            {userScriptCount} roteiros criados
          </Badge>
          <Badge variant="outline">
            {getUnlockedFeatures().length}/{FEATURES.length} features desbloqueadas
          </Badge>
        </div>
      </div>
      
      {renderByCategory()}
      
      {/* Progress Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">📈 Seu Progresso</h3>
        <div className="space-y-2">
          {userScriptCount < 1 && (
            <p className="text-sm text-blue-700">
              🎯 <strong>Próximo:</strong> Crie seu primeiro roteiro para desbloquear Síntese de Voz e Analytics
            </p>
          )}
          {userScriptCount >= 1 && userScriptCount < 3 && (
            <p className="text-sm text-blue-700">
              🚀 <strong>Próximo:</strong> Crie mais 2 roteiros para desbloquear Colaboração e Multi-AI
            </p>
          )}
          {userScriptCount >= 3 && userScriptCount < 5 && (
            <p className="text-sm text-blue-700">
              👑 <strong>Próximo:</strong> Crie mais 2 roteiros para desbloquear Features Premium
            </p>
          )}
          {userScriptCount >= 5 && (
            <p className="text-sm text-green-700">
              🎉 <strong>Parabéns!</strong> Você desbloqueou todas as features disponíveis!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 