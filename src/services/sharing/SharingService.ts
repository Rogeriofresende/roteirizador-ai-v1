/**
 * SHARING SERVICE - SPRINT 4
 * Advanced sharing system for ideas and content
 * V7.5 Enhanced - IA Alpha Implementation
 */

// Types and Interfaces
export interface ShareableItem {
  id: string;
  type: 'idea' | 'roteiro' | 'template' | 'session';
  title: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  sharedAt?: Date;
  permissions: SharePermissions;
  metadata: ShareMetadata;
}

export interface SharePermissions {
  isPublic: boolean;
  allowComments: boolean;
  allowCopy: boolean;
  allowEdit: boolean;
  allowDownload: boolean;
  expiresAt?: Date;
  password?: string;
}

export interface ShareMetadata {
  views: number;
  comments: number;
  likes: number;
  shares: number;
  tags: string[];
  category?: string;
}

export interface ShareLink {
  id: string;
  shortUrl: string;
  fullUrl: string;
  itemId: string;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  clicks: number;
  isActive: boolean;
}

export interface ShareRequest {
  itemId: string;
  permissions: SharePermissions;
  recipientEmails?: string[];
  message?: string;
  platform?: 'email' | 'whatsapp' | 'telegram' | 'twitter' | 'linkedin' | 'copy';
}

export interface ShareAnalytics {
  totalShares: number;
  totalViews: number;
  totalComments: number;
  platformBreakdown: Record<string, number>;
  viewsOverTime: Array<{ date: Date; views: number }>;
  topItems: Array<{ item: ShareableItem; stats: ShareMetadata }>;
}

// Sharing Service Implementation
export class SharingService {
  private shareLinks: Map<string, ShareLink> = new Map();
  private shareableItems: Map<string, ShareableItem> = new Map();
  private analytics: Map<string, ShareAnalytics> = new Map();

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize sharing service
   */
  private initializeService(): void {
    // Load shared items from localStorage
    this.loadFromStorage();
    
    // Set up periodic cleanup for expired shares
    setInterval(() => {
      this.cleanupExpiredShares();
    }, 60000); // Check every minute
  }

  /**
   * Create a shareable item
   */
  public async createShareableItem(
    type: ShareableItem['type'],
    title: string,
    content: string,
    permissions: SharePermissions = {
      isPublic: true,
      allowComments: true,
      allowCopy: true,
      allowEdit: false,
      allowDownload: true
    }
  ): Promise<ShareableItem> {
    const itemId = this.generateShareId();
    
    const item: ShareableItem = {
      id: itemId,
      type,
      title,
      content,
      createdBy: this.getCurrentUserId(),
      createdAt: new Date(),
      permissions,
      metadata: {
        views: 0,
        comments: 0,
        likes: 0,
        shares: 0,
        tags: [],
        category: this.inferCategory(type, content)
      }
    };

    this.shareableItems.set(itemId, item);
    this.saveToStorage();
    
    console.log('✅ Shareable item created:', item.id);
    return item;
  }

  /**
   * Generate share link for an item
   */
  public async generateShareLink(itemId: string, customPermissions?: Partial<SharePermissions>): Promise<ShareLink> {
    const item = this.shareableItems.get(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    // Update permissions if provided
    if (customPermissions) {
      item.permissions = { ...item.permissions, ...customPermissions };
    }

    const linkId = this.generateShareId();
    const baseUrl = window.location.origin;
    const shortUrl = `${baseUrl}/share/${linkId}`;
    const fullUrl = `${baseUrl}/share/${linkId}?item=${itemId}`;

    const shareLink: ShareLink = {
      id: linkId,
      shortUrl,
      fullUrl,
      itemId,
      createdBy: this.getCurrentUserId(),
      createdAt: new Date(),
      expiresAt: item.permissions.expiresAt,
      clicks: 0,
      isActive: true
    };

    this.shareLinks.set(linkId, shareLink);
    item.sharedAt = new Date();
    item.metadata.shares++;
    
    this.saveToStorage();
    
    console.log('🔗 Share link generated:', shareLink.shortUrl);
    return shareLink;
  }

  /**
   * Share item via different platforms
   */
  public async shareItem(request: ShareRequest): Promise<{ success: boolean; shareLink?: ShareLink; message?: string }> {
    try {
      const item = this.shareableItems.get(request.itemId);
      if (!item) {
        return { success: false, message: 'Item not found' };
      }

      const shareLink = await this.generateShareLink(request.itemId, request.permissions);
      
      switch (request.platform) {
        case 'email':
          return await this.shareViaEmail(shareLink, item, request.recipientEmails, request.message);
        
        case 'whatsapp':
          return await this.shareViaWhatsApp(shareLink, item, request.message);
        
        case 'telegram':
          return await this.shareViaTelegram(shareLink, item, request.message);
        
        case 'twitter':
          return await this.shareViaTwitter(shareLink, item, request.message);
        
        case 'linkedin':
          return await this.shareViaLinkedIn(shareLink, item, request.message);
        
        case 'copy':
          return await this.copyToClipboard(shareLink, item);
        
        default:
          return { success: true, shareLink, message: 'Link generated successfully' };
      }
    } catch (error) {
      console.error('❌ Error sharing item:', error);
      return { success: false, message: 'Error sharing item' };
    }
  }

  /**
   * Access shared item by link
   */
  public async accessSharedItem(linkId: string, password?: string): Promise<ShareableItem | null> {
    const shareLink = this.shareLinks.get(linkId);
    if (!shareLink || !shareLink.isActive) {
      return null;
    }

    // Check expiration
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      shareLink.isActive = false;
      this.saveToStorage();
      return null;
    }

    const item = this.shareableItems.get(shareLink.itemId);
    if (!item) {
      return null;
    }

    // Check password if required
    if (item.permissions.password && item.permissions.password !== password) {
      return null;
    }

    // Update analytics
    shareLink.clicks++;
    item.metadata.views++;
    this.updateAnalytics(item);
    
    this.saveToStorage();
    
    console.log('👁️ Item accessed:', item.id);
    return item;
  }

  /**
   * Get user's shared items
   */
  public getUserSharedItems(userId?: string): ShareableItem[] {
    const currentUserId = userId || this.getCurrentUserId();
    return Array.from(this.shareableItems.values())
      .filter(item => item.createdBy === currentUserId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get share analytics
   */
  public getShareAnalytics(userId?: string): ShareAnalytics {
    const currentUserId = userId || this.getCurrentUserId();
    const userItems = this.getUserSharedItems(currentUserId);
    
    const analytics: ShareAnalytics = {
      totalShares: userItems.reduce((sum, item) => sum + item.metadata.shares, 0),
      totalViews: userItems.reduce((sum, item) => sum + item.metadata.views, 0),
      totalComments: userItems.reduce((sum, item) => sum + item.metadata.comments, 0),
      platformBreakdown: {},
      viewsOverTime: [],
      topItems: userItems
        .sort((a, b) => b.metadata.views - a.metadata.views)
        .slice(0, 10)
        .map(item => ({ item, stats: item.metadata }))
    };

    return analytics;
  }

  /**
   * Platform-specific sharing methods
   */
  private async shareViaEmail(shareLink: ShareLink, item: ShareableItem, emails?: string[], message?: string): Promise<{ success: boolean; shareLink: ShareLink; message: string }> {
    const subject = `${item.title} - Roteirar IA`;
    const body = `${message || 'Confira este conteúdo:'}\n\n${item.title}\n\n${shareLink.shortUrl}`;
    
    if (emails && emails.length > 0) {
      // In a real app, this would send actual emails
      console.log('📧 Email sent to:', emails);
    } else {
      // Open default email client
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    }
    
    return { success: true, shareLink, message: 'Email sharing prepared' };
  }

  private async shareViaWhatsApp(shareLink: ShareLink, item: ShareableItem, message?: string): Promise<{ success: boolean; shareLink: ShareLink; message: string }> {
    const text = `${message || 'Confira este conteúdo:'}\n\n*${item.title}*\n\n${shareLink.shortUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    window.open(whatsappUrl, '_blank');
    return { success: true, shareLink, message: 'WhatsApp sharing opened' };
  }

  private async shareViaTelegram(shareLink: ShareLink, item: ShareableItem, message?: string): Promise<{ success: boolean; shareLink: ShareLink; message: string }> {
    const text = `${message || 'Confira este conteúdo:'}\n\n${item.title}\n\n${shareLink.shortUrl}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareLink.shortUrl)}&text=${encodeURIComponent(text)}`;
    
    window.open(telegramUrl, '_blank');
    return { success: true, shareLink, message: 'Telegram sharing opened' };
  }

  private async shareViaTwitter(shareLink: ShareLink, item: ShareableItem, message?: string): Promise<{ success: boolean; shareLink: ShareLink; message: string }> {
    const text = `${message || 'Confira este conteúdo:'} ${item.title} ${shareLink.shortUrl}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    
    window.open(twitterUrl, '_blank');
    return { success: true, shareLink, message: 'Twitter sharing opened' };
  }

  private async shareViaLinkedIn(shareLink: ShareLink, item: ShareableItem, message?: string): Promise<{ success: boolean; shareLink: ShareLink; message: string }> {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink.shortUrl)}`;
    
    window.open(linkedinUrl, '_blank');
    return { success: true, shareLink, message: 'LinkedIn sharing opened' };
  }

  private async copyToClipboard(shareLink: ShareLink, item: ShareableItem): Promise<{ success: boolean; shareLink: ShareLink; message: string }> {
    try {
      await navigator.clipboard.writeText(shareLink.shortUrl);
      return { success: true, shareLink, message: 'Link copied to clipboard' };
    } catch (error) {
      console.error('❌ Error copying to clipboard:', error);
      return { success: false, shareLink, message: 'Error copying link' };
    }
  }

  /**
   * Utility methods
   */
  private generateShareId(): string {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || 'anonymous';
  }

  private inferCategory(type: ShareableItem['type'], content: string): string {
    switch (type) {
      case 'idea':
        return 'Ideias';
      case 'roteiro':
        return 'Roteiros';
      case 'template':
        return 'Templates';
      case 'session':
        return 'Colaboração';
      default:
        return 'Geral';
    }
  }

  private updateAnalytics(item: ShareableItem): void {
    const userId = item.createdBy;
    const existing = this.analytics.get(userId);
    
    if (existing) {
      existing.totalViews++;
    } else {
      this.analytics.set(userId, {
        totalShares: 1,
        totalViews: 1,
        totalComments: 0,
        platformBreakdown: {},
        viewsOverTime: [],
        topItems: []
      });
    }
  }

  private cleanupExpiredShares(): void {
    const now = new Date();
    let cleaned = 0;
    
    for (const [id, link] of this.shareLinks) {
      if (link.expiresAt && link.expiresAt < now) {
        link.isActive = false;
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired share links`);
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const storedItems = localStorage.getItem('shareableItems');
      if (storedItems) {
        const items = JSON.parse(storedItems);
        this.shareableItems = new Map(items);
      }

      const storedLinks = localStorage.getItem('shareLinks');
      if (storedLinks) {
        const links = JSON.parse(storedLinks);
        this.shareLinks = new Map(links);
      }
    } catch (error) {
      console.error('❌ Error loading from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('shareableItems', JSON.stringify(Array.from(this.shareableItems.entries())));
      localStorage.setItem('shareLinks', JSON.stringify(Array.from(this.shareLinks.entries())));
    } catch (error) {
      console.error('❌ Error saving to storage:', error);
    }
  }
}

export default SharingService; 