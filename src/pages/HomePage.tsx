import { HeroSection } from "../components/blocks/HeroSection"
import { Icons } from "../components/ui/Icons"

export default function HomePage() {
  const imageSrc = "https://www.launchuicomponents.com/app-light.png";

  return (
    <HeroSection
      badge={{
        text: "Apresentando o Roteirista PRO",
        action: {
          text: "Saiba mais",
          href: "#",
        },
      }}
      title="Crie roteiros com IA em minutos"
      description="Nossa IA gera roteiros otimizados para engajamento, economizando seu tempo e ajudando seu canal a crescer."
      actions={[
        {
          text: "Começar a Gerar",
          href: "/gerador",
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
  )
} 