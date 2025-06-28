# 🤖 PROMPT COORDENAÇÃO 3 IAs - SISTEMA MULTI AI

## INSTRUÇÃO OBRIGATÓRIA PARA QUALQUER IA TRABALHANDO NESTE PROJETO:

### ANTES DE INICIAR QUALQUER TRABALHO:

```
PROTOCOLO DE COORDENAÇÃO MULTI-AI ATIVA:
1. 📋 LER: COORDENACAO_MULTI_AI.md (status atual do projeto)
2. 📊 VERIFICAR: AI_STATUS_TRACKER.json (status das 3 IAs)
3. 🔍 VERIFICAR: Tabela de arquivos para conflitos
4. 🎯 DECLARAR: Sua intenção de trabalho nos arquivos de coordenação
5. 🤝 SEGUIR: Especialização definida (Backend/Frontend/DevOps)
```

### CONTEXTO DO PROJETO:
- **Sistema:** Roteirar IA - Gerador de roteiros com IA
- **Colaboração:** Até 3 IAs trabalhando simultaneamente  
- **Metodologia:** Triple Track System com especialização coordenada
- **Arquivos chave:** SimpleUserDashboard.tsx, HomePage.tsx, SystemDashboard

### IDENTIFIQUE SUA ESPECIALIZAÇÃO:

#### 🏗️ SE VOCÊ É IA A - BACKEND/ARCHITECTURE:
- **Responsabilidade:** Architecture, admin system, core services, database
- **Foco atual:** SystemDashboard expansion, role-based access
- **Evitar:** Frontend specifics, mobile UX, testing automation

#### 🎨 SE VOCÊ É IA B - FRONTEND/UX:
- **Responsabilidade:** User experience, auth flow, responsive design, mobile
- **Foco atual:** SimpleUserDashboard review, mobile optimization
- **Evitar:** Backend architecture, infrastructure, testing frameworks

#### 🛠️ SE VOCÊ É IA C - DEVOPS/QA:
- **Responsabilidade:** Testing, CI/CD, infrastructure, quality assurance
- **Foco prioritário:** Reativar 28 arquivos de teste, setup CI/CD pipeline
- **Evitar:** Frontend design, backend business logic

### ARQUIVO DE STATUS EM TEMPO REAL:
**AI_STATUS_TRACKER.json** contém:
- Status atual de cada IA
- Arquivo sendo trabalhado
- Próximos focos
- Especialização definida
- Trabalhos recentes

### COMANDOS DE COORDENAÇÃO MULTI-AI:

#### INICIAR TRABALHO:
```
🤖 STATUS UPDATE - [IA A/B/C]
📁 Working on: [arquivo]
🎯 Goal: [objetivo]
⏱️ ETA: [tempo estimado]
🔄 Status: STARTING
👥 Other IAs: [verificar se estão trabalhando em arquivos relacionados]
```

#### FINALIZAR TRABALHO:
```
🤖 WORK COMPLETED - [IA A/B/C]
📁 File: [arquivo]
✅ Completed: [o que foi feito]
📋 Next: [próximos passos ou handoff]
🔄 Status: DONE
🤝 Handoff to: [qual IA deve revisar/continuar]
```

#### COORDENAÇÃO NECESSÁRIA:
```
🚨 COORDINATION NEEDED - [IA A/B/C]
📁 Files: [arquivos que precisam de múltiplas IAs]
⚠️ Issue: [descrição da necessidade de coordenação]
👥 IAs needed: [quais IAs devem participar]
💬 Proposal: [sugestão de resolução]
```

### TRACK ASSIGNMENTS ATUALIZADOS:

#### **TRACK 1: UX & INTERFACE (IA A + IA B)**
- ✅ **Concluído:** HomePage auth flow + dashboard simplification
- 🔄 **Em andamento:** IA B reviewing SimpleUserDashboard
- ⏳ **Próximo:** Integration testing

#### **TRACK 2: ADMIN SYSTEM (IA A LEAD)**
- 🔄 **Em andamento:** SystemDashboard expansion
- ⏳ **Próximo:** Role-based access implementation
- 🤝 **Colaboração:** IA B review de UX quando pronto

#### **TRACK 3: INFRASTRUCTURE (IA C LEAD)**
- ⏳ **Próximo:** Reativar suite de testes (28 arquivos)
- ⏳ **Paralelo:** CI/CD pipeline setup
- 🤝 **Colaboração:** IA A para integration, IA B para E2E testing

### MERGE STRATEGY PARA 3 IAs:
- **PRESERVAR** trabalho de todas as IAs
- **COMBINAR** soluções complementares
- **ESCALONAR** conflitos para discussão multi-AI
- **DOCUMENTAR** decisões em COORDENACAO_MULTI_AI.md
- **TESTAR** integração entre todos os trabalhos

### ARQUIVOS QUE REQUEREM COORDENAÇÃO MULTI-AI:
- `src/App.tsx` - Routing + lazy loading (IA A + IA C)
- `src/pages/*.tsx` - UX + testing (IA B + IA C)
- `src/services/*.ts` - Backend + performance (IA A + IA C)
- `tests/**/*` - Todos os testes (IA C lead, outras reviewam)
- `package.json` - Dependencies (IA C lead, outras consultam)

### WORKFLOW MULTI-AI RECOMENDADO:
1. **Check status:** AI_STATUS_TRACKER.json + COORDENACAO_MULTI_AI.md
2. **Declare intent:** Update both coordination files
3. **Execute work:** Focus on your specialization
4. **Cross-review:** When work affects other specializations
5. **Document changes:** Update status and rationale
6. **Integration test:** Verify compatibility with all other work
7. **Handoff:** Mark work as done, suggest next steps

### SUCCESS INDICATORS MULTI-AI:
- ✅ Zero conflitos destrutivos entre 3 IAs
- ✅ Trabalho complementar aproveitando cada especialização
- ✅ Documentation completa de todas as mudanças
- ✅ Review cruzado em features que afetam múltiplas áreas
- ✅ Integration testing coordenado
- ✅ Handoffs eficientes entre especializações

### EMERGENCY PROTOCOLS:
- **Conflito ativo:** STOP e coordinate em COORDENACAO_MULTI_AI.md
- **Arquivo bloqueado:** Check AI_STATUS_TRACKER.json para resolver
- **Dependência circular:** Escalate para discussão entre todas as IAs
- **Breaking change:** Notify all IAs immediately

**🤝 PRINCÍPIO FUNDAMENTAL:** 3 especialistas colaborando > 1 generalista trabalhando sozinho

**⚡ RESULTADO ESPERADO:** Produto superior através de especialização coordenada entre arquitetura, UX e infraestrutura! 