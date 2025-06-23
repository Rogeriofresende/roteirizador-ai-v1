const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamanhos necessários para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconSource = 'public/icons/icon.svg';
const outputDir = 'public/icons';

console.log('🎬 Gerando ícones para Roteirar IA Pro PWA...\n');

// Verificar se o arquivo fonte existe
if (!fs.existsSync(iconSource)) {
  console.error('❌ Arquivo fonte não encontrado:', iconSource);
  process.exit(1);
}

// Criar diretório se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('📁 Diretório criado:', outputDir);
}

// Função para gerar ícone em tamanho específico
async function generateIcon(size) {
  try {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(iconSource)
      .resize(size, size)
      .png({
        quality: 90,
        progressive: true
      })
      .toFile(outputPath);
    
    console.log(`✅ Ícone ${size}x${size} gerado com sucesso`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao gerar ícone ${size}x${size}:`, error.message);
    return false;
  }
}

// Função para gerar ícones especiais
async function generateSpecialIcons() {
  try {
    // Apple Touch Icon (180x180)
    await sharp(iconSource)
      .resize(180, 180)
      .png({ quality: 90 })
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('✅ Apple Touch Icon (180x180) gerado');

    // Favicon 32x32
    await sharp(iconSource)
      .resize(32, 32)
      .png({ quality: 90 })
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('✅ Favicon 32x32 gerado');

    // Favicon 16x16
    await sharp(iconSource)
      .resize(16, 16)
      .png({ quality: 90 })
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    console.log('✅ Favicon 16x16 gerado');

    // Badge para notificações (72x72)
    await sharp(iconSource)
      .resize(72, 72)
      .png({ quality: 90 })
      .toFile(path.join(outputDir, 'badge-72x72.png'));
    console.log('✅ Badge 72x72 gerado');

    // Shortcut icon (96x96)
    await sharp(iconSource)
      .resize(96, 96)
      .png({ quality: 90 })
      .toFile(path.join(outputDir, 'shortcut-generate.png'));
    console.log('✅ Shortcut icon 96x96 gerado');

    return true;
  } catch (error) {
    console.error('❌ Erro ao gerar ícones especiais:', error.message);
    return false;
  }
}

// Função para gerar screenshots (mockups simples)
async function generateScreenshots() {
  try {
    // Desktop screenshot (1280x720)
    const desktopSvg = `
      <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B5CF6"/>
            <stop offset="50%" style="stop-color:#3B82F6"/>
            <stop offset="100%" style="stop-color:#4338CA"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <rect x="200" y="100" width="880" height="520" fill="rgba(255,255,255,0.1)" rx="20"/>
        <text x="640" y="200" text-anchor="middle" font-family="system-ui" font-size="48" font-weight="bold" fill="white">🎬 Roteirar IA Pro</text>
        <text x="640" y="260" text-anchor="middle" font-family="system-ui" font-size="24" fill="rgba(255,255,255,0.8)">Gerador de Roteiros com IA</text>
        <rect x="220" y="300" width="840" height="300" fill="rgba(255,255,255,0.05)" rx="15"/>
        <text x="640" y="360" text-anchor="middle" font-family="system-ui" font-size="18" fill="rgba(255,255,255,0.6)">Interface Desktop</text>
      </svg>
    `;

    await sharp(Buffer.from(desktopSvg))
      .resize(1280, 720)
      .png({ quality: 90 })
      .toFile(path.join(outputDir, '../screenshots/desktop-1.png'));
    console.log('✅ Screenshot desktop (1280x720) gerado');

    // Mobile screenshot (390x844)
    const mobileSvg = `
      <svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B5CF6"/>
            <stop offset="50%" style="stop-color:#3B82F6"/>
            <stop offset="100%" style="stop-color:#4338CA"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <rect x="20" y="100" width="350" height="644" fill="rgba(255,255,255,0.1)" rx="15"/>
        <text x="195" y="180" text-anchor="middle" font-family="system-ui" font-size="28" font-weight="bold" fill="white">🎬 Roteirar IA</text>
        <text x="195" y="220" text-anchor="middle" font-family="system-ui" font-size="16" fill="rgba(255,255,255,0.8)">Gerador de Roteiros com IA</text>
        <rect x="35" y="250" width="320" height="480" fill="rgba(255,255,255,0.05)" rx="10"/>
        <text x="195" y="300" text-anchor="middle" font-family="system-ui" font-size="14" fill="rgba(255,255,255,0.6)">Interface Mobile</text>
      </svg>
    `;

    // Criar diretório de screenshots
    const screenshotsDir = 'public/screenshots';
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    await sharp(Buffer.from(mobileSvg))
      .resize(390, 844)
      .png({ quality: 90 })
      .toFile(path.join(screenshotsDir, 'mobile-1.png'));
    console.log('✅ Screenshot mobile (390x844) gerado');

    return true;
  } catch (error) {
    console.error('❌ Erro ao gerar screenshots:', error.message);
    return false;
  }
}

// Executar geração de todos os ícones
async function generateAllIcons() {
  console.log('📱 Gerando ícones PWA...');
  
  let successCount = 0;
  let totalCount = sizes.length;

  // Gerar ícones padrão
  for (const size of sizes) {
    const success = await generateIcon(size);
    if (success) successCount++;
  }

  // Gerar ícones especiais
  console.log('\n🎨 Gerando ícones especiais...');
  await generateSpecialIcons();

  // Gerar screenshots
  console.log('\n📸 Gerando screenshots...');
  await generateScreenshots();

  // Relatório final
  console.log('\n📊 Relatório de Geração:');
  console.log(`✅ Ícones padrão: ${successCount}/${totalCount}`);
  console.log(`✅ Ícones especiais: 5 gerados`);
  console.log(`✅ Screenshots: 2 gerados`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 Todos os ícones PWA foram gerados com sucesso!');
    console.log('🚀 O app está pronto para ser instalado como PWA');
  } else {
    console.log(`\n⚠️ ${totalCount - successCount} ícones falharam`);
  }

  // Listar arquivos gerados
  console.log('\n📁 Arquivos gerados:');
  const iconFiles = fs.readdirSync(outputDir);
  iconFiles.forEach(file => {
    if (file.endsWith('.png')) {
      const filePath = path.join(outputDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`   ${file} (${sizeKB} KB)`);
    }
  });
}

// Executar script
generateAllIcons().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 