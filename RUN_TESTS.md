# 🚀 **EXECUTAR TESTES V7.5 ENHANCED**

## 📋 **COMANDOS PARA EXECUÇÃO:**

### **1. Instalar Dependências Storybook:**
```bash
cd /Users/rogerioresende/Desktop/Roteirar-ia

npm install --save-dev @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-docs
```

### **2. Executar Aplicação Principal (Terminal 1):**
```bash
npm run dev
```
**🌐 Acesso:** http://localhost:5173  
**📍 Navegar:** Banco de Ideias para ver V7.0 Enhanced

### **3. Executar Storybook (Terminal 2):**
```bash
npm run storybook
```
**🌐 Acesso:** http://localhost:6006  
**📍 Navegar:** Design System > Design Tokens

---

## ✅ **CHECKLIST DE VALIDAÇÃO:**

### **📱 Aplicação Principal (V7.0):**
- [ ] **Background:** Gradiente moderno azul
- [ ] **Cards:** Glass-morphism com blur effects
- [ ] **Buttons:** Gradientes e hover animations
- [ ] **Typography:** Font Inter carregada
- [ ] **Shadows:** Colored shadows em hover
- [ ] **Navigation:** Glass navbar com blur

### **📚 Storybook Documentation (V7.5):**
- [ ] **Design Tokens:** Color palettes visíveis
- [ ] **Typography:** Hierarquia documentada
- [ ] **Spacing:** Grid system visual
- [ ] **Shadows:** Glass-morphism examples
- [ ] **Button Stories:** 10+ variants funcionais
- [ ] **Card Stories:** Examples reais (Idea, Budget, Analytics)
- [ ] **Interactive Controls:** Knobs funcionando
- [ ] **Code Examples:** Copy-paste ready

---

## 🎯 **RESULTADO ESPERADO:**

### **V7.0 Enhanced Interface:**
**Before:** Interface básica, sombras simples  
**After:** Glass-morphism, colored shadows, modern gradients

### **V7.5 Design Documentation:**
**Problem:** Falta de desenhos de telas documentados  
**Solution:** Storybook completo com design system visual

---

## 🔧 **SCRIPT DE EXECUÇÃO AUTOMÁTICA:**

Se preferir executar tudo automaticamente:

```bash
chmod +x test-v75.sh
./test-v75.sh
```

O script irá:
1. Instalar dependências Storybook
2. Iniciar aplicação principal (porta 5173)
3. Iniciar Storybook (porta 6006)
4. Mostrar URLs de acesso

---

**🎉 PRONTO PARA VALIDAÇÃO!**

Execute os comandos acima e valide ambas as implementações nos browsers.