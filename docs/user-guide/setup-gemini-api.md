# 🤖 Configuração da API Gemini - Roteirizar IA

## 🎯 Objetivo
Este guia irá te ajudar a configurar a **API do Gemini AI** para usar a geração real de roteiros com IA no Roteirizar IA.

---

## 📋 **Pré-requisitos**
- Conta no Google (Gmail)
- Acesso à Internet
- 5 minutos para configuração

---

## 🔑 **Passo 1: Obter API Key do Gemini**

### **1.1 Acessar Google AI Studio**
1. Acesse: [https://aistudio.google.com/](https://aistudio.google.com/)
2. Faça login com sua conta Google
3. Aceite os termos de uso

### **1.2 Criar API Key**
1. No menu lateral, clique em **"API key"** 
2. Clique em **"Create API key"**
3. Escolha um projeto ou crie um novo
4. Clique em **"Create API key in new project"**
5. **COPIE** a API key gerada (algo como: `AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

⚠️ **IMPORTANTE:** Guarde esta chave em local seguro! Ela não será mostrada novamente.

---

## 🚀 **Passo 2: Configurar no Roteirizar IA**

### **Método 1: Configuração Automática (Recomendado)**
1. Abra o **Roteirizar IA** no navegador
2. Clique em **"Gerar Roteiro"** 
3. Cole sua API key quando solicitado
4. A chave será salva automaticamente

### **Método 2: Configuração Manual**
1. Abra o **Console do Navegador** (F12)
2. Digite: `localStorage.setItem("GEMINI_API_KEY", "sua_api_key_aqui")`
3. Substitua `"sua_api_key_aqui"` pela sua API key real
4. Pressione Enter

**Exemplo:**
```javascript
localStorage.setItem("GEMINI_API_KEY", "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
```

### **Método 3: Arquivo .env (Para desenvolvedores)**
1. Crie arquivo `.env` na raiz do projeto
2. Adicione: `VITE_GEMINI_API_KEY=sua_api_key_aqui`
3. Reinicie o servidor de desenvolvimento

---

## ✅ **Passo 3: Testar Configuração**

### **Teste Rápido**
1. No formulário, preencha:
   - **Assunto:** "Como fazer café perfeito"
   - **Plataforma:** YouTube Shorts
   - **Duração:** 60 segundos

2. Clique em **"Gerar Roteiro"**

3. **Resultado esperado:** 
   - Loading aparece (~3-10 segundos)
   - Roteiro real gerado pela IA aparece
   - Conteúdo único e personalizado

### **❌ Problemas Comuns**

| Erro | Solução |
|------|---------|
| "API Key necessária" | Configure a API key seguindo Passo 2 |
| "Erro 400" | API key inválida - verifique se copiou corretamente |
| "Erro 403" | API key sem permissão - verifique se foi gerada corretamente |
| "Timeout" | Problema de rede - tente novamente |

---

## 🔒 **Segurança da API Key**

### **✅ Boas Práticas**
- **Nunca compartilhe** sua API key publicamente
- **Não commit** a key em repositórios Git
- **Configure cotas** no Google Cloud Console se necessário
- **Regenere** a key se suspeitar de comprometimento

### **🎛️ Configurar Limites (Opcional)**
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Navegue para **APIs & Services > Credentials**
3. Clique na sua API key
4. Configure **"Application restrictions"** e **"API restrictions"**

---

## 💰 **Custos e Limites**

### **Gemini 1.5 Flash (Usado pelo Roteirizar IA)**
- **Gratuito:** 15 requests por minuto
- **Gratuito:** 1 million tokens por dia
- **Pago:** $0.075 por 1M input tokens, $0.30 por 1M output tokens

### **Estimativa de Uso**
- **1 roteiro** ≈ 1,000-3,000 tokens
- **Uso normal:** ~50-100 roteiros gratuitos por dia
- **Uso intensivo:** Considere plano pago

---

## 🔧 **Troubleshooting Avançado**

### **Verificar Status da API Key**
```javascript
// Cole no console do navegador
const apiKey = localStorage.getItem("GEMINI_API_KEY");
console.log("API Key configurada:", apiKey ? "✅ Sim" : "❌ Não");
```

### **Testar API Diretamente**
```javascript
// Cole no console do navegador (substitua YOUR_API_KEY)
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Diga olá!" }] }]
  })
})
.then(r => r.json())
.then(d => console.log("Teste API:", d))
.catch(e => console.error("Erro:", e));
```

### **Limpar Configuração**
```javascript
// Para reconfigurar a API key
localStorage.removeItem("GEMINI_API_KEY");
```

---

## 🎉 **Pronto!**

Agora você tem acesso à **geração real de roteiros com IA**! 

### **Próximos Passos:**
1. 📝 **Crie roteiros** incríveis para suas redes sociais
2. 🎨 **Explore** diferentes tons e estilos
3. 📊 **Monitore** seus gastos na API se necessário
4. 🚀 **Compartilhe** roteiros incríveis gerados!

---

**Links Úteis:**
- [Google AI Studio](https://aistudio.google.com/)
- [Documentação Gemini API](https://ai.google.dev/docs)
- [Pricing Gemini API](https://ai.google.dev/pricing)
- [Suporte Roteirizar IA](../user-guide/faq.md)

---

*Configuração criada em 22 de Janeiro de 2025*  
*Versão: Gemini 1.5 Flash* 