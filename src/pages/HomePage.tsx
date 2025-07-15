import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../design-system/components/Layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { theme } from '../design-system/tokens';
import { cn } from '../lib/utils';
import { 
  Sparkles, 
  Zap, 
  Target, 
  Users, 
  TrendingUp, 
  Shield,
  PlayCircle,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/generator');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'IA Avançada',
      description: 'Gemini 1.5 Flash para criação de roteiros profissionais',
      color: 'text-primary-600'
    },
    {
      icon: Target,
      title: 'Multi-Plataforma',
      description: 'YouTube, Instagram, TikTok, LinkedIn e Twitter',
      color: 'text-accent-600'
    },
    {
      icon: Zap,
      title: 'Super Rápido',
      description: 'Roteiros personalizados em menos de 10 segundos',
      color: 'text-warm-600'
    },
    {
      icon: Users,
      title: 'Colaboração',
      description: 'Trabalhe em equipe com edição em tempo real',
      color: 'text-success-600'
    }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Content Creator',
      avatar: '👩‍💼',
      text: 'Revolucionou minha produtividade! Agora crío 10x mais conteúdo.',
      rating: 5
    },
    {
      name: 'João Santos',
      role: 'Marketing Manager',
      avatar: '👨‍💻',
      text: 'A qualidade dos roteiros é impressionante. Parece que foram escritos por um profissional.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'YouTuber',
      avatar: '👩‍🎨',
      text: 'Finalmente uma ferramenta que entende o que eu preciso para cada plataforma.',
      rating: 5
    }
  ];

  const stats = [
    { number: '50K+', label: 'Roteiros Criados' },
    { number: '15K+', label: 'Criadores Ativos' },
    { number: '98%', label: 'Satisfação' },
    { number: '4.9', label: 'Avaliação' }
  ];

  return (
    <Layout.Page variant="default" className="bg-gradient-to-br from-primary-50 via-white to-accent-50">
      
      {/* HERO SECTION */}
      <Layout.Section background="white" spacing="loose" className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-100/20 via-transparent to-accent-100/20" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-primary-100 text-primary-700 border-primary-200">
            <Sparkles className="w-4 h-4 mr-1" />
            Powered by AI
          </Badge>
          
          <Layout.Heading level={1} className="mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Crie Roteiros Profissionais com Inteligência Artificial
          </Layout.Heading>
          
          <Layout.Text variant="bodyLarge" color="muted" className="mb-8 max-w-2xl mx-auto">
            Transforme suas ideias em roteiros envolventes para YouTube, Instagram, TikTok e mais. 
            Nossa IA avançada cria conteúdo personalizado que engaja e converte.
          </Layout.Text>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              {currentUser ? 'Criar Roteiro' : 'Começar Grátis'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => navigate('/demo')}
              className="text-primary-600 hover:text-primary-700"
            >
              <Target className="w-5 h-5 mr-2" />
              Ver Demo
            </Button>
          </div>
          
          {/* Stats */}
          <Layout.Grid cols={4} gap="lg" className="max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <Layout.Heading level={3} color="primary" className="mb-1">
                  {stat.number}
                </Layout.Heading>
                <Layout.Text variant="bodySmall" color="muted">
                  {stat.label}
                </Layout.Text>
              </div>
            ))}
          </Layout.Grid>
        </div>
      </Layout.Section>

      {/* FEATURES SECTION */}
      <Layout.Section background="neutral" spacing="loose">
        <div className="text-center mb-16">
          <Layout.Heading level={2} className="mb-4">
            Tudo que você precisa para criar conteúdo incrível
          </Layout.Heading>
          <Layout.Text variant="bodyLarge" color="muted" className="max-w-2xl mx-auto">
            Ferramentas profissionais que transformam qualquer ideia em roteiros que engajam e convertem
          </Layout.Text>
        </div>
        
        <Layout.Grid cols={2} gap="lg" className="max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Layout.Card key={index} variant="interactive" padding="lg">
                <div className="flex items-start space-x-4">
                  <div className={cn(
                    "p-3 rounded-lg",
                    "bg-gradient-to-br from-primary-100 to-accent-100"
                  )}>
                    <Icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <div className="flex-1">
                    <Layout.Heading level={4} className="mb-2">
                      {feature.title}
                    </Layout.Heading>
                    <Layout.Text variant="body" color="muted">
                      {feature.description}
                    </Layout.Text>
                  </div>
                </div>
              </Layout.Card>
            );
          })}
        </Layout.Grid>
      </Layout.Section>

      {/* TESTIMONIALS SECTION */}
      <Layout.Section background="white" spacing="loose">
        <div className="text-center mb-16">
          <Layout.Heading level={2} className="mb-4">
            Criadores adoram nossos resultados
          </Layout.Heading>
          <Layout.Text variant="bodyLarge" color="muted">
            Veja o que nossos usuários estão dizendo
          </Layout.Text>
        </div>
        
        <Layout.Grid cols={3} gap="lg" className="max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Layout.Card key={index} variant="elevated" padding="lg">
              <div className="text-center">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-warm-500 fill-current" />
                  ))}
                </div>
                <Layout.Text variant="body" className="mb-4 text-center">
                  "{testimonial.text}"
                </Layout.Text>
                <Layout.Heading level={6} className="mb-1">
                  {testimonial.name}
                </Layout.Heading>
                <Layout.Text variant="bodySmall" color="muted">
                  {testimonial.role}
                </Layout.Text>
              </div>
            </Layout.Card>
          ))}
        </Layout.Grid>
      </Layout.Section>

      {/* CTA SECTION */}
      <Layout.Section background="primary" spacing="normal" className="bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="text-center text-white">
          <Layout.Heading level={2} className="mb-4 text-white">
            Pronto para revolucionar sua criação de conteúdo?
          </Layout.Heading>
          <Layout.Text variant="bodyLarge" className="mb-8 text-primary-100 max-w-2xl mx-auto">
            Junte-se a milhares de criadores que já estão usando nossa IA para criar roteiros que convertem
          </Layout.Text>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-primary-600 hover:bg-primary-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {currentUser ? 'Criar Primeiro Roteiro' : 'Começar Agora - Grátis'}
            </Button>
            
            <Layout.Text variant="bodySmall" className="text-primary-200">
              ✅ Sem cartão de crédito • ✅ Setup em 30 segundos
            </Layout.Text>
          </div>
        </div>
      </Layout.Section>

    </Layout.Page>
  );
};

export default HomePage; 