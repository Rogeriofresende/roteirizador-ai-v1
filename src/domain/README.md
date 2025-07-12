# Domain Layer - Clean Architecture

## 🎯 Objetivo
A camada Domain contém as regras de negócio e entidades principais do sistema, independente de frameworks ou tecnologias específicas.

## 📁 Estrutura

### `/entities/`
- **Propósito:** Entidades principais do domínio
- **Conteúdo:** Classes/interfaces que representam objetos de negócio
- **Exemplos:** User, Script, Template, VoiceConfig, AIProvider

### `/usecases/`
- **Propósito:** Casos de uso e regras de negócio
- **Conteúdo:** Lógica de negócio independente de tecnologia
- **Exemplos:** GenerateScript, ManageTemplates, ProcessVoice

### `/repositories/`
- **Propósito:** Interfaces para acesso a dados
- **Conteúdo:** Contratos para persistência (implementação na Infrastructure)
- **Exemplos:** IUserRepository, IScriptRepository, ITemplateRepository

## 🔒 Regras
- ❌ Não pode depender de outras camadas
- ❌ Não pode conter lógica de frameworks
- ❌ Não pode conter detalhes de implementação
- ✅ Deve ser independente de tecnologia
- ✅ Deve conter apenas lógica de negócio pura

## 🎯 Roteirar IA V6.4
Esta camada será fundamental para consolidar os 49 serviços atuais em 20 serviços clean, mantendo a lógica de negócio separada da implementação. 