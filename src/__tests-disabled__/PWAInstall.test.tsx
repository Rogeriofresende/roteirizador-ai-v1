import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@testing-library/jest-dom';
import PWAInstall, { PWAStatus } from './PWAInstall';
import { usePWA } from '../hooks/usePWA';

// jest.MockedFunction do hook usePWA
jest.mock('../hooks/usePWA', () => ({
  usePWA: jest.fn(),
}));

const mockUsePWA = usePWA as jest.MockedFunction;

describe('PWAInstall', () => {
  const defaultjest.MockedFunctionReturn = {
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    hasUpdate: false,
    install: jest.fn(),
    update: jest.fn(),
    dismissUpdate: jest.fn(),
    showInstallPrompt: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAlljest.MockedFunctions();
    mockUsePWA.mockReturnValue(defaultjest.MockedFunctionReturn);
  });

  it('não renderiza nada quando instalado e tudo OK', () => {
    mockUsePWA.mockReturnValue({
      ...defaultjest.MockedFunctionReturn,
      isInstalled: true,
      hasUpdate: false,
      isOffline: false,
    });

    const { container } = render(<PWAInstall />);
    expect(container.firstChild).toBeNull();
  });

  it('mostra prompt de instalação quando instalável', () => {
    mockUsePWA.mockReturnValue({
      ...defaultjest.MockedFunctionReturn,
      isInstallable: true,
      isInstalled: false,
    });

    render(<PWAInstall />);
    
    expect(screen.getByText('Instalar Roteirar IA')).toBeInTheDocument();
    expect(screen.getByText(/Adicione à tela inicial/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /instalar/i })).toBeInTheDocument();
  });

  it('executa instalação ao clicar no botão instalar', async () => {
    const mockInstall = jest.fn().mockResolvedValue(true);
    mockUsePWA.mockReturnValue({
      ...defaultjest.MockedFunctionReturn,
      isInstallable: true,
      isInstalled: false,
      install: mockInstall,
    });

    render(<PWAInstall />);
    
    const installButton = screen.getByRole('button', { name: /instalar/i });
    fireEvent.click(installButton);

    // Verifica estado de loading
    expect(screen.getByText(/instalando/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockInstall).toHaveBeenCalled();
    });
  });

  it('trata erro na instalação', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockInstall = jest.fn().mockRejectedValue(new Error('Install failed'));
    
    mockUsePWA.mockReturnValue({
      ...defaultjest.MockedFunctionReturn,
      isInstallable: true,
      install: mockInstall,
    });

    render(<PWAInstall />);
    
    const installButton = screen.getByRole('button', { name: /instalar/i });
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('PWA Install: Installation failed', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('mostra indicador offline quando offline', () => {
    mockUsePWA.mockReturnValue({
      ...defaultjest.MockedFunctionReturn,
      isOffline: true,
    });

    render(<PWAInstall />);
    
    expect(screen.getByText('Você está offline')).toBeInTheDocument();
    expect(screen.getByText(/Algumas funcionalidades podem não estar disponíveis/)).toBeInTheDocument();
  });

  it('expande detalhes offline ao clicar', () => {
    mockUsePWA.mockReturnValue({
      ...defaultjest.MockedFunctionReturn,
      isOffline: true,
    });

    render(<PWAInstall />);
    
    const detailsButton = screen.getByTitle('Mais detalhes');
    fireEvent.click(detailsButton);

    expect(screen.getByText(/Interface disponível.*Conecte-se para gerar/)).toBeInTheDocument();
    expect(screen.getByTitle('Menos detalhes')).toBeInTheDocument();
  });

  it('mostra prompt de atualização quando update disponível', () => {
    mockUsePWA.mockReturnValue({
      ...defaultjest.MockedFunctionReturn,
      hasUpdate: true,
    });

    render(<PWAInstall />);
    
    expect(screen.getByText('Nova versão disponível!')).toBeInTheDocument();
    expect(screen.getByText(/Atualize para acessar as últimas funcionalidades/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument();
  });

  it('executa atualização ao clicar no botão atualizar', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockUsePWA.mockReturnValue({
      ...defaultjest.MockedFunctionReturn,
      hasUpdate: true,
      update: mockUpdate,
    });

    render(<PWAInstall />);
    
    const updateButton = screen.getByRole('button', { name: /atualizar/i });
    fireEvent.click(updateButton);

    // Verifica estado de loading
    expect(screen.getByText(/atualizando/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  it('dispensa atualização ao clicar no X', () => {
    const mockDismissUpdate = jest.fn();
    mockUsePWA.mockReturnValue({
      ...defaultjest.MockedFunctionReturn,
      hasUpdate: true,
      dismissUpdate: mockDismissUpdate,
    });

    render(<PWAInstall />);
    
    const dismissButton = screen.getByTitle('Dispensar atualização');
    fireEvent.click(dismissButton);

    expect(mockDismissUpdate).toHaveBeenCalled();
  });

  it('trata erro na atualização', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));
    
    mockUsePWA.mockReturnValue({
      ...defaultjest.MockedFunctionReturn,
      hasUpdate: true,
      update: mockUpdate,
    });

    render(<PWAInstall />);
    
    const updateButton = screen.getByRole('button', { name: /atualizar/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('PWA Install: Update failed', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('mostra múltiplas seções quando necessário', () => {
    mockUsePWA.mockReturnValue({
      ...defaultjest.MockedFunctionReturn,
      isOffline: true,
      hasUpdate: true,
      isInstallable: true,
    });

    render(<PWAInstall />);
    
    expect(screen.getByText('Você está offline')).toBeInTheDocument();
    expect(screen.getByText('Nova versão disponível!')).toBeInTheDocument();
    expect(screen.getByText('Instalar Roteirar IA')).toBeInTheDocument();
  });
});

describe('PWAStatus', () => {
  beforeEach(() => {
    jest.clearAlljest.MockedFunctions();
    mockUsePWA.mockReturnValue({
      isInstalled: false,
      isOffline: false,
      hasUpdate: false,
    });
  });

  it('não renderiza quando nenhum status especial', () => {
    const { container } = render(<PWAStatus />);
    expect(container.firstChild).toBeNull();
  });

  it('mostra status PWA quando instalado', () => {
    mockUsePWA.mockReturnValue({
      isInstalled: true,
      isOffline: false,
      hasUpdate: false,
    });

    render(<PWAStatus />);
    
    expect(screen.getByTitle('Rodando como PWA')).toBeInTheDocument();
    expect(screen.getByText('PWA')).toBeInTheDocument();
  });

  it('mostra status offline quando offline', () => {
    mockUsePWA.mockReturnValue({
      isInstalled: false,
      isOffline: true,
      hasUpdate: false,
    });

    render(<PWAStatus />);
    
    expect(screen.getByTitle('Offline')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('mostra status update quando tem atualização', () => {
    mockUsePWA.mockReturnValue({
      isInstalled: false,
      isOffline: false,
      hasUpdate: true,
    });

    render(<PWAStatus />);
    
    expect(screen.getByTitle('Atualização disponível')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('mostra múltiplos indicadores quando aplicável', () => {
    mockUsePWA.mockReturnValue({
      isInstalled: true,
      isOffline: true,
      hasUpdate: true,
    });

    render(<PWAStatus />);
    
    expect(screen.getByTitle('Rodando como PWA')).toBeInTheDocument();
    expect(screen.getByTitle('Offline')).toBeInTheDocument();
    expect(screen.getByTitle('Atualização disponível')).toBeInTheDocument();
  });
}); 