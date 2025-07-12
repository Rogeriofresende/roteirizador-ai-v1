import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  ArrowRight, 
  PlayCircle, 
  Star, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Check, 
  Globe 
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // V5.1: Redirecionamento inteligente baseado em configuração
  useEffect(() => {
    const checkConfigAndRedirect = async () => {
      try {
        const isConfigured = geminiService.isConfigured();
        
        if (isConfigured) {
          setIsRedirecting(true);
          // Pequeno delay para mostrar feedback visual
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }
      } catch (error) {
        console.error('Error checking API configuration:', error);
      }
    };
    
    checkConfigAndRedirect();
  }, [navigate]);
  
  // V5.1: Tela de redirecionamento
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="w-full h-full border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            API Detectada! 🎉
          </h2>
          <p className="text-gray-600">
            Redirecionando para o gerador de roteiros...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text">
              Crie Roteiros Incríveis com
              <span className="block text-yellow-300">Roteirar IA</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              A plataforma mais avançada do Brasil para criação de conteúdo. 
              Gere roteiros profissionais em segundos para YouTube, Instagram, TikTok e LinkedIn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button 
                  size="lg" 
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </div>
            <div className="mt-8 flex justify-center items-center gap-4 text-blue-100">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span>4.9/5 • Mais de 10.000 criadores de conteúdo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que mais de 10.000 criadores escolhem o Roteirar IA?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A única plataforma que combina IA avançada, interface intuitiva e resultados profissionais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-shadow">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">IA Mais Avançada</h3>
              <p className="text-gray-600 mb-4">
                Powered by Google Gemini 1.5 Flash - a IA mais sofisticada para criação de conteúdo. 
                Roteiros personalizados para cada plataforma.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />7 tipos de refinamento IA</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Análise de tendências</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Otimização automática</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Plataforma</h3>
              <p className="text-gray-600 mb-4">
                Crie conteúdo otimizado para YouTube, Instagram, TikTok, LinkedIn e Twitter. 
                Cada plataforma tem suas particularidades.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Templates específicos</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Formatos otimizados</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Hashtags inteligentes</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-shadow">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Resultados Comprovados</h3>
              <p className="text-gray-600 mb-4">
                Nossos usuários reportam 300% mais engajamento e 50% mais velocidade na criação. 
                Analytics integrado para medir performance.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Dashboard inteligente</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Métricas de performance</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Insights automáticos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planos para Todos os Criadores
            </h2>
            <p className="text-xl text-gray-600">
              Comece gratuitamente e escale conforme seu crescimento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Gratuito</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">R$ 0</div>
                <p className="text-gray-600 mb-6">Perfeito para começar</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />5 roteiros por mês</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Todas as plataformas</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Templates básicos</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Suporte da comunidade</li>
              </ul>
              <Link to="/signup" className="block">
                <Button className="w-full" variant="outline">
                  Começar Gratuitamente
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-2xl text-white relative transform scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                  Mais Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-1">R$ 29</div>
                <div className="text-blue-100 mb-4">/mês</div>
                <p className="text-blue-100 mb-6">Para criadores sérios</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><Check className="h-5 w-5 text-yellow-400 mr-3" />Roteiros ilimitados</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-yellow-400 mr-3" />IA avançada + refinamentos</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-yellow-400 mr-3" />Analytics profissionais</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-yellow-400 mr-3" />Suporte prioritário</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-yellow-400 mr-3" />Export premium</li>
              </ul>
              <Link to="/signup" className="block">
                <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                  Upgrade para Pro
                </Button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">Personalizado</div>
                <p className="text-gray-600 mb-6">Para equipes e agências</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Tudo do Pro</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Colaboração em equipe</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />White-label</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Integração API</li>
                <li className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-3" />Suporte dedicado</li>
              </ul>
              <Button className="w-full" variant="outline">
                Falar com Vendas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Confiado por Criadores de Todo o Brasil
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10.000+</div>
              <div className="text-gray-600">Criadores Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">1M+</div>
              <div className="text-gray-600">Roteiros Gerados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">300%</div>
              <div className="text-gray-600">Mais Engajamento</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Satisfação</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Revolucionou meu processo criativo. Agora crio roteiros em minutos que antes levavam horas!"
              </p>
              <div className="font-semibold text-gray-900">Marina Silva</div>
              <div className="text-sm text-gray-600">YouTuber • 500K subscribers</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "A IA realmente entende cada plataforma. Meus vídeos no TikTok triplicaram de views!"
              </p>
              <div className="font-semibold text-gray-900">Carlos Mendes</div>
              <div className="text-sm text-gray-600">TikToker • 2M followers</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Como agência, conseguimos atender 5x mais clientes com a mesma qualidade. Indispensável!"
              </p>
              <div className="font-semibold text-gray-900">Ana Costa</div>
              <div className="text-sm text-gray-600">CEO • Agência Digital</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Revolucionar sua Criação de Conteúdo?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Junte-se a mais de 10.000 criadores que já transformaram seus resultados com nossa IA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
              >
                Começar Gratuitamente Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              <Globe className="mr-2 h-5 w-5" />
              Agendar Demo
            </Button>
          </div>
          <div className="mt-8 text-blue-100">
            💳 Sem cartão de crédito • ⚡ Setup em 30 segundos • 🔒 Cancele quando quiser
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 