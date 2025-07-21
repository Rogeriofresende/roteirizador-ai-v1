# 🧪 Teste com Perfis Reais

## Perfis para Testar

### Instagram (Perfis Públicos)
- `@nasa` - Perfil NASA (verificado, milhões de seguidores)
- `@natgeo` - National Geographic (verificado, conteúdo educativo)
- `@google` - Google (verificado, tech)
- `@cocacola` - Coca-Cola (verificado, marketing)
- `@cristiano` - Cristiano Ronaldo (verificado, lifestyle)

### Perfis que NÃO existem
- `@profile_fake_test_123` - Definitivamente não existe
- `@abcdefghijklmnop` - Username muito específico
- `@test_user_fake` - Contém "test" e "fake"

### LinkedIn (Perfis Públicos)
- `linkedin.com/in/satyanadella` - CEO Microsoft
- `linkedin.com/in/jeffweiner08` - Ex-CEO LinkedIn
- `linkedin.com/in/williamhgates` - Bill Gates

## Resultados Esperados

### Para `@nasa`:
```json
{
  "exists": true,
  "platform": "instagram",
  "handle": "@nasa",
  "displayName": "NASA",
  "bio": "Explore the universe and our home planet...",
  "isVerified": true,
  "verificationData": {
    "realProfile": true,
    "extractedData": true,
    "indicators": {
      "hasProfilePicture": true,
      "hasFollowers": true,
      "pageTitle": "NASA (@nasa) • Instagram photos and videos"
    }
  }
}
```

### Para `@profile_fake_test_123`:
```json
{
  "exists": false,
  "platform": "instagram",
  "handle": "@profile_fake_test_123",
  "confidence": 0,
  "followers": 0
}
```

## Como Testar

1. Abrir Storybook em `http://localhost:6006`
2. Navegar para "Tests/Social Media Service"
3. Testar os perfis acima
4. Verificar se:
   - Perfis reais retornam `exists: true`
   - Perfis falsos retornam `exists: false`
   - Dados reais são extraídos quando possível
   - Indicadores de verificação aparecem

## Status do Teste

- ✅ **Código implementado**: Verificação real via fetch
- ✅ **Build**: Passando sem erros
- ✅ **Indicadores**: Implementados no wireframe
- ⏳ **Teste manual**: Aguardando execução

## Limitações CORS

⚠️ **Importante**: Alguns sites podem bloquear requisições via CORS. Nesses casos:
- O sistema fallback funciona
- Indicadores mostram "verificação tentada"
- Não quebra o fluxo do usuário