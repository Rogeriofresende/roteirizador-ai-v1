export const OTHER_KEY = "other";

export const PLATFORM_OPTIONS = [
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter/X" },
  { value: OTHER_KEY, label: "Outro" },
];

// Platform mapping for consistency between labels and keys
export const PLATFORM_MAPPING: { [label: string]: string } = {
  "YouTube": "youtube",
  "Instagram": "instagram", 
  "TikTok": "tiktok",
  "Facebook": "facebook",
  "LinkedIn": "linkedin",
  "Twitter/X": "twitter",
  "Outro": OTHER_KEY
};

// Reverse mapping for getting label from value
export const PLATFORM_LABELS: { [value: string]: string } = {
  "youtube": "YouTube",
  "instagram": "Instagram",
  "tiktok": "TikTok", 
  "facebook": "Facebook",
  "linkedin": "LinkedIn",
  "twitter": "Twitter/X",
  [OTHER_KEY]: "Outro"
};

export const FORMAT_OPTIONS: { [key: string]: { value: string; label: string }[] } = {
  youtube: [
    { value: "short", label: "Short (até 60s)" },
    { value: "long", label: "Vídeo Longo (acima de 60s)" },
  ],
  instagram: [
    { value: "reels", label: "Reels (até 90s)" },
    { value: "stories", label: "Stories (até 60s)" },
    { value: "post", label: "Post (imagem/carrossel)" },
  ],
  tiktok: [{ value: "tiktok", label: "TikTok (até 3min)" }],
  facebook: [
    { value: "reels", label: "Reels (até 90s)" },
    { value: "stories", label: "Stories (até 60s)" },
    { value: "video", label: "Vídeo" },
  ],
  linkedin: [
    { value: "post", label: "Post" },
    { value: "article", label: "Artigo" },
    { value: "video", label: "Vídeo" },
  ],
  twitter: [
    { value: "tweet", label: "Tweet" },
    { value: "thread", label: "Thread" },
    { value: "video", label: "Vídeo" },
  ],
  [OTHER_KEY]: [{ value: "custom", label: "Personalizado" }],
};

// Helper function to get platform value from label (fixes the bug)
export const getPlatformValue = (label: string): string => {
  return PLATFORM_MAPPING[label] || label.toLowerCase();
};

// Helper function to get platform label from value
export const getPlatformLabel = (value: string): string => {
  return PLATFORM_LABELS[value] || value;
};

export const GOAL_OPTIONS = [
  { value: "educate", label: "Educar" },
  { value: "entertain", label: "Entreter" },
  { value: "sell", label: "Vender" },
  { value: "inform", label: "Informar" },
  { value: "inspire", label: "Inspirar" },
];

export const AUDIENCE_OPTIONS = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "expert", label: "Especialista" },
  { value: "general", label: "Público Geral" },
];

export const TONE_OPTIONS = [
  { value: "formal", label: "Formal" },
  { value: "informal", label: "Informal" },
  { value: "humorous", label: "Humorístico" },
  { value: "serious", label: "Sério" },
  { value: "motivational", label: "Motivacional" },
];

export const INITIAL_FORM_DATA = {
  platform: "",
  format: "",
  videoGoal: "",
  targetAudience: "",
  toneOfVoice: "",
  videoTopic: "",
  duration: "60",
  details: "",
  otherGoal: "",
  customAudience: "",
  customTone: "",
  otherFormat: "",
  customPlatform: "",
  customFormat: "",
  hook: "",
  callToAction: "",
  keyPoints: "",
}; 