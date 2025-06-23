# 🔒 Segurança - Roteirar-ia

> Guia completo de configurações de segurança, boas práticas e compliance

## 📋 **Visão Geral de Segurança**

A segurança do Roteirar-ia é implementada em múltiplas camadas, desde a infraestrutura até o código da aplicação. Este documento detalha todas as medidas de segurança implementadas e as melhores práticas recomendadas.

---

## 🛡️ **Arquitetura de Segurança**

### **Princípios de Segurança**
```
🔐 Defense in Depth     - Múltiplas camadas de proteção
🔑 Least Privilege      - Acesso mínimo necessário
🔄 Zero Trust           - Verificar sempre, nunca confiar
🚨 Fail Secure         - Falha em estado seguro
📊 Security by Design   - Segurança desde o início
```

### **Camadas de Proteção**
```
🌐 CDN/WAF           → DDoS, Injection, XSS Protection
🏠 Application       → Authentication, Authorization
🔐 API Layer         → Rate Limiting, Input Validation
🔥 Firebase         → Database Security Rules
🗄️ Data Layer       → Encryption at Rest
🌍 Network          → HTTPS, HSTS, CSP
```

---

## 🔑 **Autenticação e Autorização**

### **Firebase Authentication**
```typescript
// src/services/authService.ts
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

class AuthService {
  // Email/Password Authentication
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      // Log security event
      await this.logSecurityEvent('login_success', {
        userId: userCredential.user.uid,
        method: 'email_password',
        timestamp: new Date().toISOString()
      });
      
      return userCredential.user;
    } catch (error) {
      // Log failed attempt
      await this.logSecurityEvent('login_failed', {
        email: email,
        error: error.code,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Google OAuth
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Verify additional claims if needed
      const idTokenResult = await result.user.getIdTokenResult();
      
      return result.user;
    } catch (error) {
      await this.logSecurityEvent('oauth_failed', {
        provider: 'google',
        error: error.code
      });
      throw error;
    }
  }

  // Security event logging
  private async logSecurityEvent(event: string, data: any) {
    await addDoc(collection(db, 'security_logs'), {
      event,
      data,
      timestamp: serverTimestamp(),
      ip: await this.getUserIP(),
      userAgent: navigator.userAgent
    });
  }
}
```

### **Authorization Patterns**
```typescript
// src/hooks/useAuthorization.ts
export const useAuthorization = () => {
  const { user } = useAuthContext();

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;

    // Role-based access control
    const userRoles = user.customClaims?.roles || [];
    const requiredRole = getRequiredRole(resource, action);
    
    return userRoles.includes(requiredRole) || userRoles.includes('admin');
  };

  const canAccessRoute = (route: string): boolean => {
    const publicRoutes = ['/', '/login', '/signup'];
    if (publicRoutes.includes(route)) return true;
    
    return !!user;
  };

  return { hasPermission, canAccessRoute };
};

// Protected Route Component
export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: string;
}> = ({ children, requiredRole }) => {
  const { user } = useAuthContext();
  const { hasPermission } = useAuthorization();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasPermission('route', requiredRole)) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
};
```

---

## 🔐 **Gerenciamento de API Keys**

### **Secure API Key Storage**
```typescript
// src/services/apiKeyService.ts
class APIKeyService {
  private static readonly STORAGE_KEY = 'roteirar_ia_api_keys';
  
  // Encrypt API keys before storage
  static async storeAPIKey(service: string, apiKey: string): Promise<void> {
    try {
      const encrypted = await this.encryptData(apiKey);
      const keys = this.getStoredKeys();
      keys[service] = encrypted;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
      
      // Log key storage event
      console.log(`API key stored securely for ${service}`);
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw new Error('API key storage failed');
    }
  }

  // Decrypt and retrieve API keys
  static async getAPIKey(service: string): Promise<string | null> {
    try {
      const keys = this.getStoredKeys();
      const encryptedKey = keys[service];
      
      if (!encryptedKey) return null;
      
      return await this.decryptData(encryptedKey);
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return null;
    }
  }

  // Secure deletion
  static deleteAPIKey(service: string): void {
    const keys = this.getStoredKeys();
    delete keys[service];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
  }

  // Simple encryption (for demo - use Web Crypto API in production)
  private static async encryptData(data: string): Promise<string> {
    // In production, use proper encryption with Web Crypto API
    return btoa(data);
  }

  private static async decryptData(encryptedData: string): Promise<string> {
    return atob(encryptedData);
  }

  private static getStoredKeys(): Record<string, string> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }
}
```

### **API Key Validation**
```typescript
// src/utils/validation.ts
export const validateAPIKey = {
  gemini: (key: string): boolean => {
    // Gemini API keys follow pattern: AIza...
    const geminiPattern = /^AIza[0-9A-Za-z-_]{35}$/;
    return geminiPattern.test(key);
  },

  firebase: (config: any): boolean => {
    const requiredFields = ['apiKey', 'authDomain', 'projectId'];
    return requiredFields.every(field => 
      config[field] && typeof config[field] === 'string'
    );
  }
};

// API key strength checker
export const checkAPIKeyStrength = (key: string): SecurityLevel => {
  if (key.length < 20) return 'weak';
  if (key.length < 35) return 'medium';
  if (/[A-Z]/.test(key) && /[a-z]/.test(key) && /[0-9]/.test(key)) {
    return 'strong';
  }
  return 'medium';
};
```

---

## 🌐 **Segurança Web (Frontend)**

### **Content Security Policy (CSP)**
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' 
    https://generativelanguage.googleapis.com 
    https://*.firebaseapp.com 
    https://*.firebase.googleapis.com
    https://api.roteirar-ia.com;
  frame-src https://www.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
">
```

### **Security Headers Configuration**
```typescript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

### **Input Sanitization**
```typescript
// src/utils/sanitization.ts
import DOMPurify from 'dompurify';

export class InputSanitizer {
  // Sanitize HTML content
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  }

  // Sanitize script input
  static sanitizeScriptInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  // Validate and sanitize file uploads
  static validateFileUpload(file: File): boolean {
    const allowedTypes = ['text/plain', 'application/json'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds limit');
    }

    return true;
  }

  // SQL injection prevention (if using direct SQL)
  static escapeSQL(input: string): string {
    return input.replace(/'/g, "''");
  }
}
```

---

## 🔥 **Firebase Security Rules**

### **Firestore Security Rules**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }

    // Scripts collection - user-specific
    match /scripts/{scriptId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }

    // Security logs - admin only
    match /security_logs/{logId} {
      allow read: if request.auth != null 
        && 'admin' in request.auth.token.roles;
      allow write: if request.auth != null; // Allow logging
    }

    // Rate limiting collection
    match /rate_limits/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }

    // Analytics data - read-only for users
    match /analytics/{docId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can write
    }
  }
}
```

### **Firebase Storage Security Rules**
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /users/{userId}/profile/{fileName} {
      allow read: if true; // Public read
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024 // 5MB limit
        && request.resource.contentType.matches('image/.*');
    }

    // User scripts backup
    match /users/{userId}/scripts/{fileName} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

---

## 🚨 **Rate Limiting & DDoS Protection**

### **API Rate Limiting**
```typescript
// src/services/rateLimiter.ts
class RateLimiter {
  private static limits = new Map<string, RateLimit>();

  static async checkLimit(
    userId: string, 
    action: string, 
    limit: number, 
    windowMs: number
  ): Promise<boolean> {
    const key = `${userId}:${action}`;
    const now = Date.now();
    
    let userLimit = this.limits.get(key);
    
    if (!userLimit || now - userLimit.windowStart > windowMs) {
      userLimit = {
        count: 0,
        windowStart: now
      };
    }

    userLimit.count++;
    this.limits.set(key, userLimit);

    if (userLimit.count > limit) {
      // Log rate limit violation
      await this.logRateLimitViolation(userId, action, userLimit.count);
      return false;
    }

    return true;
  }

  private static async logRateLimitViolation(
    userId: string, 
    action: string, 
    count: number
  ) {
    await addDoc(collection(db, 'security_logs'), {
      event: 'rate_limit_exceeded',
      userId,
      action,
      count,
      timestamp: serverTimestamp()
    });
  }
}

// Usage in Gemini service
export class SecureGeminiService {
  async generateScript(prompt: string): Promise<string> {
    const { user } = useAuthContext();
    
    // Check rate limit (10 requests per minute)
    const canProceed = await RateLimiter.checkLimit(
      user.uid, 
      'generate_script', 
      10, 
      60000
    );

    if (!canProceed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Proceed with generation...
    return await this.callGeminiAPI(prompt);
  }
}
```

### **Client-Side Protection**
```typescript
// src/hooks/useRateLimit.ts
export const useRateLimit = (action: string, limit: number, windowMs: number) => {
  const [attempts, setAttempts] = useState<number[]>([]);
  
  const isAllowed = useCallback(() => {
    const now = Date.now();
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    return recentAttempts.length < limit;
  }, [attempts, limit, windowMs]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    setAttempts(prev => [...prev.filter(time => now - time < windowMs), now]);
  }, [windowMs]);

  return { isAllowed, recordAttempt };
};
```

---

## 🔍 **Security Monitoring & Logging**

### **Security Event Logging**
```typescript
// src/services/securityLogger.ts
export class SecurityLogger {
  static async logEvent(
    event: SecurityEvent, 
    details: Record<string, any>
  ): Promise<void> {
    const logEntry = {
      event,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId()
    };

    // Log to Firebase
    await addDoc(collection(db, 'security_logs'), logEntry);

    // Log to external security service (if configured)
    if (process.env.NODE_ENV === 'production') {
      await this.sendToSecurityService(logEntry);
    }
  }

  static async logSuspiciousActivity(
    activity: string, 
    risk: 'low' | 'medium' | 'high'
  ): Promise<void> {
    await this.logEvent('suspicious_activity', {
      activity,
      risk,
      requiresInvestigation: risk === 'high'
    });

    if (risk === 'high') {
      await this.alertSecurityTeam(activity);
    }
  }

  private static async alertSecurityTeam(activity: string): Promise<void> {
    // Send immediate alert for high-risk activities
    const alert = {
      type: 'security_alert',
      severity: 'high',
      activity,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId()
    };

    // Send to monitoring service
    await fetch('/api/security/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
  }
}

// Security events enum
export enum SecurityEvent {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  API_KEY_ADDED = 'api_key_added',
  API_KEY_REMOVED = 'api_key_removed',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_EXPORT = 'data_export',
  PERMISSION_DENIED = 'permission_denied'
}
```

### **Automated Threat Detection**
```typescript
// src/services/threatDetection.ts
export class ThreatDetection {
  static async analyzeUserBehavior(userId: string): Promise<ThreatLevel> {
    const recentActivity = await this.getRecentActivity(userId);
    
    const threats = [
      this.detectRapidRequests(recentActivity),
      this.detectUnusualPatterns(recentActivity),
      this.detectMultipleFailedLogins(recentActivity),
      this.detectSuspiciousIPs(recentActivity)
    ];

    const highestThreat = Math.max(...threats);
    
    if (highestThreat >= 8) {
      await SecurityLogger.logSuspiciousActivity(
        'High threat score detected', 
        'high'
      );
      return 'high';
    }
    
    if (highestThreat >= 5) return 'medium';
    return 'low';
  }

  private static detectRapidRequests(activity: Activity[]): number {
    const last5Min = activity.filter(a => 
      Date.now() - a.timestamp < 5 * 60 * 1000
    );
    
    // More than 100 requests in 5 minutes = threat score 9
    return Math.min(9, Math.floor(last5Min.length / 10));
  }

  private static detectUnusualPatterns(activity: Activity[]): number {
    // Detect unusual time patterns, geolocation changes, etc.
    // Implementation depends on specific patterns to detect
    return 0;
  }
}
```

---

## 🛡️ **Data Protection & Privacy**

### **Data Encryption**
```typescript
// src/utils/encryption.ts
export class DataEncryption {
  // Encrypt sensitive data before storage
  static async encryptSensitiveData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Generate encryption key
    const key = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt data
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );

    // Return base64 encoded result
    return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
  }

  // Data anonymization for analytics
  static anonymizeUserData(userData: any): any {
    return {
      ...userData,
      email: this.hashEmail(userData.email),
      name: undefined,
      ip: this.maskIP(userData.ip),
      id: this.generateAnonymousId(userData.id)
    };
  }

  private static hashEmail(email: string): string {
    // Simple hash for demo - use proper hashing in production
    return btoa(email).slice(0, 8) + '***';
  }

  private static maskIP(ip: string): string {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
}
```

### **GDPR Compliance**
```typescript
// src/services/gdprService.ts
export class GDPRService {
  // Data export for user requests
  static async exportUserData(userId: string): Promise<UserDataExport> {
    await SecurityLogger.logEvent(SecurityEvent.DATA_EXPORT, { userId });

    const userData = await this.collectUserData(userId);
    
    return {
      personalData: userData.profile,
      scripts: userData.scripts,
      preferences: userData.preferences,
      securityLogs: userData.securityLogs.map(log => ({
        timestamp: log.timestamp,
        event: log.event,
        details: this.anonymizeLogDetails(log.details)
      })),
      exportDate: new Date().toISOString()
    };
  }

  // Data deletion (right to be forgotten)
  static async deleteUserData(userId: string): Promise<void> {
    const batch = writeBatch(db);

    // Delete from all collections
    const collections = ['users', 'scripts', 'preferences', 'analytics'];
    
    for (const collectionName of collections) {
      const userDocs = await getDocs(
        query(collection(db, collectionName), where('userId', '==', userId))
      );
      
      userDocs.forEach(doc => batch.delete(doc.ref));
    }

    await batch.commit();

    // Log deletion event
    await SecurityLogger.logEvent('user_data_deleted', { userId });
  }

  // Consent management
  static async updateConsent(userId: string, consents: ConsentSettings): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      consents: {
        ...consents,
        lastUpdated: serverTimestamp()
      }
    });
  }
}
```

---

## 🚨 **Security Incident Response**

### **Incident Response Plan**
```typescript
// src/services/incidentResponse.ts
export class IncidentResponse {
  static async handleSecurityIncident(
    incident: SecurityIncident
  ): Promise<void> {
    // Step 1: Immediate containment
    await this.containThreat(incident);
    
    // Step 2: Assessment
    const impact = await this.assessImpact(incident);
    
    // Step 3: Notification
    await this.notifyStakeholders(incident, impact);
    
    // Step 4: Investigation
    await this.startInvestigation(incident);
    
    // Step 5: Recovery
    await this.initiateRecovery(incident);
  }

  private static async containThreat(incident: SecurityIncident): Promise<void> {
    switch (incident.type) {
      case 'data_breach':
        await this.lockAffectedAccounts(incident.affectedUsers);
        break;
      case 'ddos_attack':
        await this.enableDDoSProtection();
        break;
      case 'malicious_script':
        await this.quarantineScript(incident.scriptId);
        break;
    }
  }

  private static async notifyStakeholders(
    incident: SecurityIncident,
    impact: ImpactAssessment
  ): Promise<void> {
    // Notify security team immediately
    await this.alertSecurityTeam(incident);
    
    // Notify affected users if required
    if (impact.severity >= 7) {
      await this.notifyAffectedUsers(incident.affectedUsers);
    }
    
    // Legal/compliance notification if required
    if (impact.requiresLegalNotification) {
      await this.notifyLegalTeam(incident);
    }
  }
}
```

---

## 📋 **Security Checklist**

### **Development Security**
```
□ Input validation implemented on all forms
□ Output encoding applied to prevent XSS
□ SQL injection prevention (parameterized queries)
□ Authentication implemented correctly
□ Authorization checks on all protected routes
□ Sensitive data encrypted before storage
□ API keys stored securely
□ Rate limiting implemented
□ Security headers configured
□ Content Security Policy implemented
```

### **Deployment Security**
```
□ HTTPS enforced across all environments
□ Security headers configured in production
□ Secrets properly managed (not in code)
□ Database security rules configured
□ API endpoints properly secured
□ Error messages don't expose sensitive data
□ Logging configured for security events
□ Monitoring alerts set up
□ Backup and recovery procedures tested
□ Incident response plan documented
```

### **Ongoing Security**
```
□ Regular security scans scheduled
□ Dependencies kept up to date
□ Security patches applied promptly
□ Access reviews conducted monthly
□ Security training completed by team
□ Penetration testing performed annually
□ Security policies reviewed quarterly
□ Compliance requirements met
```

---

## 🔧 **Security Tools & Resources**

### **Automated Security Tools**
```bash
# Security scanning tools
npm audit                    # Vulnerability scanning
npx snyk test               # Advanced vulnerability scanning
npm run security:headers    # Security headers check
npm run security:csp        # CSP validation
```

### **Security Testing**
```typescript
// Security test examples
describe('Security Tests', () => {
  test('should prevent XSS injection', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = InputSanitizer.sanitizeHTML(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });

  test('should enforce rate limits', async () => {
    const userId = 'test-user';
    const action = 'test-action';
    
    // Exceed rate limit
    for (let i = 0; i < 11; i++) {
      await RateLimiter.checkLimit(userId, action, 10, 60000);
    }
    
    const result = await RateLimiter.checkLimit(userId, action, 10, 60000);
    expect(result).toBe(false);
  });
});
```

---

## 📚 **Related Documentation**

- [🚀 CI/CD Pipeline](ci-cd.md)
- [📊 Monitoring Setup](../operations/monitoring.md)
- [🔧 Troubleshooting](../operations/troubleshooting.md)
- [🏗️ Architecture Overview](../architecture/overview.md)

---

**Documentação criada:** Janeiro 2025  
**Última atualização:** Janeiro 2025  
**Versão:** 1.0 