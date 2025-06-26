// Enhanced Types for Dashboard Phase 2
import { Timestamp } from 'firebase/firestore';

export type ProjectStatus = 'draft' | 'completed' | 'published';
export type PlatformType = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'linkedin';
export type FormatType = 'short' | 'reel' | 'story' | 'post' | 'video' | 'carousel';
export type SortOption = 'date' | 'title' | 'platform' | 'wordCount' | 'editCount' | 'viewCount';

export interface EnhancedProject {
  // Core fields
  id: string;
  userId: string;
  title: string;
  content: string;
  formData: ScriptFormData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Organization fields
  tags: string[];
  folderId?: string;
  isFavorite: boolean;
  status: ProjectStatus;
  
  // Metrics fields
  version: number;
  wordCount: number;
  estimatedDuration: number;
  lastEditedAt?: Timestamp;
  
  // Engagement fields
  viewCount: number;
  editCount: number;
  
  // Sharing fields
  isShared: boolean;
  shareLink?: string;
  sharedAt?: Timestamp;
  
  // Metadata fields
  thumbnailUrl?: string;
  originalPrompt?: string;
  aiModelUsed?: string;
  generationTime?: number;
}

export interface ScriptFormData {
  platform: PlatformType;
  format: FormatType;
  topic: string;
  objective: string;
  targetAudience: string;
  tone: string;
  duration?: number;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  description?: string;
  usageCount: number;
  lastUsedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isSystem: boolean;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
  path: string;
  level: number;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  isDefault: boolean;
  projectCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FilterOptions {
  platforms?: PlatformType[];
  formats?: FormatType[];
  status?: ProjectStatus[];
  tags?: string[];
  folderId?: string;
  isFavorite?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DashboardStats {
  totalProjects: number;
  projectsThisMonth: number;
  totalWords: number;
  averageWordsPerScript: number;
  mostUsedPlatform: PlatformType;
  mostUsedFormat: FormatType;
  productivityTrend: TrendData[];
  timeSpentWriting: number;
  completionRate: number;
}

export interface TrendData {
  date: string;
  projectsCreated: number;
  wordsWritten: number;
  timeSpent: number;
}
