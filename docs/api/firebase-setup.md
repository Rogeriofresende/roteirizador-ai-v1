# 🔥 Configuração Firebase - Roteirar-ia

> Guia completo para configuração e integração com Firebase

## 📋 **Visão Geral**

O Roteirar-ia utiliza Firebase para:
- **Authentication**: Login/registro de usuários
- **Firestore**: Armazenamento de dados de usuário
- **Analytics**: Métricas de uso (futuro)
- **Hosting**: Deploy em produção (futuro)

---

## ⚡ **Setup Rápido**

### **1. Criar Projeto Firebase**
```bash
1. Acesse: https://console.firebase.google.com/
2. Clique "Criar projeto"
3. Nome: "roteirar-ia-prod" (ou similar)
4. Habilite Google Analytics (opcional)
5. Aguarde criação do projeto
```

### **2. Configurar Aplicação Web**
```bash
1. No console Firebase, clique "Adicionar app" > Web
2. Nome do app: "Roteirar-ia Web"
3. Marque "Firebase Hosting" se planeja usar
4. Copie as configurações geradas
```

### **3. Configurações no Projeto**
```typescript
// firebase.config.ts
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

---

## 🔐 **Authentication Setup**

### **Configurar Provedores**
```bash
Authentication > Sign-in method:
□ Email/Password: HABILITADO
□ Google: HABILITADO (recomendado)
□ Anonymous: HABILITADO (para guests)
```

### **Configurar Domínios**
```bash
Authentication > Settings > Authorized domains:
□ localhost (desenvolvimento)
□ seu-dominio.com (produção)
□ seu-dominio.vercel.app (se usar Vercel)
```

### **Implementação**
```typescript
// auth.service.ts
import { auth } from './firebase.config';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth';

export class AuthService {
  async loginWithEmail(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password);
  }
  
  async registerWithEmail(email: string, password: string) {
    return await createUserWithEmailAndPassword(auth, email, password);
  }
  
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  }
}
```

---

## 📊 **Firestore Database**

### **Criar Database**
```bash
1. Firestore Database > Criar banco de dados
2. Modo: Produção (com regras de segurança)
3. Localização: us-central1 (recomendado)
```

### **Estrutura de Dados**
```typescript
// Coleções principais
interface DatabaseStructure {
  users: {
    [userId]: {
      email: string;
      displayName: string;
      createdAt: Timestamp;
      lastLogin: Timestamp;
      preferences: UserPreferences;
    }
  };
  scripts: {
    [scriptId]: {
      userId: string;
      title: string;
      content: string;
      platform: string;
      createdAt: Timestamp;
      tags: string[];
    }
  };
  usage: {
    [userId]: {
      totalScripts: number;
      lastUsed: Timestamp;
      subscription: string;
    }
  };
}
```

### **Security Rules**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users podem ler/escrever apenas seus dados
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Scripts do usuário
    match /scripts/{scriptId} {
      allow read, write: if request.auth != null 
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
    }
    
    // Usage stats (apenas escrita pelo próprio usuário)
    match /usage/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Public stats (read-only)
    match /stats/{document} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## 🛠️ **Implementação no Código**

### **Firebase Config**
```typescript
// src/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  // Suas configurações aqui
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;
```

### **Database Service**
```typescript
// src/services/database.service.ts
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export class DatabaseService {
  async saveScript(userId: string, scriptData: any) {
    const scriptsRef = collection(db, 'scripts');
    return await addDoc(scriptsRef, {
      ...scriptData,
      userId,
      createdAt: new Date()
    });
  }
  
  async getUserScripts(userId: string) {
    const q = query(
      collection(db, 'scripts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return await getDocs(q);
  }
  
  async updateUserProfile(userId: string, data: any) {
    const userRef = doc(db, 'users', userId);
    return await setDoc(userRef, data, { merge: true });
  }
}
```

---

## 🔒 **Segurança**

### **Environment Variables**
```bash
# .env.local
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=projeto-id
VITE_FIREBASE_STORAGE_BUCKET=projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### **Security Best Practices**
```typescript
// Validação de dados
export const validateScriptData = (data: any) => {
  return {
    title: sanitizeHtml(data.title?.substring(0, 100)),
    content: sanitizeHtml(data.content?.substring(0, 10000)),
    platform: ['youtube', 'instagram', 'tiktok', 'linkedin'].includes(data.platform) 
      ? data.platform : 'youtube',
    tags: Array.isArray(data.tags) 
      ? data.tags.slice(0, 10).map(tag => sanitizeHtml(tag)) 
      : []
  };
};
```

---

## 📊 **Analytics (Futuro)**

### **Setup Google Analytics**
```typescript
// analytics.service.ts
import { analytics } from './firebaseConfig';
import { logEvent } from 'firebase/analytics';

export const trackEvent = (eventName: string, parameters?: any) => {
  if (analytics) {
    logEvent(analytics, eventName, parameters);
  }
};

// Eventos personalizados
export const trackScriptGeneration = (platform: string) => {
  trackEvent('script_generated', { platform });
};

export const trackUserSignup = (method: string) => {
  trackEvent('sign_up', { method });
};
```

---

## 🚀 **Deploy & Hosting**

### **Firebase Hosting Setup**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### **firebase.json**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(eot|otf|ttf|ttc|woff|font.css)",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

---

## 🧪 **Testing**

### **Emulators Setup**
```bash
# firebase.json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true
    }
  }
}

# Iniciar emulators
firebase emulators:start
```

### **Test Configuration**
```typescript
// firebase.test.config.ts
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.NODE_ENV === 'test') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

---

## 🚨 **Troubleshooting**

### **Problemas Comuns**

#### **1. "Firebase not initialized"**
**Solução:** Verificar se firebaseConfig está correto e se initializeApp() foi chamado

#### **2. "Permission denied"**
**Solução:** Verificar Firestore rules e se usuário está autenticado

#### **3. "Auth domain not authorized"**
**Solução:** Adicionar domínio em Authentication > Settings

---

## 📚 **Links Úteis**

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI](https://firebase.google.com/docs/cli)

---

**Documentação criada:** Janeiro 2025  
**Última atualização:** Janeiro 2025  
**Versão:** 1.0 