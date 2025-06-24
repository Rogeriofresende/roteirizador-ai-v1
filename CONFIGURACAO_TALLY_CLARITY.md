# Configuração Tally.so + Microsoft Clarity

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```bash
# Microsoft Clarity
VITE_CLARITY_PROJECT_ID=your_clarity_project_id_here

# Tally.so Forms
VITE_TALLY_FORM_FEEDBACK=your_tally_feedback_form_id
VITE_TALLY_FORM_NPS=your_tally_nps_form_id
VITE_TALLY_FORM_FEATURES=your_tally_features_form_id
VITE_TALLY_FORM_BUGS=your_tally_bugs_form_id
```

## Microsoft Clarity - Setup

### 1. Criar Conta e Projeto
1. Acesse: https://clarity.microsoft.com/
2. Faça login com sua conta Microsoft
3. Clique em "Create new project"
4. Configure:
   - **Site URL**: https://roteirar-ia.com
   - **Project name**: Roteirar IA Pro
   - **Category**: Education & Reference

### 2. Obter Project ID
1. No dashboard do Clarity, vá em **Settings > Setup**
2. Copie o **Project ID** (ex: `abc123def`)
3. Adicione ao `.env.local`:
   ```bash
   VITE_CLARITY_PROJECT_ID=abc123def
   ```

### 3. Configurar Objetivos
No Clarity dashboard:
- **Recordings**: Manter padrão (100% dos usuários)
- **Heatmaps**: Configurar para páginas principais
- **Privacy**: Mascarar informações sensíveis automaticamente

## Tally.so - Setup

### 1. Criar Conta
1. Acesse: https://tally.so/
2. Crie conta gratuita
3. Confirme email

### 2. Criar Formulários

#### Formulário de Feedback Geral
1. **Create form** > **Start from scratch**
2. **Nome**: "Feedback Geral - Roteirar IA"
3. **Campos**:
   - Nome (opcional)
   - Email (opcional)  
   - Como você avalia nossa ferramenta? (Escala 1-5)
   - O que mais gosta na ferramenta?
   - O que podemos melhorar?
   - Sugestões de novas funcionalidades
4. **Settings** > **After submission**: "Thank you! Seu feedback é muito valioso."
5. **Publish** > Copiar Form ID

#### Formulário NPS
1. **Create form** > **Template: NPS Survey**
2. **Personalizar**:
   - Recomendaria o Roteirar IA para um amigo? (0-10)
   - Por que deu essa nota?
   - Como podemos melhorar?
3. **Publish** > Copiar Form ID

#### Formulário de Funcionalidades
1. **Create form** > **Start from scratch**
2. **Nome**: "Pesquisa de Funcionalidades"
3. **Campos**:
   - Quais plataformas você mais usa? (Múltipla escolha)
   - Que tipo de conteúdo você mais cria?
   - Funcionalidades que mais sente falta:
     - [ ] Templates pré-prontos
     - [ ] Colaboração em tempo real
     - [ ] Integração com redes sociais
     - [ ] Análise de performance
     - [ ] Export para mais formatos
     - [ ] Outras (especificar)
4. **Publish** > Copiar Form ID

#### Formulário de Bug Report
1. **Create form** > **Start from scratch**
2. **Nome**: "Reporte de Bugs"
3. **Campos**:
   - Descreva o problema
   - Em que página aconteceu?
   - Quais passos levaram ao erro?
   - Navegador utilizado
   - Screenshot (upload opcional)
   - Email para contato (opcional)
4. **Publish** > Copiar Form ID

### 3. Configurar Variáveis
Adicione os Form IDs ao `.env.local`:
```bash
VITE_TALLY_FORM_FEEDBACK=wABC123
VITE_TALLY_FORM_NPS=wDEF456  
VITE_TALLY_FORM_FEATURES=wGHI789
VITE_TALLY_FORM_BUGS=wJKL012
```

## Testando a Configuração

### 1. Verificar Console (Desenvolvimento)
```javascript
// No console do navegador
clarity.getStatus()
tally.getStatus()
```

### 2. Testar Formulários
- Clique no botão "Feedback" na navbar
- Teste cada tipo de formulário
- Verifique se aparecem no dashboard do Tally

### 3. Verificar Clarity
1. Gere alguns roteiros
2. Navegue pela aplicação
3. Aguarde 10-15 minutos
4. Acesse dashboard do Clarity
5. Verifique se há dados de sessão

## Métricas Importantes

### Microsoft Clarity - KPIs
- **Dead Clicks**: < 3% (cliques em elementos não funcionais)
- **Rage Clicks**: < 2% (cliques repetidos por frustração)  
- **Scroll Depth**: > 70% (usuários rolam a página)
- **Session Recording**: Analisar jornadas problemáticas

### Tally.so - KPIs
- **Response Rate**: > 15% (meta)
- **NPS Score**: > 50 (meta inicial)
- **Feedback Quality**: Categorizar e priorizar sugestões
- **Bug Resolution**: < 48h (meta)

## Analytics Integrados

Os eventos são automaticamente sincronizados entre:
- ✅ Google Analytics 4
- ✅ Microsoft Clarity  
- ✅ Analytics interno (Firebase)
- ✅ Tally.so forms

### Eventos Rastreados no Clarity
- `script_generated` - Geração de roteiros
- `ai_refinement_used` - Uso do editor IA
- `project_saved` - Salvamento de projetos
- `export_completed` - Export de conteúdo  
- `pwa_installed` - Instalação PWA
- `form_interaction` - Interações com formulários

## Troubleshooting

### Clarity não carrega
- Verificar se `VITE_CLARITY_PROJECT_ID` está correto
- Confirmar se está em ambiente de produção
- Verificar console por erros de script

### Tally não aparece
- Verificar se Form IDs estão corretos
- Confirmar se formulários estão publicados
- Testar manualmente: `tally.showGeneralFeedback()`

### Events não aparecem
- Aguardar 10-15 minutos para processamento
- Verificar se analytics está inicializado
- Checar console por erros de integração 