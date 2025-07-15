import colors from 'picocolors';
import chokidar from 'chokidar';

/**
 * Plugin para otimizar hot reload no Storybook
 * Baseado na pesquisa de problemas de performance
 * 
 * @param watchedFiles - Lista de arquivos ou diretórios para observar
 */
export const externalFileWatch = (watchFilesMask: readonly string[]) => ({
  name: 'optimized-hot-reload',

  configureServer({ ws, config }) {
    /**
     * Informa ao servidor Vite que houve uma mudança e dispara reload
     * 
     * @param path - Caminho onde a mudança aconteceu
     */
    const fileChanged = (path: string) => {
      // Filtrar apenas arquivos relevantes para reduzir ruído
      if (path.includes('.stories.') || path.includes('src/')) {
        console.info(`${colors.magenta(`🔄 File changed`)} ${colors.gray(path)}`);
        ws.send({ type: 'full-reload', path });
      }
    };

    /**
     * Chokidar otimizado para reduzir overhead
     */
    const watcher = chokidar.watch(watchFilesMask, { 
      cwd: config.root, 
      ignoreInitial: true,
      // Otimizações baseadas na pesquisa
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/*.log',
        '**/.DS_Store',
        '**/coverage/**'
      ],
      // Reduzir overhead do file watching
      usePolling: false,
      useFsEvents: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50
      }
    });

    watcher
      .on('change', fileChanged)
      .on('add', fileChanged)
      .on('unlink', fileChanged);

    // Cleanup do watcher quando o servidor for fechado
    return () => {
      watcher.close();
    };
  },
}); 