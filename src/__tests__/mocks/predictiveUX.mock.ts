// Mock for Predictive UX Service
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
}));