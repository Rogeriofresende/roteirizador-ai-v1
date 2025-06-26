import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface SystemDashboardProps {
  onClose: () => void;
}

export const SystemDashboard: React.FC<SystemDashboardProps> = ({ onClose }) => {
  const [stats, setStats] = useState({
    uptime: '99.9%',
    response: '150ms',
    status: 'healthy' as 'healthy' | 'degraded' | 'down'
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-background">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Dashboard do Sistema</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-2">Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Sistema Online</span>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-2">Uptime</h3>
              <p className="text-2xl font-bold text-green-500">{stats.uptime}</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-2">Resposta</h3>
              <p className="text-2xl font-bold text-blue-500">{stats.response}</p>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Serviços Ativos</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Gemini AI</span>
                <span className="text-green-500">✓ Ativo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Design Quality</span>
                <span className="text-green-500">✓ Ativo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">PWA</span>
                <span className="text-green-500">✓ Ativo</span>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}; 