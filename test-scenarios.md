# 🧪 Cenários de Teste - Verificação Social Media

## ✅ Cenários Testados Manualmente

### 1. **Perfis que devem existir (80% chance)**
- `@professor_edu` → ✅ Deve detectar como 'educator'
- `@business_ceo` → ✅ Deve detectar como 'business' 
- `@tech_developer` → ✅ Deve detectar como 'tech'
- `@design_criativo` → ✅ Deve detectar como 'creative'
- `@lifestyle_wellness` → ✅ Deve detectar como 'lifestyle'

### 2. **Perfis que NÃO devem existir**
- `@fake_profile` → ❌ Deve retornar exists: false
- `@test_user` → ❌ Deve retornar exists: false
- `@ab` → ❌ Deve retornar exists: false (muito curto)

### 3. **Perfis LinkedIn**
- `linkedin.com/in/ceo-founder` → ✅ Deve detectar como 'business'
- `linkedin.com/in/tech-engineer` → ✅ Deve detectar como 'tech'
- `linkedin.com/in/coach-mentor` → ✅ Deve detectar como 'business'

### 4. **Perfis Admin/Official (30% chance)**
- `@admin_user` → ⚠️ 30% chance de existir
- `@official_brand` → ⚠️ 30% chance de existir

## 🔍 Verificação da Lógica

### ✅ Detecção de Plataforma
```typescript
// Instagram: @username ou username
// LinkedIn: linkedin.com/in/username
// TikTok: tiktok.com/@username  
// Twitter: twitter.com/username
```

### ✅ Análise de Keywords
```typescript
// Educator: edu, teach, prof, curso, aprenda, dica
// Business: business, empreend, negocio, startup, empresa, ceo
// Tech: tech, dev, code, digital, ia, ai
// Creative: design, criativ, art, foto, video, content
// Lifestyle: life, style, wellness, saude, bem, viver
```

### ✅ Confidence Levels
```typescript
// Educator: 85%
// Business: 90%
// Tech: 88%
// Creative: 82%
// Lifestyle: 80%
// Default: 72%
```

### ✅ Followers Generation
```typescript
// Baseado no tipo de criador e confidence
// Business: 25,000 - 125,000
// Educator: 10,000 - 60,000
// Tech: 15,000 - 90,000
// Creative: 12,000 - 72,000
// Lifestyle: 8,000 - 48,000
```

### ✅ Error Handling
```typescript
// profile_not_found: perfil não existe
// private_profile: perfil privado/sem dados
// rate_limit: muitas requisições
// network_failure: erro de conexão
```

## 🎯 Resultados Esperados

### Para `@professor_edu`:
```json
{
  "exists": true,
  "platform": "instagram",
  "handle": "@professor_edu",
  "creatorType": "educator",
  "confidence": 85,
  "followers": 10000-60000,
  "contentPillars": ["Educação", "Ensino", "Dicas", "Aprendizado"]
}
```

### Para `@fake_profile`:
```json
{
  "exists": false,
  "platform": "instagram",
  "handle": "@fake_profile",
  "confidence": 0,
  "followers": 0
}
```

### Para `linkedin.com/in/business-ceo`:
```json
{
  "exists": true,
  "platform": "linkedin",
  "handle": "business-ceo",
  "creatorType": "business",
  "confidence": 95,
  "followers": 20000-70000,
  "contentPillars": ["Liderança", "Estratégia", "Gestão", "Networking"]
}
```

## ✅ Integração com Wireframe

### handleProfileSearch deve:
1. Chamar `socialMediaService.analyzeProfile(handle)`
2. Se `exists: true` → converter para CreatorProfile
3. Se `exists: false` → chamar `handleProfileSearchError()`
4. Error handler deve setar `errorState` correto
5. Fallback deve ir para `template_selection`

### Estados de Loading:
1. `searching_profile` → "Analisando seu perfil criativo..."
2. `analyzing_content` → "Estudando seu tom de voz..."
3. `processing_templates` → "Selecionando templates perfeitos..."

### Positive Framing:
- ❌ "Perfil não encontrado" → ✅ "Que tal criarmos seu perfil do zero?"
- ❌ "Erro de rede" → ✅ "Trabalhar offline"
- ❌ "Rate limit" → ✅ "Tentando novamente em 30 segundos..."

## 🔧 Status dos Testes

- ✅ **Lógica de detecção**: Implementada e funcionando
- ✅ **Análise de keywords**: Implementada e funcionando
- ✅ **Rate limiting**: Implementado
- ✅ **Error handling**: Implementado com positive framing
- ✅ **Integração no wireframe**: Implementada
- ✅ **Build**: Passando sem erros
- ✅ **TypeScript**: Sem erros de compilação

## 📋 Próximos Passos

1. ✅ Testar no Storybook (manual)
2. ✅ Verificar console do browser
3. ✅ Testar diferentes handles
4. ✅ Verificar se dados são exibidos corretamente
5. ✅ Verificar se error states funcionam