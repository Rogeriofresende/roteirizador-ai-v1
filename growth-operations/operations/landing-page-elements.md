# 🎯 Elementos da Landing Page - Roteiro Pro

## 📋 Pergunta de Onboarding (OBRIGATÓRIA)

### Pergunta Principal
**"Qual foi o principal motivo que te trouxe a experimentar o Roteiro Pro hoje?"**

### Opções de Resposta (Multiple Choice)
- [ ] Estou cansado de gastar horas editando texto do ChatGPT
- [ ] Quero criar conteúdo que soe mais como eu
- [ ] Preciso ser mais consistente na criação de conteúdo
- [ ] Ouvi falar sobre vocês [especificar onde]
- [ ] Quero economizar tempo na criação de roteiros
- [ ] Outros: [campo aberto]

### Pergunta de Follow-up (Opcional)
**"Em uma palavra, como você descreveria sua maior dificuldade com criação de conteúdo?"**
- Campo aberto para resposta

## 🎨 Copy para Landing Page

### Headline Principal
**"Pare de Soar Como um Robô. Crie Roteiros que Já Nascem com Sua Voz."**

### Sub-headline
**Para especialistas que querem transformar conhecimento em autoridade, sem gastar horas editando texto genérico.**

### Proposta de Valor (3 Pontos)

#### 1. 🎯 Aprende Seu Estilo
"Conecta-se às suas redes sociais para entender seu tom, suas histórias e sua terminologia única."

#### 2. ⚡ Gera Conteúdo Autêntico  
"Cria roteiros que já soam como você, eliminando horas de edição e frustração."

#### 3. 🚀 Constrói Autoridade
"Transforme seu conhecimento em conteúdo consistente que gera autoridade no seu mercado."

### Social Proof
**"Usado por [número] especialistas que pararam de soar como robôs"**

### CTA Principal
**"Experimente Gratuitamente - Primeiro Roteiro em 5 Minutos"**

### CTA Secundário
**"Ver Como Funciona"** (link para demo/vídeo)

## 🔄 Fluxo de Onboarding

### Passo 1: Captura de Email
- Email obrigatório
- Nome opcional
- Pergunta principal de motivação

### Passo 2: Configuração Inicial
- Conectar redes sociais (opcional)
- Escolher área de especialização
- Definir tom de voz preferido

### Passo 3: Primeiro Roteiro
- Geração do primeiro roteiro
- Tutorial de como usar
- Feedback sobre o resultado

### Passo 4: Follow-up
- Email de boas-vindas
- Tutorial avançado
- Invite para comunidade/grupo

## 📊 Elementos de Tracking

### Eventos para Google Analytics
```javascript
// Chegada na landing page
gtag('event', 'page_view', {
  'page_title': 'Landing Page Roteiro Pro',
  'page_location': window.location.href
});

// Clique no CTA principal
gtag('event', 'cta_click', {
  'event_category': 'conversion',
  'event_label': 'signup_attempt'
});

// Conclusão do signup
gtag('event', 'signup_complete', {
  'event_category': 'conversion',
  'event_label': 'trial_start'
});

// Resposta da pergunta de onboarding
gtag('event', 'onboarding_response', {
  'event_category': 'user_feedback',
  'event_label': '[resposta_da_pergunta]'
});
```

### Pixels para Facebook/Meta
```javascript
// Visitante na landing page
fbq('track', 'PageView');

// Início do cadastro
fbq('track', 'InitiateCheckout');

// Cadastro completo
fbq('track', 'CompleteRegistration');
```

## 🎯 Elementos de Conversão

### Prova Social Específica
- **Depoimento**: "Antes gastava 4 horas editando roteiros. Agora recebo tudo pronto em 5 minutos." - [Nome, Profissão]
- **Números**: "Em média, nossos usuários economizam 15 horas por semana"
- **Logos**: Empresas ou profissionais reconhecidos que usam

### Objeções e Respostas

#### "Mais uma IA?"
**Resposta**: "Não somos mais uma IA genérica. Somos especialistas em autenticidade. Aprendemos SEU estilo."

#### "Quanto custa?"
**Resposta**: "Teste gratuito completo. Sem cartão de crédito. Cancele quando quiser."

#### "Vai funcionar para minha área?"
**Resposta**: "Funciona para qualquer especialista: advogados, médicos, consultores, coaches, empreendedores..."

### Urgência/Escassez (se aplicável)
- **Limitação**: "Vagas limitadas para beta testers"
- **Tempo**: "Oferta de teste estendido válida até [data]"
- **Exclusividade**: "Acesso antecipado para primeiros 100 usuários"

## 📱 Versão Mobile

### Headline Reduzida
**"Roteiros Autênticos em 5 Minutos"**

### CTA Simplificado
**"Testar Grátis"**

### Form Mínimo
- Apenas email
- Pergunta de onboarding simplificada

---

**Status**: Elementos da landing page estruturados
**Próximo**: Configurar sistema de métricas