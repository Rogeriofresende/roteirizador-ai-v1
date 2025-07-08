// Mock for Smart Loading States
export const loadingService = {
    stages: ['initializing', 'processing', 'analyzing', 'finalizing'],
    currentStage: 0,
    
    startLoading: jest.fn(),
    updateStage: jest.fn(),
    completeLoading: jest.fn(),
    
    getEstimatedTime: jest.fn(() => 3000),
    getProgress: jest.fn(() => 0.5)
};