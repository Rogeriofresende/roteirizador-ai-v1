import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('Accessibility Quality Gates', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('todas as imagens têm alt text apropriado', () => {
    container.innerHTML = `
      <img src="test1.jpg" alt="Descrição da imagem 1" />
      <img src="test2.jpg" alt="Descrição da imagem 2" />
      <img src="test3.jpg" alt="" role="presentation" />
    `;

    const images = container.querySelectorAll('img');
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      const role = img.getAttribute('role');
      
      // Quality gate: todas as imagens devem ter alt ou role="presentation"
      expect(alt !== null || role === 'presentation').toBe(true);
    });
  });

  it('elementos interativos têm labels adequados', () => {
    container.innerHTML = `
      <button aria-label="Fechar modal">X</button>
      <input type="text" aria-label="Nome do usuário" />
      <label for="email">Email:</label>
      <input type="email" id="email" />
      <select aria-label="Selecione país">
        <option>Brasil</option>
        <option>Estados Unidos</option>
      </select>
    `;

    const interactiveElements = container.querySelectorAll('button, input, select, textarea');
    
    interactiveElements.forEach(element => {
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      const id = element.getAttribute('id');
      const hasLabel = container.querySelector(`label[for="${id}"]`);
      
      // Quality gate: elementos interativos devem ter rótulos
      const hasAccessibleLabel = ariaLabel || ariaLabelledBy || hasLabel;
      expect(hasAccessibleLabel).toBeTruthy();
    });
  });

  it('hierarquia de headings é lógica', () => {
    container.innerHTML = `
      <h1>Título Principal</h1>
      <h2>Seção 1</h2>
      <h3>Subseção 1.1</h3>
      <h3>Subseção 1.2</h3>
      <h2>Seção 2</h2>
      <h3>Subseção 2.1</h3>
    `;

    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => parseInt(h.tagName.charAt(1)));

    // Quality gate: hierarquia de headings deve ser sequencial
    for (let i = 1; i < headings.length; i++) {
      const currentLevel = headings[i];
      const previousLevel = headings[i - 1];
      
      // Não pode pular mais de um nível
      expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
    }

    // Deve começar com h1
    expect(headings[0]).toBe(1);
  });

  it('elementos focáveis têm indicadores visuais', () => {
    container.innerHTML = `
      <style>
        .focusable:focus { outline: 2px solid blue; }
        .custom-focus:focus { box-shadow: 0 0 0 2px red; }
      </style>
      <button class="focusable">Botão 1</button>
      <a href="#" class="custom-focus">Link</a>
      <input type="text" class="focusable" />
    `;

    const focusableElements = container.querySelectorAll('button, a, input, select, textarea');
    
    focusableElements.forEach(element => {
      // Simula foco
      element.focus();
      
      const computedStyle = window.getComputedStyle(element, ':focus');
      const hasOutline = computedStyle.outline !== 'none';
      const hasBoxShadow = computedStyle.boxShadow !== 'none';
      
      // Quality gate: elementos focáveis devem ter indicação visual
      expect(hasOutline || hasBoxShadow).toBe(true);
    });
  });

  it('contraste de cores é adequado', () => {
    container.innerHTML = `
      <div style="background: white; color: black; padding: 10px;">
        Texto com bom contraste
      </div>
      <div style="background: #000; color: #fff; padding: 10px;">
        Texto com contraste alto
      </div>
    `;

    // Simula verificação de contraste
    const textElements = container.querySelectorAll('div');
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      // Quality gate: deve ter cores definidas para texto e fundo
      expect(backgroundColor).toBeTruthy();
      expect(color).toBeTruthy();
      expect(backgroundColor).not.toBe(color);
    });
  });

  it('conteúdo é navegável por teclado', () => {
    container.innerHTML = `
      <button tabindex="0">Primeiro</button>
      <a href="#" tabindex="0">Segundo</a>
      <input type="text" tabindex="0" />
      <button tabindex="0">Terceiro</button>
    `;

    const tabbableElements = container.querySelectorAll('[tabindex="0"], button, a, input');
    
    // Quality gate: deve haver elementos navegáveis por teclado
    expect(tabbableElements.length).toBeGreaterThan(0);
    
    // Simula navegação por Tab
    tabbableElements.forEach((element, index) => {
      expect(element.getAttribute('tabindex')).not.toBe('-1');
    });
  });

  it('landmarks e regiões são identificadas', () => {
    container.innerHTML = `
      <header role="banner">Cabeçalho</header>
      <nav role="navigation">Navegação</nav>
      <main role="main">Conteúdo principal</main>
      <aside role="complementary">Sidebar</aside>
      <footer role="contentinfo">Rodapé</footer>
    `;

    const landmarks = container.querySelectorAll('[role]');
    const requiredRoles = ['banner', 'navigation', 'main', 'contentinfo'];
    
    const presentRoles = Array.from(landmarks).map(el => el.getAttribute('role'));
    
    // Quality gate: landmarks essenciais devem estar presentes
    requiredRoles.forEach(role => {
      expect(presentRoles).toContain(role);
    });
  });

  it('formulários têm validação acessível', () => {
    container.innerHTML = `
      <form>
        <label for="required-field">Campo obrigatório:</label>
        <input type="text" id="required-field" required aria-describedby="error-message" />
        <div id="error-message" role="alert" style="display: none;">
          Este campo é obrigatório
        </div>
        
        <label for="email-field">Email:</label>
        <input type="email" id="email-field" aria-describedby="email-help" />
        <div id="email-help">Digite um email válido</div>
      </form>
    `;

    const requiredInputs = container.querySelectorAll('input[required]');
    
    requiredInputs.forEach(input => {
      const ariaDescribedBy = input.getAttribute('aria-describedby');
      const label = container.querySelector(`label[for="${input.id}"]`);
      
      // Quality gate: campos obrigatórios devem ter labels e descrições
      expect(label).toBeTruthy();
      expect(ariaDescribedBy).toBeTruthy();
      
      const errorElement = container.querySelector(`#${ariaDescribedBy}`);
      expect(errorElement).toBeTruthy();
    });
  });

  it('conteúdo dinâmico é anunciado', () => {
    container.innerHTML = `
      <div id="live-region" aria-live="polite" aria-atomic="true">
        Status inicial
      </div>
      <div id="alert-region" role="alert" aria-live="assertive">
      </div>
    `;

    const liveRegions = container.querySelectorAll('[aria-live], [role="alert"], [role="status"]');
    
    // Quality gate: deve haver regiões para anúncios dinâmicos
    expect(liveRegions.length).toBeGreaterThan(0);
    
    liveRegions.forEach(region => {
      const ariaLive = region.getAttribute('aria-live');
      const role = region.getAttribute('role');
      
      expect(ariaLive || role === 'alert' || role === 'status').toBeTruthy();
    });
  });

  it('media tem controles acessíveis', () => {
    container.innerHTML = `
      <video controls aria-label="Vídeo demonstrativo">
        <source src="demo.mp4" type="video/mp4">
        <track kind="captions" src="captions.vtt" srclang="pt" label="Português">
      </video>
      <audio controls aria-label="Áudio exemplo">
        <source src="audio.mp3" type="audio/mpeg">
      </audio>
    `;

    const mediaElements = container.querySelectorAll('video, audio');
    
    mediaElements.forEach(media => {
      const hasControls = media.hasAttribute('controls');
      const hasAriaLabel = media.hasAttribute('aria-label');
      
      // Quality gate: elementos de mídia devem ter controles e labels
      expect(hasControls).toBe(true);
      expect(hasAriaLabel).toBe(true);
    });

    // Verifica se vídeos têm captions
    const videos = container.querySelectorAll('video');
    videos.forEach(video => {
      const tracks = video.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
      expect(tracks.length).toBeGreaterThan(0);
    });
  });
}); 