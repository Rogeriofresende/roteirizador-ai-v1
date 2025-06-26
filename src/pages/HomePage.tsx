import React, { useState, useEffect } from 'react';
import { HeroSection } from "../components/blocks/HeroSection";
import { Icons } from "../components/ui/Icons";
import { GeminiApiConfig } from "../components/GeminiApiConfig";
import Navbar from "../components/Navbar";
import { geminiService } from "../services/geminiService";
import { analyticsService } from "../services/analyticsService";

export default function HomePage() {
  const [isApiConfigured, setIsApiConfigured] = useState(false);
  const [showConfigScreen, setShowConfigScreen] = useState(false);
  const imageSrc = "https://www.launchuicomponents.com/app-light.png";

  useEffect(() => {
    // Verificar se API está configurada na montagem
    const configured = geminiService.isConfigured();
    setIsApiConfigured(configured);
    
    // Se não estiver configurada, mostrar tela de configuração após pequeno delay
    if (!configured) {
      const timer = setTimeout(() => {
        setShowConfigScreen(true);
      }, 1000); // Mostrar hero section brevemente, depois configuração
      
      return () => clearTimeout(timer);
    }
    
    // Track visualização da homepage
    analyticsService.trackPageView('homepage');
  }, []);

  // Atualizar status quando API for configurada
  useEffect(() => {
    const checkConfig = () => {
      const configured = geminiService.isConfigured();
      setIsApiConfigured(configured);
      if (configured) {
        setShowConfigScreen(false);
      }
    };

    // Listener para mudanças no localStorage
    window.addEventListener('storage', checkConfig);
    
    // Check periodicamente também
    const interval = setInterval(checkConfig, 2000);
    
    return () => {
      window.removeEventListener('storage', checkConfig);
      clearInterval(interval);
    };
  }, []);

  // Se deve mostrar configuração
  if (!isApiConfigured && showConfigScreen) {
    return (
      <>
        <Navbar />
        <GeminiApiConfig />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <HeroSection
        badge={{
          text: "Apresentando o RoteiroPro",
          action: {
            text: isApiConfigured ? "API Configurada ✅" : "Configure API",
            href: isApiConfigured ? "#" : "/generator",
          },
        }}
        title="Crie roteiros com IA em minutos"
        description={
          isApiConfigured 
            ? "Nossa IA gera roteiros otimizados para engajamento, economizando seu tempo e ajudando seu canal a crescer."
            : "Configure sua API key do Google Gemini para começar a gerar roteiros incríveis com IA."
        }
        actions={[
          {
            text: isApiConfigured ? "Começar a Gerar" : "Configurar API",
            href: "/generator",
            variant: "default",
          },
          {
            text: "Ver no GitHub",
            href: "https://github.com/seu-repo",
            variant: "glow",
            icon: <Icons.gitHub className="h-5 w-5" />,
          },
        ]}
        imageSrc={imageSrc}
        imageAlt="Pré-visualização do App"
      />
    </>
  );
} 