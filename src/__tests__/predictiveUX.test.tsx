import { renderHook } from '@testing-library/react';
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
});