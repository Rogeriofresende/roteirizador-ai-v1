import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SocialMediaInputProps {
  onAnalyze?: (profiles: SocialProfiles) => void;
  onSkip?: () => void;
  loading?: boolean;
  validationErrors?: Record<string, string>;
}

interface SocialProfiles {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
}

interface ValidationStatus {
  isValid: boolean;
  isChecking: boolean;
  message?: string;
}

export const SocialMediaInput: React.FC<SocialMediaInputProps> = ({
  onAnalyze,
  onSkip,
  loading = false,
  validationErrors = {}
}) => {
  const [profiles, setProfiles] = useState<SocialProfiles>({});
  const [validationStatus, setValidationStatus] = useState<Record<string, ValidationStatus>>({});

  const handleInputChange = (platform: keyof SocialProfiles, value: string) => {
    setProfiles(prev => ({ ...prev, [platform]: value }));
    
    // Simular validação em tempo real
    if (value) {
      setValidationStatus(prev => ({
        ...prev,
        [platform]: { isValid: false, isChecking: true }
      }));
      
      // Simular check do perfil
      setTimeout(() => {
        const isValid = value.length > 3; // Validação simples para demo
        setValidationStatus(prev => ({
          ...prev,
          [platform]: {
            isValid,
            isChecking: false,
            message: isValid ? 'Perfil encontrado!' : 'Perfil não encontrado'
          }
        }));
      }, 1000);
    } else {
      setValidationStatus(prev => {
        const updated = { ...prev };
        delete updated[platform];
        return updated;
      });
    }
  };

  const handleAnalyze = () => {
    if (onAnalyze) {
      onAnalyze(profiles);
    }
  };

  const hasValidProfiles = Object.keys(profiles).some(key => 
    profiles[key as keyof SocialProfiles] && 
    validationStatus[key]?.isValid
  );

  const platformConfigs = [
    {
      key: 'instagram' as const,
      label: 'Instagram',
      placeholder: '@seuusuario',
      icon: '📸',
      description: 'Seu perfil do Instagram'
    },
    {
      key: 'linkedin' as const,
      label: 'LinkedIn',
      placeholder: 'linkedin.com/in/seuperfil',
      icon: '💼',
      description: 'Seu perfil profissional'
    },
    {
      key: 'twitter' as const,
      label: 'Twitter/X',
      placeholder: '@seuusuario',
      icon: '🐦',
      description: 'Seu perfil do Twitter/X'
    },
    {
      key: 'tiktok' as const,
      label: 'TikTok',
      placeholder: '@seuusuario',
      icon: '🎵',
      description: 'Seu perfil do TikTok'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Etapa 1 de 5</span>
          <span>Qualificação do Perfil</span>
        </div>
        <Progress value={20} className="h-2" />
      </div>

      {/* Main Card */}
      <Card className="border-2 border-blue-100">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl text-white">
            🧠
          </div>
          <div>
            <CardTitle className="text-2xl mb-2">
              Vamos Analisar Seu Perfil
            </CardTitle>
            <CardDescription className="text-lg">
              Nossa IA vai analisar suas redes sociais para entender seu nicho, 
              audiência e estilo atual. Isso nos ajuda a criar uma estratégia personalizada.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Social Media Inputs */}
          <div className="grid gap-4">
            {platformConfigs.map((platform) => {
              const value = profiles[platform.key] || '';
              const status = validationStatus[platform.key];
              const hasError = validationErrors[platform.key];

              return (
                <div key={platform.key} className="space-y-2">
                  <Label htmlFor={`social-${platform.key}`} className="text-sm font-medium flex items-center gap-2">
                    <span className="text-lg">{platform.icon}</span>
                    {platform.label}
                    <Badge variant="secondary" className="text-xs">Opcional</Badge>
                  </Label>
                  
                  <div className="relative">
                    <Input
                      id={`social-${platform.key}`}
                      placeholder={platform.placeholder}
                      value={value}
                      onChange={(e) => handleInputChange(platform.key, e.target.value)}
                      className={`pr-10 ${hasError ? 'border-red-500' : status?.isValid ? 'border-green-500' : ''}`}
                      disabled={loading}
                    />
                    
                    {/* Status Icon */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {status?.isChecking && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                      {status?.isValid && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {status?.message && !status.isValid && !status.isChecking && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Status Message */}
                  {status?.message && (
                    <p className={`text-xs ${status.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {status.message}
                    </p>
                  )}
                  
                  {hasError && (
                    <p className="text-xs text-red-600">{hasError}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Privacidade:</strong> Analisamos apenas dados públicos das suas redes sociais. 
              Nenhuma informação privada é acessada.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleAnalyze}
              disabled={!hasValidProfiles || loading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analisando Perfis...
                </>
              ) : (
                <>
                  🚀 Analisar Meus Perfis
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onSkip}
              disabled={loading}
              className="w-full"
            >
              Não tenho redes sociais ativas
            </Button>
          </div>

          {/* What We Analyze */}
          <div className="pt-4 border-t space-y-3">
            <h4 className="font-medium text-sm text-gray-700">O que vamos analisar:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Bio e descrição
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Últimos posts
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Temas abordados
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Tom de voz
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 