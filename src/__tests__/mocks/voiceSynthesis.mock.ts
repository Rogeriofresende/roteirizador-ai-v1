// Mock for Voice Synthesis Service
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
};