export interface FormData {
  platform: string;
  format: string;
  goal: string;
  audience: string;
  tone: string;
  subject: string;
  duration: string;
  details: string;
  otherGoal: string;
  otherAudience: string;
  otherTone: string;
  otherFormat: string;
  customPlatform?: string;
  customFormat?: string;
  hook?: string;
  callToAction?: string;
  keyPoints?: string;
}

export interface SavedScript {
  id: string;
  title: string;
  script: string;
  scriptContent: string;
  createdAt: any; // Using `any` for Firebase ServerTimestamp
  formData: FormData;
  userId: string;
}