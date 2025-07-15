# 🚀 **EXECUTAR STORYBOOK - LOCALHOST:6006**

## 📋 **COMANDO PARA EXECUÇÃO IMEDIATA:**

### **Opção 1 - Script Automático:**
```bash
cd /Users/rogerioresende/Desktop/Roteirar-ia
chmod +x start-storybook.sh
./start-storybook.sh
```

### **Opção 2 - Comandos Manuais:**
```bash
cd /Users/rogerioresende/Desktop/Roteirar-ia

# 1. Instalar dependências
npm install --save-dev @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-docs

# 2. Iniciar Storybook
npm run storybook
```

---

## 🌐 **ACESSO:**

**URL:** http://localhost:6006

---

## 📚 **O QUE VOCÊ VERÁ:**

### **🎨 Design System / Design Tokens:**
- **Color Palettes:** Primary, Accent, Warm colors
- **Typography System:** Inter font hierarchy  
- **Spacing Grid:** 4px base system
- **Shadow System:** Glass-morphism + colored shadows
- **Usage Guidelines:** Como usar cada token

### **🔘 Design System / Components / Button:**
- **Primary Button:** Gradiente moderno com hover effects
- **Secondary Button:** Outline style com animações
- **Ghost Button:** Subtle interactions
- **Button with Icons:** Examples com emojis
- **Loading States:** Animations de carregamento
- **Size Variations:** Small, Medium, Large
- **Interactive Examples:** Test real functionality

### **🗃️ Design System / Components / Card:**
- **Default Card:** Container básico
- **Elevated Card:** Enhanced shadows
- **Interactive Card:** Hover animations
- **Idea Card Example:** Banco de Ideias real use case
- **Budget Card Example:** Status de orçamento
- **Analytics Card Example:** Métricas dashboard
- **Responsive Grid:** Layout examples

---

## ✅ **VALIDAÇÃO:**

Ao acessar http://localhost:6006, você deve ver:

- [ ] **Sidebar esquerda** com navegação do Design System
- [ ] **Design Tokens page** carregando com cores visíveis
- [ ] **Button stories** todas funcionais
- [ ] **Card stories** com examples reais
- [ ] **Interactive controls** (knobs) funcionando
- [ ] **Code examples** copy-pasteable
- [ ] **Documentation** formatada e legível

---

## 🔧 **TROUBLESHOOTING:**

### **Se o Storybook não iniciar:**
```bash
# Verificar versão do Node (deve ser >=16)
node --version

# Limpar cache e reinstalar
npm run clean
npm install
npm run storybook
```

### **Se a porta 6006 estiver ocupada:**
```bash
# Verificar o que está usando a porta
lsof -i :6006

# Matar processo se necessário
kill -9 <PID>

# Ou usar porta diferente
npx storybook dev -p 6007
```

---

## 🎯 **RESULTADO ESPERADO:**

**🌟 Storybook V7.5 Enhanced completamente funcional**

- Design System documentado visualmente
- Components interativos e testáveis  
- Examples práticos copy-pasteable
- Documentation profissional

**🎉 EXECUTE O COMANDO ACIMA E VISUALIZE NO BROWSER!**