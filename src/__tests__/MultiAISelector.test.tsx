import { render, screen, fireEvent } from '@testing-library/react';
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
});