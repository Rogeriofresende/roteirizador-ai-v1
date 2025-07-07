# 📊 Setup de Tracking - Roteiro Pro

## 🎯 Ferramentas de Analytics Necessárias

### 1. Google Analytics 4 (Obrigatório)
**Setup para**: Website/Landing Page do Roteiro Pro

#### Eventos Personalizados para Configurar:
```javascript
// 1. Chegada via conteúdo orgânico
gtag('event', 'organic_traffic', {
  'source': 'linkedin', // ou 'instagram', 'twitter'
  'campaign': 'pilar_sindrome_impostor',
  'content': 'micro_1_1' // número do micro-conteúdo
});

// 2. Interação com CTA
gtag('event', 'cta_engagement', {
  'cta_type': 'primary', // ou 'secondary'
  'page_section': 'hero' // ou 'middle', 'footer'
});

// 3. Resposta do onboarding
gtag('event', 'onboarding_motivation', {
  'response': 'cansado_editar_chatgpt', // conforme resposta
  'response_category': 'pain_point' // ou 'feature_request'
});

// 4. Tempo na página (engagement)
gtag('event', 'engaged_session', {
  'engagement_time_msec': 30000 // 30 segundos = engajado
});
```

### 2. Microsoft Clarity (Recomendado)
**Setup para**: Análise de comportamento do usuário

#### Configuração:
- Instalar código no site do Roteiro Pro
- Configurar funis de conversão
- Habilitar recordings de sessões
- Setup de heatmaps para landing page

### 3. Planilha de Tracking Manual (Imediato)
**Para começar enquanto configura as outras ferramentas**

## 📈 Planilha de Tracking Semanal

### Aba 1: Métricas de Conteúdo
| Data | Plataforma | Tipo Post | Impressões | Engajamento | Taxa Eng | Comentários | Shares | Cliques |
|------|------------|-----------|------------|-------------|----------|-------------|--------|---------|
| [Data] | LinkedIn | Dor | [#] | [#] | [%] | [#] | [#] | [#] |
| [Data] | LinkedIn | Valor | [#] | [#] | [%] | [#] | [#] | [#] |
| [Data] | LinkedIn | Contraste | [#] | [#] | [%] | [#] | [#] | [#] |
| [Data] | Instagram | História | [#] | [#] | [%] | [#] | [#] | [#] |
| [Data] | Twitter | Dica | [#] | [#] | [%] | [#] | [#] | [#] |

### Aba 2: Funil de Conversão
| Data | Visitantes LP | Taxa Conversão | Signups | Onboarding Completo | Trial Ativo | Feedback Positivo |
|------|---------------|-----------------|---------|---------------------|-------------|-------------------|
| Seg | [#] | [%] | [#] | [#] | [#] | [#] |
| Ter | [#] | [%] | [#] | [#] | [#] | [#] |
| Qua | [#] | [%] | [#] | [#] | [#] | [#] |
| Qui | [#] | [%] | [#] | [#] | [#] | [#] |
| Sex | [#] | [%] | [#] | [#] | [#] | [#] |

### Aba 3: Feedback Qualitativo
| Data | Fonte | Resposta Onboarding | Sentiment | Categoria | Ação Necessária |
|------|-------|---------------------|-----------|-----------|-----------------|
| [Data] | LinkedIn | "Cansado de editar ChatGPT" | Positivo | Pain Point | Usar em case study |
| [Data] | Instagram | "Quero mais autenticidade" | Positivo | Feature | Destacar em copy |
| [Data] | Landing | "Preciso economizar tempo" | Neutro | Benefit | Quantificar economia |

### Aba 4: Análise Semanal
**Template para preenchimento manual:**

```
SEMANA DE [DATA] - ANÁLISE

🎯 DESTAQUES DA SEMANA:
- Post com maior engajamento: [qual e por quê]
- Insight mais valioso do feedback: [qual]
- Maior oportunidade identificada: [qual]

📊 NÚMEROS CONSOLIDADOS:
- Total impressões: [#]
- Taxa engajamento média: [%]
- Visitantes na landing: [#]
- Taxa conversão landing: [%]
- Novos trials: [#]

💡 APRENDIZADOS:
- O que funcionou bem: [3 pontos]
- O que não funcionou: [2 pontos]
- Padrões nos feedbacks: [principais temas]

🎯 AÇÕES PARA PRÓXIMA SEMANA:
- Ajustar: [o que modificar]
- Testar: [nova abordagem]
- Amplificar: [o que funcionou]
```

## 🔧 Ferramentas de Apoio

### 1. Google Forms (Feedback)
**Para**: Capturar feedback adicional

#### Perguntas Sugeridas:
1. "De 1 a 10, qual a probabilidade de recomendar o Roteiro Pro?"
2. "Qual foi sua primeira impressão do produto?"
3. "Que funcionalidade você mais gostaria de ver?"
4. "Como descobriu o Roteiro Pro?"

### 2. Tally.so (Formulários Avançados)
**Para**: Formulários mais elaborados e integrados

#### Setup Recomendado:
- Formulário de onboarding completo
- Survey de satisfação pós-trial
- Formulário de feedback sobre conteúdo

### 3. Zapier (Automação)
**Para**: Conectar ferramentas e automatizar coleta

#### Integrações Úteis:
- Google Forms → Google Sheets (feedback automático)
- Website → Slack (notificação de novos signups)
- Analytics → Email (relatório semanal automático)

## 📱 Tracking de Redes Sociais

### LinkedIn
**Métricas Nativas a Acompanhar:**
- Impressões por post
- Engajamento (likes, comentários, shares)
- Cliques no perfil
- Novos seguidores

**Como Coletar:**
- LinkedIn Creator Tools (se disponível)
- Screenshot manual das métricas
- Planilha semanal consolidada

### Instagram
**Métricas Nativas:**
- Alcance por post
- Engajamento (likes, comentários, saves)
- Visualizações de stories
- Perfil visitados

### Twitter/X
**Métricas Nativas:**
- Impressões por tweet
- Taxa de engajamento
- Cliques em links
- Novos seguidores

## 🎯 Metas de Tracking (Primeira Semana)

### Baseline para Estabelecer:
- **Engajamento médio**: [X]% nos posts
- **Conversão landing**: [X]% de visitantes para trial
- **Tempo na página**: [X] minutos médio
- **Taxa de rejeição**: [X]% na landing page

### Crescimento Esperado (Primeiras 4 semanas):
- **Semana 1**: Estabelecer baseline
- **Semana 2**: +20% no engajamento
- **Semana 3**: +50% em visitantes na landing
- **Semana 4**: +100% em conversões para trial

---

**Status**: Sistema de tracking estruturado
**Próximo**: Criar cronograma detalhado de publicação