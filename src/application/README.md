# Application Layer - Clean Architecture

## 🎯 Objetivo
A camada Application coordena os casos de uso e controla o fluxo de dados entre Domain e Infrastructure.

## 📁 Estrutura

### `/services/`
- **Propósito:** Serviços de aplicação que orquestram casos de uso
- **Conteúdo:** Lógica de coordenação entre entidades
- **Exemplos:** AIService, VoiceService, TemplateService

### `/dto/`
- **Propósito:** Data Transfer Objects para comunicação entre camadas
- **Conteúdo:** Objetos simples para transferência de dados
- **Exemplos:** CreateScriptDTO, VoiceConfigDTO, TemplateDTO

### `/interfaces/`
- **Propósito:** Contratos para serviços de aplicação
- **Conteúdo:** Interfaces que definem contratos de serviços
- **Exemplos:** IAIService, IVoiceService, IAnalyticsService

## 🔄 Responsabilidades
- ✅ Coordenar casos de uso do Domain
- ✅ Definir contratos para Infrastructure
- ✅ Gerenciar fluxo de dados entre camadas
- ✅ Implementar validações de aplicação

## 🎯 Roteirar IA V6.4
Esta camada será crucial para implementar os 20 serviços consolidados que substituirão os 49 serviços atuais, mantendo todas as 50+ features funcionando. 