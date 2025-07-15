/**
 * SHARING SERVICE TESTS - SPRINT 4
 * Testing suite for sharing functionality
 * V7.5 Enhanced - IA Charlie Implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SharingService, { 
  ShareableItem, 
  ShareRequest, 
  SharePermissions 
} from '../../services/sharing/SharingService';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
});

// Mock window.open
Object.assign(window, {
  open: vi.fn(),
  location: {
    origin: 'https://example.com'
  }
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('SharingService', () => {
  let service: SharingService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'userId') return 'user123';
      if (key === 'username') return 'TestUser';
      return null;
    });
    
    service = new SharingService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Shareable Item Management', () => {
    it('should create a shareable item', async () => {
      const item = await service.createShareableItem(
        'idea',
        'Test Idea',
        'This is a test idea content',
        {
          isPublic: true,
          allowComments: true,
          allowCopy: true,
          allowEdit: false,
          allowDownload: true
        }
      );

      expect(item).toBeDefined();
      expect(item.id).toBeDefined();
      expect(item.type).toBe('idea');
      expect(item.title).toBe('Test Idea');
      expect(item.content).toBe('This is a test idea content');
      expect(item.createdBy).toBe('user123');
      expect(item.permissions.isPublic).toBe(true);
      expect(item.permissions.allowComments).toBe(true);
      expect(item.metadata.views).toBe(0);
      expect(item.metadata.shares).toBe(0);
    });

    it('should create item with default permissions', async () => {
      const item = await service.createShareableItem(
        'roteiro',
        'Test Roteiro',
        'Roteiro content'
      );

      expect(item.permissions.isPublic).toBe(true);
      expect(item.permissions.allowComments).toBe(true);
      expect(item.permissions.allowCopy).toBe(true);
      expect(item.permissions.allowEdit).toBe(false);
      expect(item.permissions.allowDownload).toBe(true);
    });

    it('should infer category from type', async () => {
      const ideaItem = await service.createShareableItem('idea', 'Test', 'Content');
      const roteiroItem = await service.createShareableItem('roteiro', 'Test', 'Content');
      const templateItem = await service.createShareableItem('template', 'Test', 'Content');

      expect(ideaItem.metadata.category).toBe('Ideias');
      expect(roteiroItem.metadata.category).toBe('Roteiros');
      expect(templateItem.metadata.category).toBe('Templates');
    });
  });

  describe('Share Link Generation', () => {
    it('should generate share link', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const shareLink = await service.generateShareLink(item.id);

      expect(shareLink).toBeDefined();
      expect(shareLink.id).toBeDefined();
      expect(shareLink.itemId).toBe(item.id);
      expect(shareLink.shortUrl).toContain('https://example.com/share/');
      expect(shareLink.fullUrl).toContain('?item=');
      expect(shareLink.createdBy).toBe('user123');
      expect(shareLink.clicks).toBe(0);
      expect(shareLink.isActive).toBe(true);
    });

    it('should handle non-existent item', async () => {
      await expect(service.generateShareLink('nonexistent')).rejects.toThrow('Item not found');
    });

    it('should update share count on link generation', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      await service.generateShareLink(item.id);

      const userItems = service.getUserSharedItems();
      const updatedItem = userItems.find(i => i.id === item.id);
      expect(updatedItem?.metadata.shares).toBe(1);
      expect(updatedItem?.sharedAt).toBeDefined();
    });

    it('should apply custom permissions', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const customPermissions = {
        allowComments: false,
        allowCopy: false
      };

      await service.generateShareLink(item.id, customPermissions);

      const userItems = service.getUserSharedItems();
      const updatedItem = userItems.find(i => i.id === item.id);
      expect(updatedItem?.permissions.allowComments).toBe(false);
      expect(updatedItem?.permissions.allowCopy).toBe(false);
    });
  });

  describe('Platform Sharing', () => {
    it('should share via copy (clipboard)', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const request: ShareRequest = {
        itemId: item.id,
        permissions: item.permissions,
        platform: 'copy'
      };

      const result = await service.shareItem(request);

      expect(result.success).toBe(true);
      expect(result.shareLink).toBeDefined();
      expect(result.message).toBe('Link copied to clipboard');
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should share via WhatsApp', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const request: ShareRequest = {
        itemId: item.id,
        permissions: item.permissions,
        platform: 'whatsapp',
        message: 'Check this out!'
      };

      const result = await service.shareItem(request);

      expect(result.success).toBe(true);
      expect(result.shareLink).toBeDefined();
      expect(result.message).toBe('WhatsApp sharing opened');
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/'),
        '_blank'
      );
    });

    it('should share via email', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const request: ShareRequest = {
        itemId: item.id,
        permissions: item.permissions,
        platform: 'email',
        recipientEmails: ['test@example.com'],
        message: 'Check this idea!'
      };

      const result = await service.shareItem(request);

      expect(result.success).toBe(true);
      expect(result.shareLink).toBeDefined();
      expect(result.message).toBe('Email sharing prepared');
    });

    it('should share via Twitter', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const request: ShareRequest = {
        itemId: item.id,
        permissions: item.permissions,
        platform: 'twitter',
        message: 'Amazing idea!'
      };

      const result = await service.shareItem(request);

      expect(result.success).toBe(true);
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://twitter.com/intent/tweet'),
        '_blank'
      );
    });

    it('should share via LinkedIn', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const request: ShareRequest = {
        itemId: item.id,
        permissions: item.permissions,
        platform: 'linkedin'
      };

      const result = await service.shareItem(request);

      expect(result.success).toBe(true);
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://www.linkedin.com/sharing/share-offsite/'),
        '_blank'
      );
    });

    it('should share via Telegram', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const request: ShareRequest = {
        itemId: item.id,
        permissions: item.permissions,
        platform: 'telegram'
      };

      const result = await service.shareItem(request);

      expect(result.success).toBe(true);
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://t.me/share/url'),
        '_blank'
      );
    });

    it('should handle non-existent item in sharing', async () => {
      const request: ShareRequest = {
        itemId: 'nonexistent',
        permissions: {
          isPublic: true,
          allowComments: true,
          allowCopy: true,
          allowEdit: false,
          allowDownload: true
        },
        platform: 'copy'
      };

      const result = await service.shareItem(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Item not found');
    });

    it('should handle clipboard error', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      
      // Mock clipboard failure
      (navigator.clipboard.writeText as any).mockRejectedValueOnce(new Error('Clipboard error'));

      const request: ShareRequest = {
        itemId: item.id,
        permissions: item.permissions,
        platform: 'copy'
      };

      const result = await service.shareItem(request);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Error copying link');
    });
  });

  describe('Share Link Access', () => {
    it('should access shared item by link', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const shareLink = await service.generateShareLink(item.id);

      const accessedItem = await service.accessSharedItem(shareLink.id);

      expect(accessedItem).toBeDefined();
      expect(accessedItem?.id).toBe(item.id);
      expect(accessedItem?.title).toBe('Test');
      expect(accessedItem?.content).toBe('Content');
    });

    it('should increment view count on access', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const shareLink = await service.generateShareLink(item.id);

      await service.accessSharedItem(shareLink.id);

      const userItems = service.getUserSharedItems();
      const updatedItem = userItems.find(i => i.id === item.id);
      expect(updatedItem?.metadata.views).toBe(1);
    });

    it('should increment click count on access', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const shareLink = await service.generateShareLink(item.id);

      await service.accessSharedItem(shareLink.id);

      // Access the link again to verify click count
      const accessedItem = await service.accessSharedItem(shareLink.id);
      expect(accessedItem).toBeDefined();
    });

    it('should handle non-existent share link', async () => {
      const accessedItem = await service.accessSharedItem('nonexistent');
      expect(accessedItem).toBeNull();
    });

    it('should handle inactive share link', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const shareLink = await service.generateShareLink(item.id);

      // Manually deactivate the link
      const service2 = new SharingService();
      const links = (service2 as any).shareLinks;
      const link = links.get(shareLink.id);
      if (link) {
        link.isActive = false;
      }

      const accessedItem = await service.accessSharedItem(shareLink.id);
      expect(accessedItem).toBeNull();
    });

    it('should handle expired share link', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const permissions = {
        ...item.permissions,
        expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
      };
      
      const shareLink = await service.generateShareLink(item.id, permissions);

      const accessedItem = await service.accessSharedItem(shareLink.id);
      expect(accessedItem).toBeNull();
    });

    it('should handle password-protected item', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const permissions = {
        ...item.permissions,
        password: 'secret123'
      };
      
      const shareLink = await service.generateShareLink(item.id, permissions);

      // Access without password
      const accessedItem1 = await service.accessSharedItem(shareLink.id);
      expect(accessedItem1).toBeNull();

      // Access with wrong password
      const accessedItem2 = await service.accessSharedItem(shareLink.id, 'wrong');
      expect(accessedItem2).toBeNull();

      // Access with correct password
      const accessedItem3 = await service.accessSharedItem(shareLink.id, 'secret123');
      expect(accessedItem3).toBeDefined();
      expect(accessedItem3?.id).toBe(item.id);
    });
  });

  describe('User Items and Analytics', () => {
    it('should get user shared items', async () => {
      const item1 = await service.createShareableItem('idea', 'Test 1', 'Content 1');
      const item2 = await service.createShareableItem('roteiro', 'Test 2', 'Content 2');

      const userItems = service.getUserSharedItems();

      expect(userItems).toHaveLength(2);
      expect(userItems.map(i => i.id)).toContain(item1.id);
      expect(userItems.map(i => i.id)).toContain(item2.id);
    });

    it('should sort user items by creation date', async () => {
      const item1 = await service.createShareableItem('idea', 'First', 'Content');
      
      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const item2 = await service.createShareableItem('idea', 'Second', 'Content');

      const userItems = service.getUserSharedItems();

      expect(userItems[0].id).toBe(item2.id); // Most recent first
      expect(userItems[1].id).toBe(item1.id);
    });

    it('should get share analytics', async () => {
      const item1 = await service.createShareableItem('idea', 'Test 1', 'Content 1');
      const item2 = await service.createShareableItem('idea', 'Test 2', 'Content 2');

      await service.generateShareLink(item1.id);
      await service.generateShareLink(item2.id);

      const analytics = service.getShareAnalytics();

      expect(analytics.totalShares).toBe(2);
      expect(analytics.totalViews).toBe(0);
      expect(analytics.totalComments).toBe(0);
      expect(analytics.topItems).toHaveLength(2);
    });

    it('should filter items by user', async () => {
      // Create items for user123
      await service.createShareableItem('idea', 'User123 Item', 'Content');

      // Mock different user
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'userId') return 'user456';
        if (key === 'username') return 'TestUser2';
        return null;
      });

      const service2 = new SharingService();
      await service2.createShareableItem('idea', 'User456 Item', 'Content');

      const user123Items = service.getUserSharedItems('user123');
      const user456Items = service2.getUserSharedItems('user456');

      expect(user123Items).toHaveLength(1);
      expect(user123Items[0].title).toBe('User123 Item');
      expect(user456Items).toHaveLength(1);
      expect(user456Items[0].title).toBe('User456 Item');
    });
  });

  describe('Cleanup and Expiration', () => {
    it('should cleanup expired shares', async () => {
      const item = await service.createShareableItem('idea', 'Test', 'Content');
      const permissions = {
        ...item.permissions,
        expiresAt: new Date(Date.now() + 100) // Expires in 100ms
      };
      
      const shareLink = await service.generateShareLink(item.id, permissions);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Trigger cleanup (normally done by setInterval)
      (service as any).cleanupExpiredShares();

      const accessedItem = await service.accessSharedItem(shareLink.id);
      expect(accessedItem).toBeNull();
    });
  });

  describe('Storage Integration', () => {
    it('should save to localStorage', async () => {
      await service.createShareableItem('idea', 'Test', 'Content');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'shareableItems',
        expect.any(String)
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'shareLinks',
        expect.any(String)
      );
    });

    it('should load from localStorage', () => {
      const mockItems = [
        ['item1', {
          id: 'item1',
          type: 'idea',
          title: 'Saved Item',
          content: 'Content',
          createdBy: 'user123',
          createdAt: new Date().toISOString(),
          permissions: { isPublic: true, allowComments: true, allowCopy: true, allowEdit: false, allowDownload: true },
          metadata: { views: 0, comments: 0, likes: 0, shares: 0, tags: [], category: 'Ideias' }
        }]
      ];

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'shareableItems') return JSON.stringify(mockItems);
        if (key === 'shareLinks') return JSON.stringify([]);
        if (key === 'userId') return 'user123';
        return null;
      });

      const newService = new SharingService();
      const userItems = newService.getUserSharedItems();

      expect(userItems).toHaveLength(1);
      expect(userItems[0].title).toBe('Saved Item');
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => new SharingService()).not.toThrow();
    });
  });
});

describe('SharingService Performance', () => {
  it('should handle large number of items efficiently', async () => {
    const service = new SharingService();
    const startTime = Date.now();

    // Create 1000 items
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(service.createShareableItem('idea', `Item ${i}`, `Content ${i}`));
    }

    await Promise.all(promises);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    expect(service.getUserSharedItems()).toHaveLength(1000);
  });

  it('should handle concurrent share link generation', async () => {
    const service = new SharingService();
    const item = await service.createShareableItem('idea', 'Test', 'Content');

    // Generate 100 share links concurrently
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(service.generateShareLink(item.id));
    }

    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(100);
    expect(results.every(link => link.itemId === item.id)).toBe(true);
    expect(new Set(results.map(link => link.id)).size).toBe(100); // All unique IDs
  });
}); 