# 🧠 BANCO DE IDEIAS V2.0 - WORKING DOCUMENT
### **📋 METODOLOGIA V8.0 UNIFIED - WORKING DOCUMENT**

## 🎯 **TRANSFORMAÇÃO ESTRATÉGICA**

### **❌ SITUAÇÃO ANTERIOR:**
- Gerador simples de ideias pontuais
- Interface básica com abas (7 tabs)
- Usuários free e pagos com mesmas funcionalidades
- Output: lista de ideias individuais
- Foco: quantidade de ideias geradas

### **✅ NOVA VISÃO ESTRATÉGICA:**
- **Content Strategy Planner** completo
- **Interface conversacional** como core UX
- **Feature premium** exclusiva (Pro/Enterprise R$ 29+/mês)
- **Output: escopo estratégico** multi-plataforma
- **Foco: estratégia e execução** end-to-end

---

## ✅ **DECISÕES TOMADAS**

### **🔒 PAYWALL STRATEGY:**
- ✅ Feature **exclusiva para usuários pagantes** (Pro/Enterprise R$ 29+/mês)
- ✅ Tela de upgrade para usuários free com value proposition
- ✅ Qualificação detalhada do perfil do usuário como onboarding

### **💬 INTERFACE DESIGN:**
- ✅ **Chat conversacional** como interface principal
- ✅ IA faz perguntas para entender contexto profundo
- ✅ Substituir wizard de 3 etapas por conversação natural
- ✅ Output estruturado baseado na conversa

### **📋 ESCOPO GERADO:**
- ✅ **Estratégia completa** por rede social escolhida
- ✅ **Editável pelo usuário** após geração
- ✅ **Foco inicial:** texto + imagem (sem vídeo por enquanto)
- ✅ **Multi-platform strategy** integrada

---

## 🔄 **FLUXO DETALHADO (5 ETAPAS)**

### **1️⃣ QUALIFICAÇÃO DO USUÁRIO (Paywall)**
**🎯 Objetivo:** Entender profundamente quem é o usuário

**📋 Dados a Coletar:**
- [ ] **Profissão/Expertise:** Advogado, consultor, médico, coach, etc.
- [ ] **Nicho de atuação:** Marketing jurídico, produtividade, saúde
- [ ] **Experiência em conteúdo:** Iniciante, intermediário, avançado
- [ ] **Tempo disponível:** Horas/semana para produção
- [ ] **Recursos atuais:** Designer, ferramentas, orçamento
- [ ] **Objetivos:** Autoridade, vendas, networking, educação

### **2️⃣ CONVERSAÇÃO ESTRATÉGICA**
**🎯 Objetivo:** Capturar ideias e refinar intenção

**💭 Conversa Natural:**
- [ ] "Sobre o que você quer criar conteúdo?"
- [ ] "Qual problema você resolve para seus clientes?"
- [ ] "Que tipo de resultado você espera?"
- [ ] **IA faz follow-ups inteligentes** baseados nas respostas

### **3️⃣ GERAÇÃO DE ESCOPO**
**🎯 Objetivo:** Produzir estratégia executável

**📋 Output Estruturado:**
- [ ] **Pilares de conteúdo** (3-5 temas principais)
- [ ] **Tom de voz** e posicionamento
- [ ] **Frequência** de publicação
- [ ] **Tipos de post** para cada rede

### **4️⃣ ESTRATÉGIA MULTI-PLATAFORMA**
**🎯 Objetivo:** Adaptar para cada rede social

**📱 Por Rede Social:**
- [ ] **Instagram:** Stories, feed, reels (texto/imagem)
- [ ] **LinkedIn:** Posts profissionais, artigos
- [ ] **Twitter/X:** Threads, posts únicos
- [ ] **Facebook:** Posts, grupos
- [ ] **YouTube Community:** Posts de texto/imagem

### **5️⃣ REFINAMENTO COLABORATIVO**
**🎯 Objetivo:** Permitir edição e personalização

**✏️ Funcionalidades:**
- [ ] **Editor inline** para cada seção
- [ ] **Regenerar seções específicas**
- [ ] **Salvar versões** do escopo
- [ ] **Exportar para próximas etapas** (calendário, produção)

---

## 🤔 **QUESTÕES EM ABERTO**

### **📋 PARA DISCUSSÃO:**
- [ ] **Limite de escopos** por usuário/mês?
- [ ] **Integração com calendário** editorial já na V2.0?
- [ ] **Template system** para acelerar geração?
- [ ] **Histórico de escopos** - como organizar?
- [ ] **Colaboração** - usuário pode compartilhar escopo?

### **🛠️ ASPECTOS TÉCNICOS:**
- [ ] **Storage** dos escopos gerados
- [ ] **Versioning** system para edições
- [ ] **Export formats** (PDF, JSON, planilha?)
- [ ] **Integração** com outras features do sistema

---

## 📝 **PRÓXIMOS PASSOS**

### **🎯 IMEDIATOS:**
1. [✅] **Definir questões em aberto** com stakeholder
2. [🔄] **Wireframing** das 5 etapas no Storybook - 3/6 COMPLETOS
3. [ ] **Specs técnicas** detalhadas
4. [ ] **Plan de implementação** Phase 1

---

## 🎨 **WIREFRAMING STRATEGY - ETAPA 1 QUALIFICAÇÃO**

### **📱 ESTRUTURA DE WIREFRAMES (6 telas):**
1. **SocialMediaInput** - Captura @username das redes
2. **AIAnalysisLoading** - Loading inteligente com insights em tempo real
3. **AIInsightsDisplay** - Apresentação visual da análise
4. **ConversationalChat** - Interface de chat para perguntas contextualizadas
5. **ManualFallback** - Formulário para cenários sem dados
6. **ProfileSummary** - Confirmação e edição do perfil construído

### **🛠️ IMPLEMENTAÇÃO NO STORYBOOK:**
```
src/pages/BancoDeIdeias/components/Qualification/
├── SocialMediaInput.tsx + .stories.tsx
├── AIAnalysisLoading.tsx + .stories.tsx
├── AIInsightsDisplay.tsx + .stories.tsx
├── ConversationalChat.tsx + .stories.tsx
├── ManualFallback.tsx + .stories.tsx
├── ProfileSummary.tsx + .stories.tsx
└── QualificationFlow.tsx (container) + .stories.tsx
```

### **🔄 FALLBACK STRATEGY IMPLEMENTADA:**
- 🟢 **Perfil Completo:** Análise + 2-3 perguntas
- 🟡 **Perfil Limitado:** Análise básica + 5-7 perguntas
- 🟠 **Perfil Privado:** Manual fallback
- 🔴 **Sem Redes:** Formulário tradicional otimizado

### **🔄 ITERAÇÃO CONTÍNUA:**
- **Este documento será atualizado** conforme refinamos a estratégia
- **Seções serão expandidas** quando tomarmos decisões
- **Links para wireframes** serão adicionados quando criados

---

**📅 Última atualização:** 2025-01-16 | **🤖 IA Alpha** | **📊 Status:** Working Document Ativo

---

## 🎨 **WIREFRAMES IMPLEMENTADOS - STORYBOOK**

### **✅ COMPONENTES CRIADOS (3/6):**

#### **1. SocialMediaInput** ✅
- **Localização:** `src/pages/BancoDeIdeias/components/Qualification/SocialMediaInput.tsx`
- **Stories:** 7 cenários (Default, Loading, ValidationErrors, etc.)
- **Funcionalidades:** Validação em tempo real, múltiplas redes, fallback
- **UX:** Progress header, validação visual, privacy notice

#### **2. AIAnalysisLoading** ✅  
- **Localização:** `src/pages/BancoDeIdeias/components/Qualification/AIAnalysisLoading.tsx`
- **Stories:** 6 cenários (Default, PowerUser, BeginnerUser, etc.)
- **Funcionalidades:** 5 steps sequenciais, insights em tempo real, countdown
- **UX:** Progress visual, real-time feedback, step-by-step

#### **3. AIInsightsDisplay** ✅
- **Localização:** `src/pages/BancoDeIdeias/components/Qualification/AIInsightsDisplay.tsx`
- **Stories:** 6 cenários (HighConfidence, MediumConfidence, LowConfidence, etc.)
- **Funcionalidades:** Análise visual, confidence score, insights categorizados
- **UX:** Cards organizados, color coding, interactive insights

### **🔄 PRÓXIMOS WIREFRAMES:**
- [ ] **ConversationalChat** - Interface de chat para perguntas contextualizadas
- [ ] **ManualFallback** - Formulário para cenários sem dados  
- [ ] **ProfileSummary** - Confirmação e edição do perfil construído

### **📊 ACESSO NO STORYBOOK:**
```
npm run storybook
Navegar para: Banco de Ideias V2 > Qualification
```

### **🎯 RESULTADO ATUAL:**
**3 wireframes funcionais** prontos para validação visual, com **19 stories** cobrindo diferentes cenários de uso (usuário expert, iniciante, mobile, etc.).

**Próximo:** Completar wireframes restantes ou partir para implementação dos 3 primeiros. 