import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Settings, Download, Mic, Zap, Clock, Users, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Slider } from '../ui/Slider';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { VoiceSynthesisService } from '../../services/voiceSynthesisService';
import type { VoiceProfile, VoiceSynthesis } from '../../types';

interface VoiceSynthesisPanelProps {
  projectId: string;
  userId: string;
  text: string;
  isVisible: boolean;
  onClose: () => void;
}

export const VoiceSynthesisPanel: React.FC<VoiceSynthesisPanelProps> = ({
  projectId,
  userId,
  text,
  isVisible,
  onClose
}) => {
  // Estados
  const [availableVoices, setAvailableVoices] = useState<VoiceProfile[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [settings, setSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    emphasis: 'moderate' as const,
    pause: {
      sentence: 500,
      paragraph: 1000
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [currentSynthesis, setCurrentSynthesis] = useState<VoiceSynthesis | null>(null);
  const [userQuota, setUserQuota] = useState({ used: 0, limit: 100, remaining: 100 });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const [activeTab, setActiveTab] = useState<'voices' | 'settings' | 'preview'>('voices');

  const audioRef = useRef<HTMLAudioElement>(null);

  // Inicialização com loading suave
  useEffect(() => {
    const initializeVoices = async () => {
      if (!isVisible) return;
      
      try {
        await VoiceSynthesisService.initialize();
        const voices = VoiceSynthesisService.getAvailableVoices('pt');
        setAvailableVoices(voices);
        
        if (voices.length > 0) {
          // Preferir vozes portuguesas primeiro
          const ptVoice = voices.find(v => v.language.startsWith('pt')) || voices[0];
          setSelectedVoice(ptVoice.id);
        }

        // Obter quota do usuário
        const quota = await VoiceSynthesisService.checkUserQuota(userId);
        setUserQuota(quota);
      } catch (error) {
        console.error('Erro ao inicializar síntese de voz:', error);
      }
    };

    initializeVoices();
  }, [isVisible, userId]);

  // Limpar ao fechar
  useEffect(() => {
    if (!isVisible) {
      handleStop();
      setActiveTab('voices');
      setShowAdvancedSettings(false);
    }
  }, [isVisible]);

  // Monitorar progresso do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [currentSynthesis]);

  // Verificar se está reproduzindo
  useEffect(() => {
    const checkPlayingStatus = () => {
      const isSpeaking = VoiceSynthesisService.isSpeaking();
      setIsPlaying(isSpeaking || (audioRef.current && !audioRef.current.paused));
    };

    const interval = setInterval(checkPlayingStatus, 500);
    return () => clearInterval(interval);
  }, []);

  // Handlers melhorados
  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    
    // Animação suave de seleção
    const voiceElement = document.querySelector(`[data-voice-id="${voiceId}"]`);
    if (voiceElement) {
      voiceElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handlePreviewVoice = async (voiceId?: string) => {
    const targetVoice = voiceId || selectedVoice;
    if (!targetVoice) return;

    setIsPreviewingVoice(true);
    
    try {
      const voice = VoiceSynthesisService.getVoiceById(targetVoice);
      if (voice) {
        const sampleText = previewText || getPreviewText(voice.language);
        await VoiceSynthesisService.previewVoice(targetVoice, sampleText);
      }
    } catch (error) {
      console.error('Erro ao fazer preview da voz:', error);
    } finally {
      setIsPreviewingVoice(false);
    }
  };

  const handleSynthesize = async () => {
    if (!selectedVoice || !text.trim()) {
      return;
    }

    if (userQuota.remaining <= 0) {
      // Melhor feedback para limite atingido
      alert('🚫 Você atingiu o limite de sínteses deste mês. Faça upgrade do seu plano para continuar.');
      return;
    }

    setIsSynthesizing(true);

    try {
      const synthesis = await VoiceSynthesisService.synthesizeText(
        projectId,
        userId,
        text,
        selectedVoice,
        settings
      );

      setCurrentSynthesis(synthesis);

      // Atualizar quota com animação
      const newQuota = await VoiceSynthesisService.checkUserQuota(userId);
      setUserQuota(newQuota);

      // Se há URL de áudio, configurar reprodução
      if (synthesis.audioUrl && audioRef.current) {
        audioRef.current.src = synthesis.audioUrl;
      }

      // Feedback de sucesso
      setActiveTab('preview');

    } catch (error) {
      console.error('Erro na síntese:', error);
      alert('❌ Erro ao sintetizar voz. Tente novamente em alguns momentos.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handlePlay = () => {
    if (currentSynthesis?.audioUrl && audioRef.current) {
      // Áudio pré-gerado
      audioRef.current.play();
      setIsPlaying(true);
    } else if (selectedVoice && text.trim()) {
      // Reprodução direta via Speech API
      handleSynthesize();
    }
  };

  const handlePause = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    } else {
      VoiceSynthesisService.pause();
    }
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    VoiceSynthesisService.stop();
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const handleDownload = () => {
    if (currentSynthesis?.audioUrl) {
      const link = document.createElement('a');
      link.href = currentSynthesis.audioUrl;
      link.download = `roteiro_${currentSynthesis.id}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Utilitários
  const getPreviewText = (language: string): string => {
    const samples: Record<string, string> = {
      'pt-BR': 'Olá! Esta é uma amostra da voz em português brasileiro. Como você está hoje?',
      'pt-PT': 'Olá! Esta é uma amostra da voz em português europeu. Como está?',
      'en-US': 'Hello! This is a sample of the American English voice. How are you today?',
      'en-GB': 'Hello! This is a sample of the British English voice. How are you today?'
    };
    return samples[language] || samples['pt-BR'];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVoicesByProvider = () => {
    const grouped = availableVoices.reduce((acc, voice) => {
      if (!acc[voice.provider]) {
        acc[voice.provider] = [];
      }
      acc[voice.provider].push(voice);
      return acc;
    }, {} as Record<string, VoiceProfile[]>);

    return grouped;
  };

  const getQuotaColor = () => {
    const percentage = (userQuota.used / userQuota.limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-600';
  };

  const getVoiceRating = (voice: VoiceProfile) => {
    // Simular rating baseado no provider e características
    if (voice.isPremium) return 4.8;
    return 4.2;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header aprimorado */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Mic className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Síntese de Voz</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transforme seu roteiro em áudio profissional</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-full p-2">
            ✕
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Quota do usuário melhorada */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Quota Mensal</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {userQuota.used}/{userQuota.limit} sínteses
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getQuotaColor()}`}
                style={{ width: `${(userQuota.used / userQuota.limit) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {userQuota.remaining} sínteses restantes
              </p>
              {userQuota.remaining <= 5 && (
                <Badge variant="secondary" className="text-xs">
                  Quase no limite!
                </Badge>
              )}
            </div>
          </div>

          {/* Tabs de navegação */}
          <div className="flex border-b px-6">
            {[
              { id: 'voices', label: 'Escolher Voz', icon: Users },
              { id: 'settings', label: 'Configurações', icon: Settings },
              { id: 'preview', label: 'Preview', icon: Play }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Tab: Escolher Voz */}
            {activeTab === 'voices' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Escolha sua voz ideal</h3>
                  
                  {Object.entries(getVoicesByProvider()).map(([provider, voices]) => (
                    <div key={provider} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">
                          {provider === 'browser' ? '🌐 Navegador (Gratuito)' : 
                           provider === 'elevenlabs' ? '⭐ ElevenLabs (Premium)' :
                           provider === 'azure' ? '🚀 Azure (Premium)' : provider}
                        </h4>
                        <Badge variant={provider === 'browser' ? 'secondary' : 'default'}>
                          {voices.length} vozes
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {voices.map((voice) => (
                          <div
                            key={voice.id}
                            data-voice-id={voice.id}
                            className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedVoice === voice.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => handleVoiceChange(voice.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {voice.displayName}
                                  </p>
                                  {voice.isPremium && (
                                    <Badge variant="default" className="text-xs">Premium</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {voice.accent} • {voice.gender}
                                </p>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="text-xs text-gray-500">
                                    {getVoiceRating(voice).toFixed(1)}
                                  </span>
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewVoice(voice.id);
                                }}
                                disabled={!voice.isAvailable || isPreviewingVoice}
                                className="ml-2"
                              >
                                {isPreviewingVoice ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Configurações */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Configurações de Voz</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Velocidade */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Velocidade: {settings.rate.toFixed(1)}x
                    </label>
                    <Slider
                      value={[settings.rate]}
                      onValueChange={([value]) => setSettings({...settings, rate: value})}
                      min={0.1}
                      max={3.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Lenta</span>
                      <span>Rápida</span>
                    </div>
                  </div>

                  {/* Tom */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Tom: {settings.pitch.toFixed(1)}
                    </label>
                    <Slider
                      value={[settings.pitch]}
                      onValueChange={([value]) => setSettings({...settings, pitch: value})}
                      min={0.1}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Grave</span>
                      <span>Agudo</span>
                    </div>
                  </div>

                  {/* Volume */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Volume: {Math.round(settings.volume * 100)}%
                    </label>
                    <Slider
                      value={[settings.volume]}
                      onValueChange={([value]) => setSettings({...settings, volume: value})}
                      min={0.0}
                      max={1.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <VolumeX className="w-3 h-3" />
                      <Volume2 className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Configurações avançadas */}
                <div className="border-t pt-6">
                  <button
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {showAdvancedSettings ? 'Ocultar' : 'Mostrar'} configurações avançadas
                  </button>

                  {showAdvancedSettings && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Ênfase */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Ênfase</label>
                          <Select
                            value={settings.emphasis}
                            onValueChange={(value: any) => setSettings({...settings, emphasis: value})}
                          >
                            <option value="none">Nenhuma</option>
                            <option value="moderate">Moderada</option>
                            <option value="strong">Forte</option>
                          </Select>
                        </div>

                        {/* Pausa entre frases */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Pausa entre frases: {settings.pause.sentence}ms
                          </label>
                          <Slider
                            value={[settings.pause.sentence]}
                            onValueChange={([value]) => setSettings({
                              ...settings, 
                              pause: {...settings.pause, sentence: value}
                            })}
                            min={0}
                            max={2000}
                            step={100}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Preview */}
            {activeTab === 'preview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Preview do Áudio</h3>

                {/* Informações do texto */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Texto selecionado</span>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{text.split(' ').length} palavras</span>
                      <span>{text.length} caracteres</span>
                      {currentSynthesis && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(currentSynthesis.duration || 0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {text.substring(0, 300)}{text.length > 300 ? '...' : ''}
                    </p>
                  </div>
                </div>

                {/* Player de áudio melhorado */}
                {currentSynthesis && (
                  <div className="p-4 border rounded-lg bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Áudio sintetizado</span>
                      <Badge variant="default">✅ Pronto</Badge>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handlePlay}
                          disabled={isSynthesizing}
                          className="flex items-center gap-2"
                          size="sm"
                        >
                          <Play className="w-4 h-4" />
                          Reproduzir
                        </Button>

                        {isPlaying && (
                          <>
                            <Button variant="outline" onClick={handlePause} size="sm">
                              <Pause className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" onClick={handleStop} size="sm">
                              <Square className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>

                      {currentSynthesis.audioUrl && (
                        <Button variant="outline" onClick={handleDownload} size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer com ações principais */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            {selectedVoice && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Voz selecionada: <span className="font-medium">
                  {availableVoices.find(v => v.id === selectedVoice)?.displayName}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            
            <Button
              onClick={handleSynthesize}
              disabled={isSynthesizing || !selectedVoice || !text.trim() || userQuota.remaining <= 0}
              className="flex items-center gap-2"
            >
              {isSynthesizing ? (
                <>
                  <LoadingSpinner size="sm" />
                  Sintetizando...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Gerar Áudio
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Audio element para reprodução */}
        <audio
          ref={audioRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setAudioProgress(0);
          }}
          className="hidden"
        />

        {/* Toast de sucesso */}
        {currentSynthesis && currentSynthesis.status === 'completed' && (
          <div className="absolute top-4 right-4 p-3 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg shadow-lg">
            <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
              ✅ Áudio sintetizado com sucesso!
              {currentSynthesis.duration && (
                <span className="text-xs opacity-75">
                  ({formatDuration(currentSynthesis.duration)})
                </span>
              )}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}; 