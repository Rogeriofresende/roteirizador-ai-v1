#!/bin/bash

# 🔄 WEEKLY CLEANUP AUTOMÁTICO - METODOLOGIA V6.0
# Executa manutenção automática da documentação

echo "🔄 WEEKLY CLEANUP V6.0"
echo "====================="

# Configurações
ARCHIVE_DIR="archives/historical-docs"
REPORTS_DIR="archives/reports"
METHODOLOGY_DIR="archives/methodology-versions"
MAX_MD_FILES=15
DAYS_OLD=30

# Contadores
MOVED_FILES=0
ERRORS=0

# 1. CRIAR DIRETÓRIOS SE NÃO EXISTIREM
echo "📁 Verificando estrutura de diretórios..."
mkdir -p "$ARCHIVE_DIR" "$REPORTS_DIR" "$METHODOLOGY_DIR"

# 2. IDENTIFICAR ARQUIVOS ANTIGOS (>30 dias)
echo "🗓️ Identificando arquivos antigos (>$DAYS_OLD dias)..."

# Mover relatórios antigos
find . -maxdepth 1 -name "RELATORIO_*" -mtime +$DAYS_OLD -exec mv {} "$REPORTS_DIR/" \; -exec echo "📋 Movido: {}" \; 2>/dev/null
MOVED_FILES=$((MOVED_FILES + $(find "$REPORTS_DIR" -name "RELATORIO_*" -mtime -1 | wc -l)))

# Mover documentos de execução antigos  
find . -maxdepth 1 -name "EXECUCAO_*" -mtime +$DAYS_OLD -exec mv {} "$ARCHIVE_DIR/" \; -exec echo "⚡ Movido: {}" \; 2>/dev/null
MOVED_FILES=$((MOVED_FILES + $(find "$ARCHIVE_DIR" -name "EXECUCAO_*" -mtime -1 | wc -l)))

# Mover status antigos
find . -maxdepth 1 -name "STATUS_*" -mtime +$DAYS_OLD -exec mv {} "$ARCHIVE_DIR/" \; -exec echo "📊 Movido: {}" \; 2>/dev/null
MOVED_FILES=$((MOVED_FILES + $(find "$ARCHIVE_DIR" -name "STATUS_*" -mtime -1 | wc -l)))

# 3. VERIFICAR LIMITE DE ARQUIVOS .MD
echo "🔢 Verificando limite de arquivos .md..."
CURRENT_MD_COUNT=$(ls *.md 2>/dev/null | wc -l)

if [ $CURRENT_MD_COUNT -gt $MAX_MD_FILES ]; then
    echo "⚠️ Muitos arquivos .md na raiz: $CURRENT_MD_COUNT (limite: $MAX_MD_FILES)"
    
    # Listar arquivos por data de modificação (mais antigos primeiro)
    echo "📋 Arquivos candidatos para arquivamento:"
    ls -lt *.md | tail -n +$((MAX_MD_FILES + 1)) | while read line; do
        filename=$(echo $line | awk '{print $9}')
        
        # Pular arquivos essenciais
        if [[ "$filename" == "README.md" ]] || \
           [[ "$filename" == *"STATUS_ATUAL_"* ]] || \
           [[ "$filename" == "COORDENACAO_SIMPLES.md" ]] || \
           [[ "$filename" == "METODOLOGIA_V6_0_AUTOMATIZADA.md" ]]; then
            echo "🔒 Protegido: $filename"
            continue
        fi
        
        echo "📁 Candidato: $filename"
    done
else
    echo "✅ Arquivos .md na raiz: $CURRENT_MD_COUNT (dentro do limite: $MAX_MD_FILES)"
fi

# 4. VALIDAR DOCUMENTOS ESSENCIAIS
echo "📋 Validando documentos essenciais..."

ESSENTIAL_FILES=(
    "README.md"
    "*STATUS_ATUAL_*.md"
    "COORDENACAO_SIMPLES.md"
    "METODOLOGIA_V6_0_AUTOMATIZADA.md"
)

for pattern in "${ESSENTIAL_FILES[@]}"; do
    if ls $pattern 1> /dev/null 2>&1; then
        echo "✅ Encontrado: $pattern"
    else
        echo "❌ Faltando: $pattern"
        ERRORS=$((ERRORS + 1))
    fi
done

# 5. VERIFICAR INTEGRIDADE DO SISTEMA
echo "🔍 Verificando integridade do sistema..."

# Build test
if npm run build --silent > /dev/null 2>&1; then
    echo "✅ Build funcionando"
else
    echo "❌ Build com problemas"
    ERRORS=$((ERRORS + 1))
fi

# 6. GERAR RELATÓRIO DE CLEANUP
CLEANUP_DATE=$(date '+%Y-%m-%d_%H-%M-%S')
CLEANUP_REPORT="archives/reports/WEEKLY_CLEANUP_$CLEANUP_DATE.md"

cat > "$CLEANUP_REPORT" << EOF
# 🔄 WEEKLY CLEANUP REPORT

**Data:** $(date)
**Script:** weekly-cleanup.sh
**Versão:** V6.0

## 📊 Estatísticas

- **Arquivos movidos:** $MOVED_FILES
- **Errors encontrados:** $ERRORS
- **Arquivos .md na raiz:** $CURRENT_MD_COUNT / $MAX_MD_FILES

## 📁 Estrutura Atual

\`\`\`
Raiz: $CURRENT_MD_COUNT arquivos .md
Archives: $(ls "$ARCHIVE_DIR" 2>/dev/null | wc -l) arquivos históricos
Reports: $(ls "$REPORTS_DIR" 2>/dev/null | wc -l) relatórios
\`\`\`

## ✅ Status Final

$(if [ $ERRORS -eq 0 ]; then echo "🎯 CLEANUP SUCCESSFUL"; else echo "⚠️ CLEANUP WITH WARNINGS"; fi)

EOF

# 7. RESULTADO FINAL
echo "====================="
echo "📊 CLEANUP SUMMARY:"
echo "📁 Arquivos movidos: $MOVED_FILES"
echo "❌ Errors: $ERRORS"
echo "📄 Relatório: $CLEANUP_REPORT"

if [ $ERRORS -eq 0 ]; then
    echo "🎯 STATUS: CLEANUP SUCCESSFUL ✅"
    exit 0
else
    echo "⚠️ STATUS: CLEANUP WITH WARNINGS"
    exit 1
fi 