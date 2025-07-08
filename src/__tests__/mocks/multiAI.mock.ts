// Mock for Multi-AI Service
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
};