# 🔧 SETUP COMPLETO DA INTEGRAÇÃO TALLY.SO

## 📋 **APÓS CRIAR OS FORMULÁRIOS, SIGA ESTES PASSOS:**

### **PASSO 1: Coletar IDs dos Formulários**

Para cada formulário criado no Tally.so:
1. Clique em **"Share"** no formulário
2. Copie o link público (ex: `https://tally.so/r/abc123def`)
3. O ID é a parte final: `abc123def`

### **PASSO 2: Configurar .env.local**

Crie/edite o arquivo `.env.local` na raiz do projeto:

```bash
# Microsoft Clarity (já configurado)
VITE_CLARITY_PROJECT_ID=s05cslzjy5

# Tally.so Forms - SUBSTITUIR pelos IDs reais
VITE_TALLY_FORM_FEEDBACK=SEU_ID_FEEDBACK_AQUI
VITE_TALLY_FORM_NPS=SEU_ID_NPS_AQUI
VITE_TALLY_FORM_FEATURES=SEU_ID_FEATURES_AQUI
VITE_TALLY_FORM_BUGS=SEU_ID_BUGS_AQUI

# Exemplo preenchido:
# VITE_TALLY_FORM_FEEDBACK=mJrRPl
# VITE_TALLY_FORM_NPS=3jABcD
# VITE_TALLY_FORM_FEATURES=9xYz12
# VITE_TALLY_FORM_BUGS=7qWeRt
```

### **PASSO 3: Configurar Vercel (Produção)**

No dashboard do Vercel, adicione as variáveis:
1. Acesse: Projeto → Settings → Environment Variables
2. Adicione cada uma:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_TALLY_FORM_FEEDBACK` | `seu_id_feedback` | Production, Preview |
| `VITE_TALLY_FORM_NPS` | `seu_id_nps` | Production, Preview |
| `VITE_TALLY_FORM_FEATURES` | `seu_id_features` | Production, Preview |
| `VITE_TALLY_FORM_BUGS` | `seu_id_bugs` | Production, Preview |

### **PASSO 4: Testar Integração**

Após configurar as variáveis:

```bash
# 1. Reiniciar servidor local
npm run dev

# 2. Abrir console no browser (F12)
# 3. Testar status do Tally:
TallyService.getStatus()

# 4. Testar abertura de formulário:
TallyService.openFeedbackForm()
```

### **PASSO 5: Verificar se Funcionou**

✅ **Checklist de Verificação:**
- [ ] Console mostra status OK para Tally
- [ ] Botão "Feedback" aparece na navbar
- [ ] Formulários abrem corretamente
- [ ] Submissions chegam no Tally.so
- [ ] Emails de notificação funcionam

---

## 🚀 **COMANDOS PARA EXECUÇÃO IMEDIATA**

Depois de ter os IDs, execute estes comandos na sequência:

```bash
# 1. Criar arquivo .env.local
echo "VITE_CLARITY_PROJECT_ID=s05cslzjy5" > .env.local
echo "VITE_TALLY_FORM_FEEDBACK=SEU_ID_FEEDBACK" >> .env.local
echo "VITE_TALLY_FORM_NPS=SEU_ID_NPS" >> .env.local
echo "VITE_TALLY_FORM_FEATURES=SEU_ID_FEATURES" >> .env.local
echo "VITE_TALLY_FORM_BUGS=SEU_ID_BUGS" >> .env.local

# 2. Reiniciar servidor
npm run dev

# 3. Testar build
npm run build

# 4. Deploy atualizado
vercel --prod
```

---

## 📝 **EXEMPLO DE IDs REAIS**

Quando você tiver os IDs, substitua no .env.local:

```bash
# ❌ ANTES (placeholders)
VITE_TALLY_FORM_FEEDBACK=SEU_ID_FEEDBACK

# ✅ DEPOIS (ID real do Tally)
VITE_TALLY_FORM_FEEDBACK=mJrRPl
```

---

## 🐛 **TROUBLESHOOTING**

### **Problema: Formulários não abrem**
```bash
# Verificar se variáveis estão carregadas
console.log(import.meta.env.VITE_TALLY_FORM_FEEDBACK)

# Se retornar undefined:
# 1. Verificar se .env.local existe
# 2. Reiniciar servidor (npm run dev)
# 3. Verificar se IDs estão corretos
```

### **Problema: Botão Feedback não aparece**
```bash
# Verificar inicialização do TallyService
TallyService.getStatus()

# Se enabled = false:
# 1. Verificar environment (deve ser production)
# 2. Verificar se todas as 4 variáveis estão definidas
```

### **Problema: Submissions não chegam**
1. Verificar se IDs estão corretos no Tally.so
2. Verificar configurações de notificação no Tally
3. Testar formulários diretamente no Tally.so

---

## ✅ **TESTE FINAL COMPLETO**

Após tudo configurado, teste:

```bash
# 1. Status dos serviços
ClarityService.getStatus()
TallyService.getStatus()

# 2. Abrir formulários
TallyService.openFeedbackForm()
TallyService.openNPSForm()
TallyService.openFeaturesForm()
TallyService.openBugForm()

# 3. Verificar eventos no Clarity
# (aguardar 5-10 minutos e verificar no dashboard do Clarity)
```

---

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ **Criar formulários** usando o template acima
2. ✅ **Coletar IDs** de cada formulário
3. ✅ **Configurar .env.local** com IDs reais
4. ✅ **Testar localmente** (npm run dev)
5. ✅ **Configurar Vercel** com variáveis
6. ✅ **Deploy e testar** em produção

**Tempo estimado:** 30-45 minutos para criar todos os formulários + 10 minutos para configuração 