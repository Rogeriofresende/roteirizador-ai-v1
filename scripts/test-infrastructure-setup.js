#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Test Infrastructure Setup V6.2
 * Prepara o ambiente de testes para suportar as features avançadas
 */
class TestInfrastructureSetup {
    constructor() {
        this.testsPath = path.join(process.cwd(), 'src', '__tests__');
        this.mockPath = path.join(process.cwd(), 'src', '__tests__', 'mocks');
        this.setupPath = path.join(process.cwd(), 'src', 'tests', 'setup.ts');
    }

    // Criar estrutura de mocks necessária
    createMockStructure() {
        console.log('📁 Criando estrutura de mocks...');
        
        // Garantir que diretórios existem
        if (!fs.existsSync(this.mockPath)) {
            fs.mkdirSync(this.mockPath, { recursive: true });
        }

        // Mock para Predictive UX
        const predictiveUXMock = `// Mock for Predictive UX Service
export const predictiveAnalytics = {
    trackInteraction: jest.fn(),
    predictNextAction: jest.fn(() => Promise.resolve({
        nextAction: 'generate',
        confidence: 0.85,
        alternatives: []
    })),
    getPatterns: jest.fn(() => Promise.resolve([])),
    clearHistory: jest.fn()
};

export const usePredictiveUX = jest.fn(() => ({
    isLoading: false,
    predictions: null,
    trackAction: jest.fn(),
    getPrediction: jest.fn()
}));`;

        fs.writeFileSync(
            path.join(this.mockPath, 'predictiveUX.mock.ts'),
            predictiveUXMock
        );

        // Mock para Multi-AI Service
        const multiAIMock = `// Mock for Multi-AI Service
export const multiAIService = {
    providers: ['gemini', 'chatgpt'],
    currentProvider: 'gemini',
    
    setProvider: jest.fn(),
    generate: jest.fn(() => Promise.resolve({
        content: 'Mocked AI response',
        provider: 'gemini',
        tokens: 150
    })),
    
    compareProviders: jest.fn(() => Promise.resolve({
        gemini: { quality: 0.9, speed: 0.8 },
        chatgpt: { quality: 0.85, speed: 0.9 }
    }))
};`;

        fs.writeFileSync(
            path.join(this.mockPath, 'multiAI.mock.ts'),
            multiAIMock
        );

        // Mock para Voice Synthesis
        const voiceSynthesisMock = `// Mock for Voice Synthesis Service
export const voiceService = {
    isSupported: true,
    voices: [
        { name: 'Google US English', lang: 'en-US' },
        { name: 'Google BR Portuguese', lang: 'pt-BR' }
    ],
    
    speak: jest.fn(() => Promise.resolve()),
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    
    setVoice: jest.fn(),
    setRate: jest.fn(),
    setPitch: jest.fn()
};`;

        fs.writeFileSync(
            path.join(this.mockPath, 'voiceSynthesis.mock.ts'),
            voiceSynthesisMock
        );

        // Mock para Smart Loading States
        const smartLoadingMock = `// Mock for Smart Loading States
export const loadingService = {
    stages: ['initializing', 'processing', 'analyzing', 'finalizing'],
    currentStage: 0,
    
    startLoading: jest.fn(),
    updateStage: jest.fn(),
    completeLoading: jest.fn(),
    
    getEstimatedTime: jest.fn(() => 3000),
    getProgress: jest.fn(() => 0.5)
};`;

        fs.writeFileSync(
            path.join(this.mockPath, 'smartLoading.mock.ts'),
            smartLoadingMock
        );

        console.log('✅ Estrutura de mocks criada');
    }

    // Atualizar arquivo de setup dos testes
    updateTestSetup() {
        console.log('🔧 Atualizando setup de testes...');
        
        const setupContent = `// Test Setup Configuration V6.2
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

// Mock environment variables
process.env.VITE_FIREBASE_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
process.env.VITE_GEMINI_API_KEY = 'test-gemini-key';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock Web Speech API
global.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    pending: false,
    speaking: false,
    paused: false,
};

// Mock Vibration API
navigator.vibrate = vi.fn();

// Mock Performance API
global.performance.mark = vi.fn();
global.performance.measure = vi.fn();

// Import global mocks
vi.mock('@/services/predictiveAnalytics', () => 
    import('./mocks/predictiveUX.mock')
);

vi.mock('@/services/multiAIService', () => 
    import('./mocks/multiAI.mock')
);

vi.mock('@/services/voiceService', () => 
    import('./mocks/voiceSynthesis.mock')
);

vi.mock('@/services/loadingService', () => 
    import('./mocks/smartLoading.mock')
);`;

        // Garantir que o diretório existe
        const setupDir = path.dirname(this.setupPath);
        if (!fs.existsSync(setupDir)) {
            fs.mkdirSync(setupDir, { recursive: true });
        }

        fs.writeFileSync(this.setupPath, setupContent);
        console.log('✅ Setup de testes atualizado');
    }

    // Criar testes base para features V6.2
    createFeatureTests() {
        console.log('🧪 Criando testes para features V6.2...');

        // Test para Predictive UX
        const predictiveUXTest = `import { renderHook } from '@testing-library/react';
import { usePredictiveUX } from '@/hooks/usePredictiveUX';

describe('Predictive UX Hook', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => usePredictiveUX());
        
        expect(result.current.isLoading).toBe(false);
        expect(result.current.predictions).toBeNull();
    });
    
    it('should track user actions', async () => {
        const { result } = renderHook(() => usePredictiveUX());
        
        await result.current.trackAction('click', 'generate-button');
        
        expect(result.current.trackAction).toHaveBeenCalled();
    });
});`;

        fs.writeFileSync(
            path.join(this.testsPath, 'predictiveUX.test.tsx'),
            predictiveUXTest
        );

        // Test para Multi-AI Selection
        const multiAITest = `import { render, screen, fireEvent } from '@testing-library/react';
import { MultiAISelector } from '@/components/MultiAISelector';

describe('Multi-AI Selector', () => {
    it('should render available AI providers', () => {
        render(<MultiAISelector />);
        
        expect(screen.getByText('Gemini')).toBeInTheDocument();
        expect(screen.getByText('ChatGPT')).toBeInTheDocument();
    });
    
    it('should switch between providers', () => {
        const onProviderChange = jest.fn();
        render(<MultiAISelector onProviderChange={onProviderChange} />);
        
        fireEvent.click(screen.getByText('ChatGPT'));
        
        expect(onProviderChange).toHaveBeenCalledWith('chatgpt');
    });
});`;

        fs.writeFileSync(
            path.join(this.testsPath, 'MultiAISelector.test.tsx'),
            multiAITest
        );

        console.log('✅ Testes de features criados');
    }

    // Verificar compatibilidade do ambiente
    checkEnvironment() {
        console.log('🔍 Verificando ambiente de testes...');
        
        try {
            // Verificar se Vitest está instalado
            execSync('npx vitest --version', { stdio: 'ignore' });
            console.log('✅ Vitest instalado');
        } catch {
            console.log('⚠️  Vitest não encontrado - usando Jest');
        }

        // Verificar testing library
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const testingLibs = [
            '@testing-library/react',
            '@testing-library/jest-dom',
            '@testing-library/user-event'
        ];

        testingLibs.forEach(lib => {
            if (packageJson.devDependencies?.[lib] || packageJson.dependencies?.[lib]) {
                console.log(`✅ ${lib} instalado`);
            } else {
                console.log(`❌ ${lib} não encontrado`);
            }
        });
    }

    // Gerar relatório
    generateReport() {
        console.log('\n📊 TEST INFRASTRUCTURE REPORT');
        console.log('=============================\n');
        
        const report = {
            timestamp: new Date().toISOString(),
            mocks: {
                predictiveUX: fs.existsSync(path.join(this.mockPath, 'predictiveUX.mock.ts')),
                multiAI: fs.existsSync(path.join(this.mockPath, 'multiAI.mock.ts')),
                voiceSynthesis: fs.existsSync(path.join(this.mockPath, 'voiceSynthesis.mock.ts')),
                smartLoading: fs.existsSync(path.join(this.mockPath, 'smartLoading.mock.ts'))
            },
            tests: {
                predictiveUX: fs.existsSync(path.join(this.testsPath, 'predictiveUX.test.tsx')),
                multiAI: fs.existsSync(path.join(this.testsPath, 'MultiAISelector.test.tsx'))
            },
            setup: fs.existsSync(this.setupPath)
        };

        console.log('📁 Mocks criados:');
        Object.entries(report.mocks).forEach(([name, exists]) => {
            console.log(`   ${exists ? '✅' : '❌'} ${name}`);
        });

        console.log('\n🧪 Testes criados:');
        Object.entries(report.tests).forEach(([name, exists]) => {
            console.log(`   ${exists ? '✅' : '❌'} ${name}`);
        });

        console.log(`\n🔧 Setup configurado: ${report.setup ? '✅' : '❌'}`);

        fs.writeFileSync(
            'test-infrastructure-report.json',
            JSON.stringify(report, null, 2)
        );

        console.log('\n📁 Report salvo em test-infrastructure-report.json');
    }

    // Executar setup completo
    async run() {
        console.log('🚀 Test Infrastructure Setup V6.2\n');
        
        this.createMockStructure();
        this.updateTestSetup();
        this.createFeatureTests();
        this.checkEnvironment();
        this.generateReport();
        
        console.log('\n✅ Infraestrutura de testes preparada para V6.2!');
    }
}

// Executar setup
const setup = new TestInfrastructureSetup();
setup.run().catch(console.error); 