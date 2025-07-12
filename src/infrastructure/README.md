# Infrastructure Layer - Clean Architecture

## 🎯 Objetivo
A camada Infrastructure implementa detalhes técnicos e integrações com sistemas externos.

## 📁 Estrutura

### `/adapters/`
- **Propósito:** Adaptadores para sistemas externos
- **Conteúdo:** Implementações concretas dos contratos do Application
- **Exemplos:** FirebaseAdapter, GeminiAdapter, ElevenLabsAdapter

### `/config/`
- **Propósito:** Configurações do sistema
- **Conteúdo:** Configurações de ambiente, APIs, etc.
- **Exemplos:** environment.ts, apiConfig.ts, production.ts

### `/external/`
- **Propósito:** Integrações com APIs e serviços externos
- **Conteúdo:** Clientes para APIs externas
- **Exemplos:** geminiClient.ts, elevenLabsClient.ts, clarityClient.ts

## 🔌 Responsabilidades
- ✅ Implementar interfaces definidas no Application
- ✅ Gerenciar configurações de ambiente
- ✅ Integrar com APIs e serviços externos
- ✅ Implementar persistência de dados

## 🎯 Roteirar IA V6.4
Esta camada conterá os adaptadores que permitirão migrar gradualmente os 49 serviços atuais para a nova arquitetura, mantendo compatibilidade total. 