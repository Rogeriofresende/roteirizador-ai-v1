/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly VITE_GOOGLE_GEMINI_API_KEY: string;
  readonly VITE_CLARITY_ID: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_ERROR_MONITORING_ENABLED: string;
  readonly VITE_ERROR_MONITORING_ENDPOINT: string;
  readonly VITE_ERROR_MONITORING_MAX_ERRORS: string;
  readonly VITE_ERROR_MONITORING_TIME_WINDOW: string;
  readonly VITE_ANALYTICS_ENABLED: string;
  readonly VITE_CLARITY_ENABLED: string;
  readonly VITE_CLARITY_PROJECT_ID: string;
  readonly VITE_GA4_MEASUREMENT_ID: string;
  readonly VITE_TRACKING_ENABLED: string;
  readonly VITE_TALLY_ENABLED: string;
  readonly VITE_TALLY_FEEDBACK_FORM_ID: string;
  readonly VITE_TALLY_NPS_FORM_ID: string;
  readonly VITE_TALLY_FEATURES_FORM_ID: string;
  readonly VITE_TALLY_BUGS_FORM_ID: string;
  readonly VITE_API_URL: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_PWA_ENABLED: string;
  readonly VITE_COLLABORATION_ENABLED: string;
  readonly VITE_VOICE_SYNTHESIS_ENABLED: string;
  readonly VITE_ADVANCED_ANALYTICS_ENABLED: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_BUILD_TIME: string;
  readonly VITE_LOG_LEVEL: string;
  readonly VITE_CONSOLE_LOGGING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 