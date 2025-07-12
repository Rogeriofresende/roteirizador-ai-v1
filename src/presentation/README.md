# Presentation Layer - Clean Architecture

## 🎯 Objetivo
A camada Presentation gerencia a interface do usuário e interações, usando os serviços do Application.

## 📁 Estrutura

### `/components/`
- **Propósito:** Componentes React organizados por feature
- **Conteúdo:** Componentes UI que usam serviços via hooks
- **Exemplos:** ScriptGenerator, VoiceSelector, TemplateLibrary

### `/pages/`
- **Propósito:** Páginas principais da aplicação
- **Conteúdo:** Componentes de página que compõem features
- **Exemplos:** HomePage, GeneratorPage, AdminDashboard

### `/hooks/`
- **Propósito:** Custom hooks para integração com Application
- **Conteúdo:** Hooks que conectam UI aos serviços
- **Exemplos:** useAIService, useVoiceService, useTemplate

## 🎨 Responsabilidades
- ✅ Gerenciar estado da UI
- ✅ Conectar componentes aos serviços
- ✅ Implementar validações de entrada
- ✅ Gerenciar UX e interações

## 🎯 Roteirar IA V6.4
Esta camada será reorganizada pela IA Beta na Semana 5, após a consolidação dos serviços, implementando padrões React modernos. 