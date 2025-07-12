# Domínios Autorizados Firebase - Roteirar IA

## ✅ Configuração Atual (Atualizada 10/07/2025)

### Domínios Default (Firebase)
- `roteirizador-ia-513c3.firebaseapp.com` - Hosting Firebase padrão
- `roteirizador-ia-513c3.web.app` - Hosting Firebase alternativo
- `localhost` - Desenvolvimento local padrão

### Domínios Custom (Adicionados Manualmente)
- `127.0.0.1` - IP localhost alternativo
- `192.168.15.6` - IP de desenvolvimento local atual
- `roteiropro.com` - **Domínio de produção principal**

## 🔧 Como Adicionar Novos Domínios

### Passo a Passo:
1. Acesse: https://console.firebase.google.com/
2. Selecione projeto: `roteirizador-ia-513c3`
3. Menu lateral: **Authentication**
4. Clique na aba **Settings** (Configurações)
5. Role para baixo até **Authorized domains** (Domínios autorizados)
6. Clique em **Add domain** (Adicionar domínio)
7. Digite o domínio (ex: `192.168.1.100`)
8. Clique **Done** (Concluído)

## 📋 Quando Adicionar Novos Domínios

### Cenários Comuns:
- ✅ **Novo IP de desenvolvimento** - Mudança de rede local
- ✅ **Deploy em novo ambiente** - Staging, production, test
- ✅ **Mudança de rede local** - IP diferente em nova localização
- ✅ **Subdomínios de produção** - app.roteiropro.com, admin.roteiropro.com
- ✅ **Ambientes de CI/CD** - Pipeline automático
- ✅ **Colaboradores remotos** - IPs de outros desenvolvedores

### Exemplos de Domínios Úteis:
```
# Desenvolvimento
localhost
127.0.0.1
192.168.1.x (range comum)
10.0.0.x (range comum)

# Produção
roteiropro.com
www.roteiropro.com
app.roteiropro.com

# Staging/Test
staging.roteiropro.com
test.roteiropro.com
```

## 🌐 URLs de Desenvolvimento Configuradas

### Locais:
- **Localhost**: `http://localhost:5177`
- **IP Local**: `http://192.168.15.6:5177`
- **Localhost Alt**: `http://127.0.0.1:5177`

### Produção:
- **Principal**: `https://roteiropro.com`
- **Firebase**: `https://roteirizador-ia-513c3.firebaseapp.com`

## ⚠️ Troubleshooting

### Erros Comuns e Soluções:

#### `auth/unauthorized-domain`
**Problema**: Domínio não está na lista de autorizados
**Solução**: Adicionar o domínio seguindo os passos acima

#### Google Sign-in Falha
**Problema**: Popup OAuth bloqueado
**Solução**: 
1. Verificar se domínio está autorizado
2. Verificar se não há adblockers interferindo
3. Testar em janela anônima

#### Redirect URI Mismatch
**Problema**: URL de callback não autorizada
**Solução**: Verificar se todos os subdomínios estão autorizados

## 🔒 Configurações de Segurança

### Boas Práticas:
- ✅ **Não adicionar domínios desnecessários** - Apenas os que realmente precisam
- ✅ **Revisar lista periodicamente** - Remover domínios não utilizados
- ✅ **Usar HTTPS em produção** - Sempre preferir conexões seguras
- ✅ **Documentar mudanças** - Manter este arquivo atualizado

### Domínios Seguros para Adicionar:
- IPs locais de desenvolvimento (192.168.x.x, 10.0.x.x)
- Subdomínios do domínio principal (*.roteiropro.com)
- Ambientes de staging conhecidos

### ⚠️ Domínios a Evitar:
- IPs públicos desconhecidos
- Domínios de terceiros
- URLs temporárias ou dinâmicas

## 📝 Histórico de Mudanças

### 10/07/2025
- ✅ Adicionado `192.168.15.6` para resolver erro de desenvolvimento
- ✅ Adicionado `roteiropro.com` como domínio de produção
- ✅ Adicionado `127.0.0.1` como alternativa ao localhost
- ✅ Documentação criada

## 📞 Contato e Suporte

Para questões relacionadas ao Firebase:
- **Console Firebase**: https://console.firebase.google.com/
- **Documentação**: https://firebase.google.com/docs/auth
- **Support**: https://firebase.google.com/support

---

**Última atualização**: 10/07/2025  
**Responsável**: Equipe Desenvolvimento Roteirar IA  
**Status**: ✅ Ativo e Funcional