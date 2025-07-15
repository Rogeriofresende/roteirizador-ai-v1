import { useState, useEffect } from 'react';

export interface UsageData {
  totalGenerations: number;
  monthlyGenerations: number;
  totalTokensUsed: number;
  monthlyTokensUsed: number;
  planType: 'free' | 'premium' | 'enterprise';
  remainingGenerations: number;
  usageHistory: Array<{
    date: string;
    generations: number;
    tokens: number;
  }>;
}

export interface UseUsageReturn {
  usageData: UsageData | null;
  loading: boolean;
  error: string | null;
  refreshUsage: () => Promise<void>;
  trackUsage: (tokens: number) => Promise<void>;
}

export const useUsage = (userId: string): UseUsageReturn => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - in real implementation, this would fetch from API
      const mockUsageData: UsageData = {
        totalGenerations: 150,
        monthlyGenerations: 45,
        totalTokensUsed: 25000,
        monthlyTokensUsed: 8500,
        planType: 'free',
        remainingGenerations: 5,
        usageHistory: [
          { date: '2025-01-16', generations: 3, tokens: 1200 },
          { date: '2025-01-15', generations: 5, tokens: 2100 },
          { date: '2025-01-14', generations: 2, tokens: 850 }
        ]
      };
      
      setUsageData(mockUsageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados de uso');
    } finally {
      setLoading(false);
    }
  };

  const trackUsage = async (tokens: number) => {
    try {
      if (!usageData) return;
      
      // Update local usage data
      const updatedUsageData = {
        ...usageData,
        monthlyGenerations: usageData.monthlyGenerations + 1,
        totalGenerations: usageData.totalGenerations + 1,
        monthlyTokensUsed: usageData.monthlyTokensUsed + tokens,
        totalTokensUsed: usageData.totalTokensUsed + tokens,
        remainingGenerations: Math.max(0, usageData.remainingGenerations - 1)
      };
      
      setUsageData(updatedUsageData);
      
      // In real implementation, this would send to analytics API
      console.log('Usage tracked:', { tokens, userId });
      
    } catch (err) {
      console.error('Erro ao rastrear uso:', err);
    }
  };

  useEffect(() => {
    if (userId) {
      refreshUsage();
    }
  }, [userId]);

  return {
    usageData,
    loading,
    error,
    refreshUsage,
    trackUsage
  };
}; 