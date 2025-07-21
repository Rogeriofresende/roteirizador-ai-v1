#!/usr/bin/env node
/**
 * ⚙️ GENERATE TECHNICAL PLAN SCRIPT
 * 
 * Script automatizado para gerar planos técnicos V9.0 Natural Language First
 * Implementa Metodologia V9.0 - Sistema Revolucionário
 * 
 * @author IA Alpha - Requirements Analyst + Backend
 * @created 2025-07-19T15:30:00Z
 * @methodology V9.0_NATURAL_LANGUAGE_FIRST
 */

const fs = require('fs').promises;
const path = require('path');

// 🎯 CONFIGURAÇÃO DO SCRIPT
const SPECS_DIR = path.join(__dirname, '../specs');
const PLANS_DIR = path.join(__dirname, '../technical-plans');
// const ROTEIRAR_CONTEXT = require('../src/config/roteirarContext');

// 🎨 CORES PARA OUTPUT
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// 🚀 FUNÇÃO PRINCIPAL
async function main() {
  console.log(`${colors.bold}${colors.blue}⚙️ GERADOR DE PLANOS TÉCNICOS V9.0 NATURAL LANGUAGE FIRST${colors.reset}\n`);
  
  try {
    // Garantir que diretório de planos existe
    await ensurePlansDirectory();
    
    // Encontrar especificações validadas
    const specFiles = await findValidatedSpecs();
    
    if (specFiles.length === 0) {
      console.log(`${colors.yellow}⚠️  Nenhuma especificação validada encontrada${colors.reset}`);
      console.log(`💡 Execute: ${colors.bold}npm run spec:validate${colors.reset} para validar especificações`);
      return;
    }
    
    console.log(`📋 Encontradas ${specFiles.length} especificação(ões) para processar\n`);
    
    // Processar cada especificação
    for (const specFile of specFiles) {
      console.log(`${colors.blue}⚙️ Processando: ${specFile}${colors.reset}`);
      
      const technicalPlan = await generateTechnicalPlanFromSpec(specFile);
      const planFile = await saveTechnicalPlan(specFile, technicalPlan);
      
      console.log(`   ✅ Plano técnico gerado: ${colors.bold}${planFile}${colors.reset}`);
      displayPlanSummary(technicalPlan);
      console.log('');
    }
    
    console.log(`${colors.green}🎉 Todos os planos técnicos foram gerados com sucesso!${colors.reset}`);
    console.log(`📁 Planos salvos em: ${colors.bold}technical-plans/${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Erro: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// 📁 GARANTIR QUE DIRETÓRIO DE PLANOS EXISTE
async function ensurePlansDirectory() {
  try {
    await fs.access(PLANS_DIR);
  } catch (error) {
    console.log(`${colors.yellow}📁 Criando diretório technical-plans...${colors.reset}`);
    await fs.mkdir(PLANS_DIR, { recursive: true });
  }
}

// 🔍 ENCONTRAR ESPECIFICAÇÕES VALIDADAS
async function findValidatedSpecs() {
  try {
    const files = await fs.readdir(SPECS_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md') && !file.startsWith('_'));
    
    // Verificar quais especificações são válidas (simulação)
    const validSpecs = [];
    for (const file of mdFiles) {
      const content = await fs.readFile(path.join(SPECS_DIR, file), 'utf8');
      // Verificação básica se é uma especificação V9.0
      if (content.includes('V9.0 Natural Language First') || 
          content.includes('V9.0_NATURAL_LANGUAGE_FIRST') || 
          content.includes('NATURAL LANGUAGE SPECIFICATION') ||
          content.includes('Metodologia:** V9.0')) {
        validSpecs.push(file);
      }
    }
    
    return validSpecs;
  } catch (error) {
    return [];
  }
}

// ⚙️ GERAR PLANO TÉCNICO A PARTIR DA ESPECIFICAÇÃO
async function generateTechnicalPlanFromSpec(specFile) {
  const specPath = path.join(SPECS_DIR, specFile);
  const content = await fs.readFile(specPath, 'utf8');
  
  // Extrair dados da especificação
  const specData = parseSpecification(content);
  
  // Simular processamento agentic (em produção seria o sistema real)
  const technicalPlan = await processWithAgenticEngine(specData);
  
  return technicalPlan;
}

// 📝 PARSER DA ESPECIFICAÇÃO
function parseSpecification(content) {
  const specData = {
    id: extractValue(content, /\*\*ID:\*\*\s*(.+)/),
    title: extractValue(content, /\*\*Título\*\*\s*(.+)/),
    category: extractValue(content, /\*\*Categoria\*\*\s*(.+)/),
    priority: extractValue(content, /\*\*Prioridade\*\*\s*(.+)/),
    complexity: extractValue(content, /\*\*Complexidade\*\*\s*(.+)/),
    timeline: extractValue(content, /\*\*Sprint\/Timeline\*\*\s*(.+)/),
    description: extractSection(content, 'O QUE'),
    justification: extractSection(content, 'POR QUE'),
    userJourney: extractUserJourney(content),
    behaviors: extractBehaviors(content),
    constraints: extractConstraints(content)
  };
  
  return specData;
}

// 🔍 EXTRAIR VALOR SIMPLES
function extractValue(content, regex) {
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

// 📑 EXTRAIR SEÇÃO
function extractSection(content, sectionName) {
  const regex = new RegExp(`\\*\\*${sectionName}\\*\\*[\\s\\S]*?([\\s\\S]*?)(?=\\*\\*|$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim().substring(0, 200) : '';
}

// 🚶‍♂️ EXTRAIR JORNADA DO USUÁRIO
function extractUserJourney(content) {
  const steps = [];
  const journeyMatch = content.match(/\*\*🚶‍♂️ JORNADA DO USUÁRIO\*\*([\s\S]*?)(?=###|\*\*\*|$)/);
  
  if (journeyMatch) {
    const stepMatches = journeyMatch[1].match(/\*\*Passo \d+:([\s\S]*?)(?=\*\*Passo|\*\*\*|$)/g);
    if (stepMatches) {
      stepMatches.forEach((step, index) => {
        steps.push({
          step: index + 1,
          description: step.replace(/\*\*Passo \d+:\s*/, '').trim().substring(0, 150)
        });
      });
    }
  }
  
  return steps;
}

// 🔧 EXTRAIR COMPORTAMENTOS
function extractBehaviors(content) {
  const behaviors = [];
  
  // Extrair shouldBehaviors
  const shouldMatch = content.match(/\*\*✅ DEVE FAZER[\s\S]*?([\s\S]*?)(?=\*\*❌|\*\*⚡|###|$)/);
  if (shouldMatch) {
    const behaviorMatches = shouldMatch[1].match(/\*\*Comportamento.*?:([\s\S]*?)(?=\*\*Comportamento|\*\*\*|$)/g);
    if (behaviorMatches) {
      behaviorMatches.forEach(behavior => {
        behaviors.push({
          type: 'should',
          description: behavior.replace(/\*\*Comportamento.*?:\s*/, '').trim().substring(0, 100)
        });
      });
    }
  }
  
  return behaviors;
}

// 🚧 EXTRAIR CONSTRAINTS
function extractConstraints(content) {
  const constraints = [];
  
  const constraintMatch = content.match(/\*\*🔧 CONSTRAINTS TÉCNICAS[\s\S]*?([\s\S]*?)(?=\*\*💼|\*\*🤔|###|$)/);
  if (constraintMatch) {
    const constraintLines = constraintMatch[1].split('\n').filter(line => line.trim().startsWith('-'));
    constraints.push(...constraintLines.map(line => line.trim().substring(1).trim()));
  }
  
  return constraints;
}

// 🤖 PROCESSAR COM ENGINE AGENTIC (SIMULAÇÃO)
async function processWithAgenticEngine(specData) {
  console.log(`   🤖 Executando coordenação agentic...`);
  
  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const technicalPlan = {
    id: `tech-plan-${Date.now()}`,
    specificationId: specData.id,
    generated: new Date(),
    version: '1.0.0',
    methodology: 'V9.0_AGENTIC_COORDINATION',
    
    // Architecture decisions (Agent Alpha + Beta)
    architecture: generateArchitectureDecisions(specData),
    
    // Components (Agent Beta)
    components: generateComponents(specData),
    
    // Implementation steps (Agent Alpha + Beta + Charlie)
    implementationSteps: generateImplementationSteps(specData),
    
    // Timeline (All agents)
    timeline: generateTimeline(specData),
    
    // Resources (Agent Alpha)
    resources: generateResources(specData),
    
    // Test strategy (Agent Charlie)
    testStrategy: generateTestStrategy(specData),
    
    // Quality gates (Agent Charlie + Delta)
    qualityGates: generateQualityGates(specData),
    
    // Risk assessment (Agent Charlie + Delta)
    riskAssessment: generateRiskAssessment(specData),
    
    // Agent coordination info
    agentCoordination: {
      methodology: 'V9.0_AGENTIC',
      agents: ['alpha', 'beta', 'charlie', 'delta'],
      phases: [
        'specification_analysis',
        'architecture_design', 
        'implementation_planning',
        'quality_validation',
        'technical_plan_generation'
      ],
      coordination: 'automated',
      efficiency: '95%+'
    }
  };
  
  return technicalPlan;
}

// 🏗️ GERAR DECISÕES DE ARQUITETURA
function generateArchitectureDecisions(specData) {
  const decisions = [];
  
  // Decisão de framework baseada na categoria
  if (specData.category.includes('banco-de-ideias') || specData.category.includes('timeline')) {
    decisions.push({
      decision: 'Usar React + TypeScript para componentes interativos',
      reasoning: 'Projeto Roteirar IA já usa React. Componentes precisam de tipagem forte.',
      alternatives: ['Vue.js', 'Angular'],
      tradeoffs: ['Curva de aprendizado do TypeScript vs benefícios de tipagem']
    });
  }
  
  if (specData.category.includes('geracao-roteiros') || specData.description.includes('IA')) {
    decisions.push({
      decision: 'Integrar Google Gemini AI para processamento de linguagem natural',
      reasoning: 'Melhor modelo disponível para geração de conteúdo criativo em português',
      alternatives: ['OpenAI GPT', 'Claude'],
      tradeoffs: ['Custo vs qualidade', 'Latência vs precisão']
    });
  }
  
  // Decisão de estado baseada na complexidade
  if (specData.complexity === 'Complex' || specData.complexity === 'Enterprise') {
    decisions.push({
      decision: 'Implementar gerenciamento de estado com Context API + useReducer',
      reasoning: 'Feature complexa requer estado centralizado e previsível',
      alternatives: ['Redux', 'Zustand'],
      tradeoffs: ['Simplicidade vs funcionalidades avançadas']
    });
  }
  
  return decisions;
}

// 🧩 GERAR COMPONENTES
function generateComponents(specData) {
  const components = [];
  
  // Componente principal baseado na categoria
  const categoryComponents = {
    'banco-de-ideias': ['IdeaCard', 'IdeaList', 'IdeaForm', 'TagSelector'],
    'geracao-roteiros': ['ScriptGenerator', 'ScriptEditor', 'AIAssistant', 'ExportOptions'],
    'timeline-editor': ['TimelineCanvas', 'TimelineItem', 'DragDropZone', 'TimelineControls']
  };
  
  const category = Object.keys(categoryComponents).find(cat => specData.category.includes(cat));
  const baseComponents = categoryComponents[category] || ['MainComponent', 'ListComponent', 'FormComponent'];
  
  baseComponents.forEach(name => {
    components.push({
      name,
      type: 'component',
      purpose: `Componente para ${specData.title}`,
      dependencies: ['React', 'TypeScript'],
      interfaces: [
        {
          type: 'props',
          methods: ['render', 'handleChange', 'handleSubmit']
        }
      ],
      testRequirements: ['Renderização correta', 'Interações do usuário', 'Estados diversos']
    });
  });
  
  // Serviço backend
  components.push({
    name: `${category || 'main'}Service`,
    type: 'service',
    purpose: `Serviço para operações de ${specData.title}`,
    dependencies: ['HTTP Client', 'Error Handler'],
    interfaces: [
      {
        type: 'api',
        methods: ['create', 'read', 'update', 'delete', 'search']
      }
    ],
    testRequirements: ['Comportamento correto', 'Error handling', 'Performance']
  });
  
  // Página principal
  components.push({
    name: `${category || 'Main'}Page`,
    type: 'page',
    purpose: `Página principal para ${specData.title}`,
    dependencies: baseComponents,
    interfaces: [
      {
        type: 'route',
        methods: ['mount', 'unmount', 'navigate']
      }
    ],
    testRequirements: ['Navegação', 'Layout responsivo', 'Integração de componentes']
  });
  
  return components;
}

// 📋 GERAR PASSOS DE IMPLEMENTAÇÃO
function generateImplementationSteps(specData) {
  const steps = [
    {
      step: 1,
      title: 'Setup do Projeto e Configuração',
      description: `Configurar estrutura base para ${specData.title}`,
      deliverables: ['Estrutura de pastas', 'Configurações TypeScript', 'Dependências instaladas'],
      dependencies: [],
      effort: '1-2 dias'
    },
    {
      step: 2,
      title: 'Implementação dos Serviços Backend',
      description: 'Desenvolver lógica de negócio e APIs',
      deliverables: ['Service classes', 'API endpoints', 'Data models'],
      dependencies: ['Setup do Projeto'],
      effort: '3-5 dias'
    },
    {
      step: 3,
      title: 'Desenvolvimento dos Componentes Frontend',
      description: 'Criar componentes React conforme design',
      deliverables: ['Componentes React', 'Styles', 'Storybook stories'],
      dependencies: ['Implementação dos Serviços'],
      effort: '4-6 dias'
    },
    {
      step: 4,
      title: 'Integração e Testes',
      description: 'Integrar componentes e implementar testes',
      deliverables: ['Testes unitários', 'Testes de integração', 'Documentação'],
      dependencies: ['Desenvolvimento dos Componentes'],
      effort: '2-3 dias'
    }
  ];
  
  // Ajustar esforço baseado na complexidade
  const complexityMultiplier = {
    'Simple': 0.7,
    'Medium': 1.0,
    'Complex': 1.5,
    'Enterprise': 2.0
  };
  
  const multiplier = complexityMultiplier[specData.complexity] || 1.0;
  
  steps.forEach(step => {
    const baseDays = parseInt(step.effort.split('-')[0]);
    const maxDays = parseInt(step.effort.split('-')[1]) || baseDays;
    step.effort = `${Math.ceil(baseDays * multiplier)}-${Math.ceil(maxDays * multiplier)} dias`;
  });
  
  return steps;
}

// ⏰ GERAR TIMELINE
function generateTimeline(specData) {
  const timelineWeeks = {
    'Simple': 2,
    'Medium': 3,
    'Complex': 5,
    'Enterprise': 8
  };
  
  const weeks = timelineWeeks[specData.complexity] || 3;
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
  
  return {
    startDate,
    endDate,
    totalWeeks: weeks,
    phases: [
      {
        name: 'Análise e Design',
        start: new Date(startDate),
        end: new Date(startDate.getTime() + Math.ceil(weeks * 0.3) * 7 * 24 * 60 * 60 * 1000),
        deliverables: ['Especificação técnica', 'Design de arquitetura'],
        dependencies: []
      },
      {
        name: 'Desenvolvimento',
        start: new Date(startDate.getTime() + Math.ceil(weeks * 0.3) * 7 * 24 * 60 * 60 * 1000),
        end: new Date(startDate.getTime() + Math.ceil(weeks * 0.8) * 7 * 24 * 60 * 60 * 1000),
        deliverables: ['Componentes implementados', 'APIs funcionais'],
        dependencies: ['Análise e Design']
      },
      {
        name: 'Testes e Deployment',
        start: new Date(startDate.getTime() + Math.ceil(weeks * 0.8) * 7 * 24 * 60 * 60 * 1000),
        end: endDate,
        deliverables: ['Testes completos', 'Deploy em produção'],
        dependencies: ['Desenvolvimento']
      }
    ],
    milestones: [
      {
        name: 'Especificação Aprovada',
        date: new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        criteria: ['Especificação validada', 'Arquitetura definida'],
        deliverables: ['Documento de especificação']
      },
      {
        name: 'MVP Funcional',
        date: new Date(startDate.getTime() + Math.ceil(weeks * 0.6) * 7 * 24 * 60 * 60 * 1000),
        criteria: ['Funcionalidades core implementadas', 'Testes básicos passando'],
        deliverables: ['MVP deployado']
      },
      {
        name: 'Produção Ready',
        date: endDate,
        criteria: ['Todos os testes passando', 'Performance adequada', 'Documentação completa'],
        deliverables: ['Release em produção']
      }
    ],
    criticalPath: ['Análise e Design', 'Desenvolvimento', 'Testes e Deployment']
  };
}

// 👥 GERAR RECURSOS
function generateResources(specData) {
  const baseResources = [
    {
      role: 'Frontend Developer',
      effort: '60% do projeto',
      skills: ['React', 'TypeScript', 'CSS/Tailwind'],
      timeline: 'Durante todo o projeto'
    },
    {
      role: 'Backend Developer', 
      effort: '40% do projeto',
      skills: ['Node.js', 'API Design', 'Database'],
      timeline: 'Primeiras 3 semanas'
    }
  ];
  
  // Adicionar recursos baseados na complexidade
  if (specData.complexity === 'Complex' || specData.complexity === 'Enterprise') {
    baseResources.push({
      role: 'UX Designer',
      effort: '20% do projeto',
      skills: ['Design System', 'Usabilidade', 'Prototipagem'],
      timeline: 'Primeiras 2 semanas'
    });
  }
  
  if (specData.description.includes('IA') || specData.category.includes('geracao')) {
    baseResources.push({
      role: 'AI Specialist',
      effort: '30% do projeto',
      skills: ['Machine Learning', 'NLP', 'API Integration'],
      timeline: 'Semanas 2-4'
    });
  }
  
  return baseResources;
}

// 🧪 GERAR ESTRATÉGIA DE TESTES
function generateTestStrategy(specData) {
  return {
    unitTests: [
      {
        scenario: 'Componentes renderizam corretamente',
        type: 'unit',
        priority: 'high',
        automation: true,
        description: 'Verificar se todos os componentes renderizam sem erro'
      },
      {
        scenario: 'Funções de serviço funcionam conforme esperado',
        type: 'unit', 
        priority: 'high',
        automation: true,
        description: 'Testar lógica de negócio dos serviços'
      }
    ],
    integrationTests: [
      {
        scenario: 'Integração entre componentes',
        type: 'integration',
        priority: 'medium',
        automation: true,
        description: 'Verificar comunicação entre componentes'
      }
    ],
    e2eTests: [
      {
        scenario: 'Fluxo completo do usuário',
        type: 'e2e',
        priority: 'high',
        automation: true,
        description: 'Testar jornada completa do usuário'
      }
    ],
    performanceTests: [
      {
        scenario: 'Performance de carregamento',
        type: 'performance',
        priority: 'medium',
        automation: true,
        description: 'Verificar tempos de carregamento < 2s'
      }
    ]
  };
}

// ✅ GERAR QUALITY GATES
function generateQualityGates(specData) {
  const gates = [
    {
      name: 'Code Quality Gate',
      criteria: ['TypeScript sem erros', 'ESLint sem warnings', 'Prettier aplicado'],
      metrics: [
        {
          metric: 'TypeScript Errors',
          target: '0',
          measurement: 'tsc --noEmit',
          tooling: 'TypeScript Compiler'
        }
      ],
      blocking: true
    },
    {
      name: 'Test Coverage Gate',
      criteria: ['Unit test coverage > 80%', 'Integration tests passando'],
      metrics: [
        {
          metric: 'Test Coverage',
          target: '> 80%',
          measurement: 'Jest coverage report', 
          tooling: 'Jest'
        }
      ],
      blocking: true
    }
  ];
  
  if (specData.behaviors.some(b => b.description.includes('performance'))) {
    gates.push({
      name: 'Performance Gate',
      criteria: ['Load time < 2s', 'Response time < 500ms'],
      metrics: [
        {
          metric: 'Page Load Time',
          target: '< 2s',
          measurement: 'Lighthouse audit',
          tooling: 'Lighthouse'
        }
      ],
      blocking: false
    });
  }
  
  return gates;
}

// ⚠️ GERAR AVALIAÇÃO DE RISCOS
function generateRiskAssessment(specData) {
  const risks = [
    {
      risk: 'Complexidade técnica subestimada',
      probability: 'medium',
      impact: 'high',
      category: 'technical'
    },
    {
      risk: 'Mudanças de requisitos durante desenvolvimento',
      probability: 'medium', 
      impact: 'medium',
      category: 'business'
    }
  ];
  
  if (specData.description.includes('IA')) {
    risks.push({
      risk: 'API de IA indisponível ou com limitações',
      probability: 'low',
      impact: 'high',
      category: 'external'
    });
  }
  
  const mitigation = risks.map((risk, index) => ({
    riskId: index,
    strategy: generateMitigationStrategy(risk),
    owner: 'Tech Lead',
    timeline: '1 semana'
  }));
  
  return {
    risks,
    mitigation,
    contingencies: [
      'Manter buffer de 20% no timeline',
      'Ter plano B para integrações externas',
      'Reviews frequentes com stakeholders'
    ]
  };
}

// 🛡️ GERAR ESTRATÉGIA DE MITIGAÇÃO
function generateMitigationStrategy(risk) {
  const strategies = {
    'technical': 'Fazer prova de conceito antecipada',
    'business': 'Estabelecer processo de change management',
    'external': 'Implementar fallbacks e circuit breakers',
    'resource': 'Ter recursos backup identificados'
  };
  
  return strategies[risk.category] || 'Monitorar e revisar semanalmente';
}

// 💾 SALVAR PLANO TÉCNICO
async function saveTechnicalPlan(specFile, technicalPlan) {
  const planFileName = specFile.replace('.md', '-technical-plan.json');
  const planPath = path.join(PLANS_DIR, planFileName);
  
  await fs.writeFile(planPath, JSON.stringify(technicalPlan, null, 2), 'utf8');
  
  return planFileName;
}

// 📊 EXIBIR RESUMO DO PLANO
function displayPlanSummary(plan) {
  console.log(`   📊 Resumo:`);
  console.log(`   • ${plan.components.length} componentes identificados`);
  console.log(`   • ${plan.implementationSteps.length} passos de implementação`);
  console.log(`   • ${plan.timeline.totalWeeks} semanas estimadas`);
  console.log(`   • ${plan.resources.length} recursos necessários`);
  console.log(`   • ${plan.qualityGates.length} quality gates definidos`);
}

// 🏃‍♂️ EXECUTAR SCRIPT
if (require.main === module) {
  main();
}

module.exports = {
  generateTechnicalPlanFromSpec,
  parseSpecification,
  processWithAgenticEngine
};